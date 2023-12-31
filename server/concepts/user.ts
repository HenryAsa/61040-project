import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface UserDoc extends BaseDoc {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePhoto: string; // ObjectId maybe?
}

export interface SanitizedUserDoc extends BaseDoc {
  username: string;
  firstName: string;
  lastName: string;
  profilePhoto: string; // ObjectId maybe?
}

export default class UserConcept {
  public readonly users = new DocCollection<UserDoc>("users");

  async create(username: string, password: string, firstName: string, lastName: string, profilePhoto: string) {
    await this.canCreate(username, password, firstName, lastName, profilePhoto);
    const _id = await this.users.createOne({ username: username, password: password, firstName: firstName, lastName: lastName, profilePhoto: profilePhoto });
    return { msg: "User created successfully!", user: await this.getUserById(_id) };
  }

  private sanitizeUser(user: UserDoc) {
    // eslint-disable-next-line
    const { password, ...rest } = user; // remove password
    return rest;
  }

  private sanitizeUsers(users: Array<UserDoc>) {
    // eslint-disable-next-line
    return users.map((user) => this.sanitizeUser(user));
  }

  async getUserById(_id: ObjectId) {
    const user = await this.users.readOne({ _id });
    if (user === null) {
      throw new NotFoundError(`User not found!`);
    }
    return this.sanitizeUser(user);
  }

  async getUserByUsername(username: string) {
    const user = await this.users.readOne({ username: username });
    if (user === null) {
      throw new NotFoundError(`User not found!`);
    }
    return this.sanitizeUser(user);
  }

  async searchUsersByUsername(username: string) {
    // REGEX SEARCHES FOR USERNAMES THAT MATCH
    let query: Filter<UserDoc> = {};
    if (username) {
      query = { username: { $regex: `${username}`, $options: "i" } };
    } else {
      query = {};
    }
    const users = await this.users.readMany(query);
    if (users === null) {
      throw new NotFoundError(`User not found!`);
    }
    return await this.sanitizeUsers(users);
  }

  async idsToUsernames(ids: ObjectId[]) {
    const users = await this.users.readMany({ _id: { $in: ids } });

    // Store strings in Map because ObjectId comparison by reference is wrong
    const idToUser = new Map(users.map((user) => [user._id.toString(), user]));
    return ids.map((id) => idToUser.get(id.toString())?.username ?? "DELETED_USER");
  }

  async getUsers(username?: string) {
    // If username is undefined, return all users by applying empty filter
    const filter = username ? { username } : {};
    const users = (await this.users.readMany(filter)).map(this.sanitizeUser);
    return users;
  }

  async authenticate(username: string, password: string) {
    const user = await this.users.readOne({ username: username, password: password });
    if (!user) {
      throw new NotAllowedError("Username or password is incorrect.");
    }
    return { msg: "Successfully authenticated.", _id: user._id };
  }

  async update(_id: ObjectId, update: Partial<UserDoc>) {
    if (update.username !== undefined) {
      await this.isUsernameUnique(update.username);
    }
    await this.users.updateOne({ _id }, update);
    return { msg: "User updated successfully!" };
  }

  async delete(_id: ObjectId) {
    await this.users.deleteOne({ _id });
    return { msg: "User deleted!" };
  }

  async userExists(_id: ObjectId) {
    const maybeUser = await this.users.readOne({ _id });
    if (maybeUser === null) {
      throw new NotFoundError(`User not found!`);
    }
  }

  private async isValidPassword(password: string) {
    const isUpperCase = new RegExp(/(?=.*[A-Z])/g);
    const isLowerCase = new RegExp(/(?=.*[a-z])/g);
    const isSpecialChar = new RegExp(/(?=.*[!@#$%^&*])/g);
    const isLong = new RegExp(/(?=.{7,})/g);
    const isNumeric = new RegExp(/ (?=.*[0-9])/g);
    // const hasWhiteSpace = new RegExp(/\s/g);

    if (password.match(isUpperCase) && password.match(isSpecialChar) && password.match(isLowerCase) && password.match(isLong) && password.match(isNumeric)) {
      // !password.match(hasWhiteSpace)) {
      return true;
    }
    return false;
  }

  private async canCreate(username: string, password: string, firstName: string, lastName: string, profilePhoto: string) {
    if (!username) {
      throw new BadValuesError("The username cannot be empty");
    }
    if (!firstName) {
      throw new BadValuesError("User must enter a first name");
    }
    if (!lastName) {
      throw new BadValuesError("User must enter a last name");
    }
    if (!profilePhoto) {
      throw new BadValuesError("User must upload a profile photo");
    }
    if (!this.isValidPassword(password)) {
      throw new BadValuesError(
        "Make the sure the password is at least 7 characters long, contains a combination of upper and lowercase letters, contains a number, contains a special character, and does not contain any whitespace",
      );
    }
    await this.isUsernameUnique(username);
  }

  private async isUsernameUnique(username: string) {
    if (await this.users.readOne({ username })) {
      throw new NotAllowedError(`User with username ${username} already exists!`);
    }
  }
}
