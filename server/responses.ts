import { User } from "./app";
import { AssetDoc } from "./concepts/asset";
import { AlreadyFriendsError, FriendNotFoundError, FriendRequestAlreadyExistsError, FriendRequestDoc, FriendRequestNotFoundError } from "./concepts/friend";
import { PostAuthorNotMatchError, PostDoc } from "./concepts/post";
import { Router } from "./framework/router";

/**
 * This class does useful conversions for the frontend.
 * For example, it converts a {@link PostDoc} into a more readable format for the frontend.
 */
export default class Responses {
  /**
   * Convert PostDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async post(post: PostDoc | null) {
    if (!post) {
      return post;
    }
    // const users = await User.idsToUsernames(activity.members);
    const post_author = await User.getUserById(post.author);
    return { ...post, author: post_author };
  }

  /**
   * Same as {@link post} but for an array of PostDoc for improved performance.
   */
  static async posts(posts: PostDoc | PostDoc[] | null) {
    if (!posts) {
      return posts;
    } else if (!("length" in posts)) {
      return await [this.post(posts)];
    }
    return await Promise.all(posts.map((post) => this.post(post)));
  }

  /**
   * Convert AssetDoc into more readable format for the frontend by converting the shareholder id into a UserDoc.
   */
  static async asset(asset: AssetDoc | null) {
    if (!asset) {
      return asset;
    }
    const asset_shareholders = await Promise.all(asset.shareholders.map((shareholder) => User.getUserById(shareholder)));
    return { ...asset, shareholders: asset_shareholders };
  }

  /**
   * Same as {@link asset} but for an array of AssetDoc for improved performance.
   */
  static async assets(assets: AssetDoc | AssetDoc[] | null) {
    if (!assets) {
      return assets;
    } else if (!("length" in assets)) {
      return await [this.asset(assets)];
    }
    return await Promise.all(assets.map((asset) => this.asset(asset)));
  }

  // /**
  //  * Convert UserDoc into more readable format for the frontend by converting the media id into a url.
  //  */
  // static async user(user: SanitizedUserDoc | null) {
  //   if (!user) {
  //     return user;
  //   }
  //   // const users = await User.idsToUsernames(activity.members);
  //   const user_profilePhoto = await Media.getMediaById(user.profilePhoto);
  //   return { ...user, profilePhoto: user_profilePhoto.media_url };
  // }

  // /**
  //  * Same as {@link user} but for an array of UserDoc for improved performance.
  //  */
  // static async users(users: SanitizedUserDoc | SanitizedUserDoc[] | null) {
  //   if (!users) {
  //     return users;
  //   } else if (!("length" in users)) {
  //     return await [this.user(users)];
  //   }
  //   return await Promise.all(users.map((user) => this.user(user)));
  // }

  /**
   * Convert FriendRequestDoc into more readable format for the frontend
   * by converting the ids into usernames.
   */
  static async friendRequests(requests: FriendRequestDoc[]) {
    const from = requests.map((request) => request.from);
    const to = requests.map((request) => request.to);
    const usernames = await User.idsToUsernames(from.concat(to));
    return requests.map((request, i) => ({ ...request, from: usernames[i], to: usernames[i + requests.length] }));
  }
}

Router.registerError(PostAuthorNotMatchError, async (e) => {
  const username = (await User.getUserById(e.author)).username;
  return e.formatWith(username, e._id);
});

Router.registerError(FriendRequestAlreadyExistsError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.from), User.getUserById(e.to)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(FriendNotFoundError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.user1), User.getUserById(e.user2)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(FriendRequestNotFoundError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.from), User.getUserById(e.to)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(AlreadyFriendsError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.user1), User.getUserById(e.user2)]);
  return e.formatWith(user1.username, user2.username);
});
