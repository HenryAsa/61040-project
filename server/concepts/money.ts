import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface MoneyDoc extends BaseDoc {
  user: ObjectId;
  balance: number;
}

export default class MoneyConcept {
  public readonly accounts = new DocCollection<MoneyDoc>("money");

  async create(user: ObjectId, newBalance?: number) {
    await this.canCreate(user);
    const balance = newBalance === undefined ? 0 : newBalance; // balance is 0 if previously undefined
    const _id = await this.accounts.createOne({ user, balance });
    return { msg: "User created successfully!", user: await this.accounts.readOne({ _id }) };
  }

  async deposit(_id: ObjectId, amount: number) {}

  async withdraw(_id: ObjectId, amount: number) {}

  async setBalance(_id: ObjectId, newBalance: number) {}

  async getBalanceById(_id: ObjectId) {
    const user = await this.accounts.readOne({ _id });
    if (user === null) {
      throw new NotFoundError(`User not found!`);
    }
    return user.balance;
  }

  async accountIdToUserId(_id: ObjectId) {
    const account = await this.accounts.readOne({ _id });
    return account?.user;
  }

  async accountIdsToUserIds(ids: ObjectId[]) {
    const accounts = await this.accounts.readMany({ _id: { $in: ids } });

    // Store strings in Map because ObjectId comparison by reference is wrong
    const idToUser = new Map(accounts.map((account) => [account._id.toString(), account.user]));
    return ids.map((id) => idToUser.get(id.toString()) ?? "DELETED_USER");
  }

  async delete(_id: ObjectId) {
    await this.accounts.deleteOne({ _id });
    return { msg: "Account deleted!" };
  }

  private async canCreate(user: ObjectId) {
    const maybeAccount = await this.accounts.readOne({ user });
    return maybeAccount === null;
  }
}
