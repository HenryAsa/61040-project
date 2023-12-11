import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface MoneyDoc extends BaseDoc {
  user: ObjectId;
  balance: number;
}

export default class MoneyConcept {
  public readonly accounts = new DocCollection<MoneyDoc>("money");

  /**
   * Adds a user to the database with given balance
   * @param user the id of the user associated with this account
   * @param newBalance (optional) the balance of the user
   * @returns a message that the account was created successfully and the doc associated with the user
   * @throws error if this user already has an account
   */
  async create(user: ObjectId, newBalance?: number) {
    if (await this.userExists(user)) {
      throw new NotAllowedError("Cannot create multiple accounts for one user");
    }
    const balance = newBalance === undefined ? 0 : newBalance; // balance is 0 if previously undefined
    const _id = await this.accounts.createOne({ user, balance });
    return { msg: "User created successfully!", user: await this.accounts.readOne({ _id }) };
  }

  /**
   * Finds the balance of a given user
   * @param _id the id of this account or the id of the user associated with this account
   * @returns the balance of the user with this id
   * @throws error if no such id exists in the database
   */
  async getBalance(_id: ObjectId) {
    const user = await this.accounts.readOne({ user: _id });
    const balance = user === null ? 0 : user.balance;
    return balance;
  }

  /**
   * Updates the balance of a given user
   * @param _id the id of this account or the id of the user associated with this account
   * @param newBalance the balance of the user that will be set
   */
  async setBalance(_id: ObjectId, newBalance: number) {
    if (!this.userExists(_id)) {
      throw new NotFoundError(`User not found!`);
    }
    const filter = { user: _id };
    const update = { balance: newBalance };
    await this.accounts.updateOne(filter, update);
  }

  /**
   * Increases the balance of an account by a given number
   * @param _id the id of this account or the id of the user associated with this account
   * @param amount the quantity of money that will be added to the account
   * @returns the updated balance of the account
   */
  async deposit(_id: ObjectId, amount: number) {
    if (amount < 0) {
      throw new NotAllowedError("Cannot deposit a negative quantity");
    }
    let balance = await this.getBalance(_id);
    balance += amount;
    await this.setBalance(_id, balance);
    return balance;
  }

  /**
   * Decreases the balance of an account by a given number
   * @param _id the id of this account or the id of the user associated with this account
   * @param amount the quantity of money that will be subtracted to the account
   * @returns the updated balance of the account
   */
  async withdraw(_id: ObjectId, amount: number) {
    if (amount < 0) {
      throw new NotAllowedError("Cannot withdraw a negative quantity");
    }
    let balance = await this.getBalance(_id);
    if (balance < amount) {
      throw new NotAllowedError("Cannot overdraw from account");
    }
    balance -= amount;
    await this.setBalance(_id, balance);
    return balance;
  }

  /**
   * Finds the user associated with a given account
   * @param _id the id of the given doc
   * @returns the ObjectId of the user or undefined if this id does not exist
   */
  async accountIdToUserId(_id: ObjectId) {
    const account = await this.accounts.readOne({ _id });
    return account?.user;
  }

  /**
   * Finds the id of the account associated with the given user
   * @param user the id of the user associated with this accound
   * @returns the ObjectId of the account or undefined if this user does not exist
   */
  async userIdToAccountId(user: ObjectId) {
    const account = await this.accounts.readOne({ user });
    return account?._id;
  }

  /**
   * Finds all user ids associated with given account ids
   * @param ids the ids of the requested users
   * @returns an array of the user ids or strings if a user does not exist
   */
  async accountIdsToUserIds(ids: ObjectId[]) {
    const accounts = await this.accounts.readMany({ _id: { $in: ids } });

    // Store strings in Map because ObjectId comparison by reference is wrong
    const idToUser = new Map(accounts.map((account) => [account._id.toString(), account.user]));
    return ids.map((id) => idToUser.get(id.toString()) ?? "NO SUCH USER");
  }

  /**
   * Deletes a user from the database
   * @param _id the id of an account or user associated with the account
   * @returns a message if the deletion was successful
   */
  async delete(_id: ObjectId) {
    await this.accounts.deleteOne({ _id });
    return { msg: "Account deleted!" };
  }

  /**
   * Checks if there is account with this id or user in the database
   * @param _id the id of an account or user associated with the account
   * @returns true if and only if the user exists in the database
   */
  async userExists(_id: ObjectId) {
    const maybeAccount = await this.accounts.readOne({ _id });
    return maybeAccount !== null;
  }
}
