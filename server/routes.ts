import { ObjectId } from "mongodb";

import { AIAgent, Asset, Friend, Interest, Media, Money, Portfolio, Post, User, WebSession } from "./app";
import { NotAllowedError } from "./concepts/errors";
import { MediaDoc } from "./concepts/media";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import { Router, getExpressRouter } from "./framework/router";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
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

  @Router.get("/users/search/:username")
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
  async createUser(session: WebSessionDoc, username: string, password: string, firstName: string, lastName: string, profilePhoto: string) {
    WebSession.isLoggedOut(session);
    const user = await User.create(username, password, firstName, lastName, profilePhoto);
    if (user.user?._id) {
      await Interest.create(user.user?._id);
      await AIAgent.create(user.user?._id);
      await Money.create(user.user?._id);
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
    await AIAgent.deleteByUser(user);
    await Portfolio.deleteByUser(user);
    await Asset.deleteByUser(user);

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

  @Router.get("/media/:_id")
  async getMediaById(_id: ObjectId) {
    const media = await Media.getMediaById(_id);
    return { msg: `Successfully retrieved the media '${_id}'`, media: media };
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

  @Router.get("/friends/:username")
  async getFriendsOfUser(username: string) {
    return await User.idsToUsernames(await Friend.getFriends((await User.getUserByUsername(username))._id));
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
    void AIAgent.getResponse(user, decision);
    return;
  }

  ///////////////
  //// Money ////
  ///////////////

  @Router.get("/balance")
  async getBalance(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Money.getBalance(user);
  }

  @Router.patch("/balance/withdraw/:amount")
  async withdraw(session: WebSessionDoc, amount: string) {
    const user = WebSession.getUser(session);
    return await Money.withdraw(user, parseInt(amount));
  }

  @Router.patch("/balance/deposit/:amount")
  async deposit(session: WebSessionDoc, amount: string) {
    const user = WebSession.getUser(session);
    return await Money.deposit(user, parseInt(amount));
  }

  @Router.get("/totalwealth")
  async getTotalWealth(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const cash = await Money.getBalance(user);
    const assets = await Portfolio.getUserAssets(user);
    const assetsValue = await Asset.getAssetsValue(assets);
    return cash + assetsValue;
  }

  ///////////
  // ASSET //
  ///////////

  @Router.get("/assets/price/:ticker")
  async getCurrentPrice(ticker: string) {
    return await Asset.getCurrentPrice(ticker);
  }

  @Router.get("/assets/history/:ticker/:timeSeries")
  async getHistoryPrice(ticker: string, timeSeries: string) {
    return await Asset.getHistory(ticker, timeSeries);
  }

  ////////////////////
  //// Portfolios ////
  ////////////////////

  @Router.get("/portfolios")
  async getPublicPortfolios(session: WebSessionDoc, username: string) {
    const viewer = WebSession.getUser(session);
    const user = await User.getUserByUsername(username);
    const portfolios = await Portfolio.getViewablePortfoliosByOwner(user._id, viewer);
    return portfolios;
  }

  @Router.get("/myPortfolios")
  async getAllPortfoliosBySelf(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const portfolios = await Portfolio.getPortfoliosByOwner(user);
    return portfolios;
  }

  @Router.post("/portfolios")
  async createPortfolio(session: WebSessionDoc, name: string, isPublic: boolean) {
    const user = WebSession.getUser(session);
    const username = (await User.getUserById(user)).username;
    return Portfolio.create(name, user, username, isPublic);
  }

  @Router.delete("/portfolios/:_id")
  async deletePortfolio(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const portfolio = await Portfolio.getPortfolioById(_id);
    if (!user.equals(portfolio.owner)) {
      throw new NotAllowedError("Cannot delete a portfolio which user does not own!");
    }
    return Portfolio.deleteOne(_id);
  }

  @Router.patch("/buy/:portfolioName/:ticker/:quantity")
  async purchaseAsset(session: WebSessionDoc, portfolioName: string, ticker: string, quantity: string) {
    const user = WebSession.getUser(session);

    const currentPrice = Asset.getCurrentPrice(ticker);

    const cost: number = parseInt(quantity) * (await currentPrice);

    const canAfford = Money.hasEnough(user, cost);

    if (await canAfford) {
      await Money.withdraw(user, cost);
      const asset = await Asset.create(ticker, user, parseInt(quantity));
      await Portfolio.addAssetToPortfolio(user, portfolioName, asset.asset._id);
    } else {
      throw new Error("Not enough credit");
    }
    return { msg: `Successfully purchased ${quantity} shares of ${ticker} at ${currentPrice} per share for a total of $${cost}` };
  }

  @Router.patch("/sell/:portfolioId/:assetId")
  async sellAsset(session: WebSessionDoc, portfolioId: ObjectId, assetId: ObjectId) {
    const user = WebSession.getUser(session);

    const asset = await Asset.getAssetById(assetId);

    const currentPrice = await Asset.getCurrentPrice(asset.ticker);

    const value = currentPrice * asset.quantity;

    await Money.deposit(user, value);

    await Asset.deleteOne(assetId);

    await Portfolio.removeAssetFromPortfolio(portfolioId, assetId.toString());
  }

  @Router.get("/portfolios/:_id/value")
  async getPortfolioValue(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const isPublic = await Portfolio.portfolioIsPublic(_id);
    const portfolioOwner = await Portfolio.getPortfolioOwner(_id);
    if (!isPublic && !user.equals(portfolioOwner)) {
      throw new NotAllowedError("Cannot view private portfolio which the user does not own");
    }
    const assetIds = await Portfolio.getPortfolioShares(_id);
    let value = 0;
    for (const _id of assetIds) {
      const asset = await Asset.getAssetById(_id);
      value += await Asset.getCurrentPrice(asset.ticker);
    }
    return value;
  }

  @Router.get("/portfolios/:_id/assets")
  async getPortfolioAssets(_id: ObjectId) {
    const assetIds = await Portfolio.getAssets(_id);
    return await Asset.getManyAssetsById(assetIds!);
  }

  @Router.post("/portfolios/copy/:_id/:name")
  async copyInvest(session: WebSessionDoc, _id: ObjectId, name: string) {
    const assetIds = await Portfolio.getAssets(_id);
    const assets = await Asset.getManyAssetsById(assetIds!);
    await this.createPortfolio(session, name, true);
    for (const asset of assets) {
      const ticker = asset?.ticker;
      const quantity = asset?.quantity;
      await this.purchaseAsset(session, name, ticker!, quantity!.toString());
    }
  }

  @Router.get("/portfolios/:_id/topAssets")
  async getTopAssets(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const isPublic = await Portfolio.portfolioIsPublic(_id);
    const portfolioOwner = await Portfolio.getPortfolioOwner(_id);
    if (!isPublic && !user.equals(portfolioOwner)) {
      throw new NotAllowedError("Cannot view private portfolio which user does not own");
    }
    const assetIds = await Portfolio.getPortfolioShares(_id);
    const assetValues = new Map<string, number>();
    for (const id of assetIds) {
      const asset = await Asset.getAssetById(id);
      const ticker = asset.ticker;
      const value = await Asset.getCurrentPrice(ticker);
      if (!assetValues.has(ticker)) {
        assetValues.set(ticker, value);
      } else {
        const prevTotal = assetValues.get(ticker);
        assetValues.set(ticker, prevTotal + value);
      }
    }
    // ugly ;(
    const topValues = new Array<number>(0, 0, 0);
    const topAssets = new Array<string>("", "", "");
    for (const [ticker, value] of assetValues) {
      if (value > topValues[2]) {
        if (value > topValues[1]) {
          if (value > topValues[0]) {
            topValues[2] = topValues[1];
            topAssets[2] = topAssets[1];
            topValues[1] = topValues[0];
            topAssets[1] = topAssets[0];
            topValues[0] = value;
            topAssets[0] = ticker;
          } else {
            topValues[2] = topValues[1];
            topAssets[2] = topAssets[1];
            topValues[1] = value;
            topAssets[1] = ticker;
          }
        } else {
          topValues[2] = value;
          topAssets[2] = ticker;
        }
      }
    }
    return topAssets;
  }
}

export default getExpressRouter(new Routes());
