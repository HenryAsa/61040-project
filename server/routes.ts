import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Friend, Money, Portfolio, Post, User, WebSession } from "./app";
import { NotAllowedError } from "./concepts/errors";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    const res = await User.create(username, password);
    const user = res.user;
    // create a new account balance associated with this user
    if (user !== null) {
      const userId = user._id;
      await Money.create(userId);
    }
    return res;
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
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

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
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

  @Router.get("/balance")
  async getBalance(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Money.getBalance(user);
  }

  @Router.patch("/balance/withdraw/:amount")
  async withdraw(session: WebSessionDoc, amount: number) {
    const user = WebSession.getUser(session);
    return await Money.withdraw(user, amount);
  }

  @Router.patch("/balance/deposit/:amount")
  async deposit(session: WebSessionDoc, amount: number) {
    const user = WebSession.getUser(session);
    return await Money.deposit(user, amount);
  }

  ///////////////
  // Portfolio
  ///////////////

  @Router.post("/portfolio/create/:name/:isPublic")
  async createPortfolio(session: WebSessionDoc, name: string, isPublic: boolean) {
    const user = WebSession.getUser(session);
    return Portfolio.create(name, user, isPublic);
  }

  @Router.get("portfolio/value/:name")
  async getPortfolioValue(session: WebSessionDoc, name: string) {
    const user = WebSession.getUser(session);
    const isPublic = await Portfolio.portfolioIsPublic(name);
    const portfolioOwner = await Portfolio.getPortfolioOwner(name);
    if (!isPublic && portfolioOwner !== user) {
      throw new NotAllowedError("Cannot view private portfolio which user does not own");
    }
    const assetIds = await Portfolio.getPortfolioShares(name);
    let value = 0;
    for (const id of assetIds) {
      const asset = await Asset.getAssetById(id);
      value += Asset.getCurrentPrice(asset.ticker);
    }
    return value;
  }

  @Router.patch("portfolio/purchase/:portfolioName/:ticker")
  async addStockToPortfolio(session: WebSessionDoc, portfolioName: string, ticker: string) {
    const user = WebSession.getUser(session);
    const portfolioOwner = await Portfolio.getPortfolioOwner(portfolioName);
    if (portfolioOwner !== user) {
      throw new NotAllowedError("Cannot add stock to portfolio which user does not own");
    }
    const asset = await Asset.getAssetByTicker(ticker);
    Asset.addShareholderToAsset(asset._id, user);
    Portfolio.addAssetToPortfolio();
  }

  @Router.patch("portfolio/copy/:srcName/:dstName/:isPublic")
  async copyInvest(session: WebSessionDoc, srcName: string, dstName: string, isPublic: boolean) {
    const user = WebSession.getUser(session);
    const srcIsPublic = await Portfolio.portfolioIsPublic(srcName);
    const portfolioOwner = await Portfolio.getPortfolioOwner(srcName);
    if (!srcIsPublic && portfolioOwner !== user) {
      throw new NotAllowedError("Cannot copy private portfolio which user does not own");
    }
    const dstPortfolio = Portfolio.create(dstName, user, isPublic);
    const assetIds = await Portfolio.getPortfolioShares(srcName);
    for (const id of assetIds) {
      await Asset.addShareholderToAsset(asset._id, user);
      await Portfolio.addAssetToPortfolio(dstName, id);
    }
  }
}

export default getExpressRouter(new Routes());
