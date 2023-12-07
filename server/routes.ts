import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { AIAgent, Asset, Friend, Interest, Media, Post, User, WebSession } from "./app";
import { AssetDoc } from "./concepts/asset";
import { MediaDoc } from "./concepts/media";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const user_object = await User.getUserById(user);
    return user_object;
  }

  @Router.get("/users")
  async getUsers() {
    const users = await User.getUsers();
    return users;
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    const user = await User.getUserByUsername(username);
    return user;
  }

  @Router.get("/usersSearchByUsername")
  async searchUsersByUsername(username?: string) {
    let users;
    if (username) {
      users = await User.searchUsersByUsername(username);
    } else {
      users = await User.getUsers();
    }
    return users;
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string, first_name: string, last_name: string, profile_photo: string) {
    WebSession.isLoggedOut(session);
    const user = await User.create(username, password, first_name, last_name, profile_photo);
    if (user.user?._id) {
      await Interest.create(user.user?._id);
      await AIAgent.create(user.user?._id);
    }
    return user.user;
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);

    // Delete all media associated with the User
    const user_media = await Media.getMediaByCreator(user);
    await Promise.all(user_media.map((media) => Media.delete(media._id, user)));

    // Delete all posts associated with the User
    const posts = await Post.getPostsByAuthor(user);
    for (const post of posts) {
      // Delete all of the comments underneath the post
      // await Comment.deleteByRoot(post._id);

      await Post.delete(post._id);
    }

    // Delete user Interests
    await Interest.delete(user);

    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  ///////////////
  //// MEDIA ////
  ///////////////

  @Router.post("/media")
  async createMedia(session: WebSessionDoc, media_url: string, target?: ObjectId) {
    const user = WebSession.getUser(session);
    const media = await Media.create(user, media_url, target);
    return { msg: media.msg, media: media.media };
  }

  @Router.get("/media/:id")
  async getMediaById(id: ObjectId) {
    const media = await Media.getMediaById(id);
    return { msg: `Successfully retrieved the media '${id}'`, media: media };
  }

  @Router.get("/media/byUsername/:username")
  async getMediaByUsername(username: string) {
    const user = await User.getUserByUsername(username);
    const media = await Media.getMediaByCreator(user._id);
    return { msg: `Successfully retrieved the media ${user.username} uploaded`, media: media };
  }

  @Router.get("/media/byTarget/:target")
  async getMediaByTarget(target: ObjectId) {
    return await Media.getMediaByTarget(target);
  }

  @Router.patch("/media/:_id")
  async updateMedia(session: WebSessionDoc, _id: ObjectId, update: Partial<MediaDoc>) {
    const user = WebSession.getUser(session);
    await Media.isCreator(_id, user, true);
    return await Media.update(_id, update);
  }

  @Router.delete("/media/:_id")
  async deleteMedia(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Media.isCreator(_id, user, true);
    return Media.delete(_id, user);
  }

  ///////////////
  //// POSTS ////
  ///////////////

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getPostsByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  /////////////////
  //// FRIENDS ////
  /////////////////

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }

  @Router.patch("/interests")
  async addInterest(session: WebSessionDoc, interests: Array<string>) {
    const user = WebSession.getUser(session);
    return await Interest.update(user, interests);
  }

  @Router.get("/interests")
  async getInterests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return (await Interest.getByUser(user)).interests;
  }

  @Router.get("/news")
  async addNews(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const tmp = await Interest.getNews(user);
    return tmp;
  }

  @Router.get("/chatbox")
  async addMessages(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await AIAgent.getByUser(user);
  }

  //////////////////
  //// AI AGENT ////
  //////////////////

  @Router.patch("/aiagent")
  async getHelp(session: WebSessionDoc, decision: string) {
    const user = WebSession.getUser(session);
    await AIAgent.send(user, decision);
    const response = await AIAgent.getResponse(user, decision);
    return response;
  }

  @Router.patch("/aiagent/send")
  async send(session: WebSessionDoc, decision: string) {
    const user = WebSession.getUser(session);
    return await AIAgent.send(user, decision);
  }

  @Router.patch("/aiagent/receive")
  async receive(session: WebSessionDoc, decision: string) {
    const user = WebSession.getUser(session);
    const response = await AIAgent.getResponse(user, decision);
    return response;
  }

  ///////////
  // ASSET //
  ///////////

  @Router.get("/assets")
  async getAssets() {
    const assets = await Asset.getAssets();
    return Responses.assets(assets);
  }

  @Router.get("/assets/search/:name")
  async getAssetsByName(asset_name?: string) {
    let assets;
    if (asset_name) {
      assets = await Asset.searchAssetsByName(asset_name);
    } else {
      assets = await Asset.getAssets();
    }
    return Responses.assets(assets);
  }

  @Router.get("/assetsUserIsShareholderOf")
  async getAssetsUserIsShareholderOf(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const assets = await Asset.getAssetsByShareholderId(user);
    return Responses.assets(assets);
  }

  @Router.get("/assets/shareholders/:username")
  async getAssetsByShareholderUsername(username: string) {
    const user = await User.getUserByUsername(username);
    const assets = await Asset.getAssetsByShareholderId(user._id);
    return Responses.assets(assets);
  }

  @Router.get("/asset/id/:id")
  async getAssetById(id: ObjectId) {
    const asset = await Asset.getAssetById(id);
    return Responses.asset(asset);
  }

  @Router.get("/asset/ticker/:ticker")
  async getAssetByTicker(asset_ticker: string) {
    const asset = await Asset.getAssetByTicker(asset_ticker);
    return Responses.asset(asset);
  }

  @Router.get("/asset/name/:name")
  async getAssetByName(asset_name: string) {
    const asset = await Asset.getAssetByName(asset_name);
    return Responses.asset(asset);
  }

  @Router.post("/asset")
  async createAsset(session: WebSessionDoc, asset_name: string, asset_ticker: string, current_price: number) {
    const asset = await Asset.create(asset_name, asset_ticker, current_price);
    return { msg: asset.msg, asset: asset.asset };
  }

  @Router.put("/assets/:ticker/:shareholder")
  async addAssetShareholder(session: WebSessionDoc, asset_ticker: string, user?: ObjectId) {
    if (!user) {
      user = WebSession.getUser(session);
    }
    const asset = await Asset.getAssetByTicker(asset_ticker);
    const shareholders = await Asset.addShareholderToAsset(asset._id, user);
    return {
      msg: `User has been successfully added to '${asset.ticker}'s list of shareholders`,
      shareholders: shareholders,
    };
  }

  @Router.delete("/assets/:ticker/:shareholder")
  async removeAssetShareholder(session: WebSessionDoc, asset_ticker: string, user?: ObjectId) {
    if (!user) {
      user = WebSession.getUser(session);
    }
    const asset = await Asset.getAssetByTicker(asset_ticker);
    await Asset.removeShareholderFromAsset(asset._id, user);
    return { msg: `User '${user}' has successfully been removed from '${asset.ticker}'s list of shareholders` };
  }

  @Router.patch("/assets/:_id")
  async updateAsset(session: WebSessionDoc, asset_id: ObjectId, update: Partial<AssetDoc>) {
    const user = WebSession.getUser(session);
    await Asset.isShareholder(asset_id, user);
    return await Asset.update(asset_id, update);
  }

  @Router.delete("/assets/:_id")
  async deleteAsset(session: WebSessionDoc, asset_id: ObjectId) {
    const user = WebSession.getUser(session);
    await Asset.isShareholder(asset_id, user, true);
    return Asset.delete(asset_id);
  }

  @Router.get("/assets/price")
  async getCurrentPrice() {
    return await Asset.getHistory();
  }
}

export default getExpressRouter(new Routes());
