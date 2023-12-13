import { Filter, FindOptions, ObjectId } from "mongodb";

import { AIAgent, Asset, Friend, Interest, Media, Money, Portfolio, Post, User, WebSession } from "./app";
import { AssetDoc } from "./concepts/asset";
import { NotAllowedError } from "./concepts/errors";
import { MediaDoc } from "./concepts/media";
import { PortfolioDoc } from "./concepts/portfolio";
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
    const response = await AIAgent.getResponse(user, decision);
    return response;
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
  async deposit(session: WebSessionDoc, amount: string) {
    const user = WebSession.getUser(session);
    return await Money.deposit(user, parseInt(amount));
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

  @Router.get("/assets/shareholders/:username")
  async getAssetsByShareholderUsername(session: WebSessionDoc, username?: string) {
    let user;
    if (!username) {
      user = WebSession.getUser(session);
    } else {
      user = (await User.getUserByUsername(username))._id;
    }
    const assets = await Asset.getAssetsByShareholderId(user);
    return Responses.assets(assets);
  }

  @Router.get("/asset/id/:_id")
  async getAssetById(_id: ObjectId) {
    const asset = await Asset.getAssetById(_id);
    return Responses.asset(asset);
  }

  @Router.get("/asset/ticker/:ticker")
  async getAssetByTicker(ticker: string) {
    const asset = await Asset.getAssetByTicker(ticker);
    return Responses.asset(asset);
  }

  @Router.get("/asset/name/:name")
  async getAssetByName(asset_name: string) {
    const asset = await Asset.getAssetByName(asset_name);
    return Responses.asset(asset);
  }

  @Router.post("/asset")
  async createAsset(session: WebSessionDoc, asset_name: string, ticker: string) {
    const asset = await Asset.create(asset_name, ticker);
    return { msg: asset.msg, asset: asset.asset };
  }

  @Router.put("/assets/:ticker/:shareholder")
  async addAssetShareholder(session: WebSessionDoc, ticker: string, user?: ObjectId) {
    if (!user) {
      user = WebSession.getUser(session);
    }
    const asset = await Asset.getAssetByTicker(ticker);
    const shareholders = await Asset.addShareholderToAsset(asset._id, user);
    return {
      msg: `User has been successfully added to '${asset.ticker}'s list of shareholders`,
      shareholders: shareholders,
    };
  }

  @Router.delete("/assets/:ticker/:shareholder")
  async removeAssetShareholder(session: WebSessionDoc, ticker: string, user?: ObjectId) {
    if (!user) {
      user = WebSession.getUser(session);
    }
    const asset = await Asset.getAssetByTicker(ticker);
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

  @Router.get("/assets/price/:ticker")
  async getCurrentPrice(ticker: string) {
    return await Asset.getCurrentPrice(ticker);
  }

  @Router.get("/assets/history/:ticker/:timeSeries")
  async getHistoryPrice(ticker: string, timeSeries: string) {
    return await Asset.getHistory(ticker, timeSeries);
  }

  @Router.get("/portfolios")
  async getPortfolios(session: WebSessionDoc, query: Filter<PortfolioDoc>, sort?: FindOptions<PortfolioDoc>) {
    const portfolio = await Portfolio.getPortfolios(query, sort);
    return portfolio;
  }

  @Router.get("/portfoliosForSelf")
  async getAllPortfoliosBySelf(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const portfolios = await Portfolio.getPortfoliosByOwner(user);
    return portfolios;
  }

  @Router.get("/portfoliosByOwner/:username")
  async getAllPortfoliosByOwnerUsername(username: string) {
    const user = await User.getUserByUsername(username);
    const portfolios = await Portfolio.getPortfoliosByOwner(user._id);
    return portfolios;
  }

  @Router.patch("/buy/:portfolio_name/:ticker/:quantity")
  async purchaseAsset(session: WebSessionDoc, portfolio_name: string, ticker: string, quantity: number) {
    const user_id = WebSession.getUser(session);
    const user = User.getUserById(user_id);
    const portfolio = Portfolio.getPortfolioByName(portfolio_name);
    const current_price = Asset.getCurrentPrice(ticker);
    const price = quantity * (await current_price);
    const account_id = await Money.userIdToAccountId((await user)._id);
    let available_capital: number;
    if (account_id !== undefined) {
      available_capital = await Money.getBalance(user_id);
    } else {
      throw new Error("User does not have a money account.");
    }
    if (price <= available_capital) {
      for (let _ = 0; _ < quantity; ++_) {
        const asset = await Asset.create(ticker, user_id);
        await Portfolio.addAssetToPortfolio((await portfolio)._id, asset.asset._id);
      }
      void Money.withdraw(user_id, price);
    } else {
      throw new Error(
        `${(await user).username} is trying to purchase ${quantity} shares of ${ticker} at ${current_price} per share for a total of $${price} but their account only has $${available_capital} in it`,
      );
    }
    return { msg: `Successfully purchased ${quantity} shares of ${ticker} at ${current_price} per share for a total of $${price}` };
  }

  // @Router.patch("/sell/:portfolio/:ticker/:quantity")
  // async sellAsset(session: WebSessionDoc, portfolio_name: string, ticker: string, quantity: number) {
  //   const user_id = WebSession.getUser(session);
  //   const user = User.getUserById(user_id);
  //   const asset = Asset.getAssetByTicker(ticker);
  //   const portfolio = Portfolio.getPortfolioByName(portfolio_name);
  //   const current_price = Asset.getCurrentPrice(ticker);
  //   const price = quantity * (await current_price);
  //   const account_id = await Money.userIdToAccountId((await user)._id);

  //   if (account_id === undefined) {
  //     throw new Error("User does not have a money account.");
  //   }

  //   if ((await portfolio).shares.has((await asset)._id)) {
  //     const number_owned = (await portfolio).shares.get((await asset)._id);
  //     if (number_owned === undefined) {
  //       throw new BadValuesError("User does not own this asset");
  //     }
  //     void Portfolio.removeAssetFromPortfolio((await portfolio)._id, (await asset)._id);
  //     void Asset.removeShareholderFromAsset((await asset)._id, (await user)._id);
  //     void Money.deposit(account_id, number_owned * (await current_price));
  //   } else {
  //     throw new Error(`${(await user).username} is trying to sell ${quantity} shares of ${ticker} at ${current_price} per share for a total of $${price} but is running into an error`);
  //   }
  //   return { msg: `Successfully sold ${quantity} shares of ${ticker} at ${current_price} per share for a total of $${price}` };
  // }

  @Router.post("/portfolios")
  async createPortfolio(session: WebSessionDoc, name: string, isPublic: boolean) {
    const user = WebSession.getUser(session);
    return Portfolio.create(name, user, (await User.getUserById(user)).username, isPublic);
  }

  @Router.delete("/portfolios/:_id")
  async deletePortfolio(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const portfolio = await Portfolio.getPortfolioById(_id);
    if (!user.equals(portfolio.owner)) {
      throw new NotAllowedError("Cannot delete a portfolio which user does not own!");
    }
    return Portfolio.delete(_id);
  }

  // @Router.get("/portfolios/:_id/value")
  // async getPortfolioValue(session: WebSessionDoc, _id: ObjectId) {
  //   const user = WebSession.getUser(session);
  //   const isPublic = await Portfolio.portfolioIsPublic(_id);
  //   const portfolioOwner = await Portfolio.getPortfolioOwner(_id);
  //   if (!isPublic && !user.equals(portfolioOwner)) {
  //     throw new NotAllowedError("Cannot view private portfolio which the user does not own");
  //   }
  //   const assetIds = await Portfolio.getPortfolioShares(_id);
  //   let value = 0;
  //   for (const id of assetIds) {
  //     const asset = await Asset.getAssetById(id[0]);
  //     value += await Asset.getCurrentPrice(asset.ticker);
  //   }
  //   return value;
  // }

  // @Router.patch("/portfolios/copy/:srcId/:dstId")
  // async copyInvest(session: WebSessionDoc, srcId: ObjectId, dstId: ObjectId) {
  //   const user = WebSession.getUser(session);
  //   const sourcePortfolio = await Portfolio.getPortfolioById(srcId);
  //   const destinationPortfolio = await Portfolio.getPortfolioById(dstId);
  //   const srcIsPublic = sourcePortfolio.isPublic;
  //   const portfolioOwner = sourcePortfolio.owner;

  //   if (!srcIsPublic && !portfolioOwner.equals(user)) {
  //     throw new NotAllowedError("Cannot copy private portfolio which user does not own");
  //   }

  //   const assets = await Portfolio.getPortfolioShares(srcId);
  //   let total_price: number = 0;
  //   const account_id = await Money.userIdToAccountId(user);
  //   let available_capital: number;

  //   if (account_id !== undefined) {
  //     available_capital = await Money.getBalance(account_id);
  //   } else {
  //     throw new Error("User does not have a money account.");
  //   }

  //   for (const asset of assets) {
  //     const asset_object = await Asset.getAssetById(asset[0]);
  //     total_price += (await Asset.getCurrentPrice(asset_object.ticker)) * asset[1][0];
  //   }

  //   if (total_price >= available_capital) {
  //     for (const asset of assets) {
  //       const asset_object = await Asset.getAssetById(asset[0]);
  //       void this.purchaseAsset(session, destinationPortfolio.name, asset_object.ticker, asset[1][0]);
  //     }
  //   }
  // }

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
