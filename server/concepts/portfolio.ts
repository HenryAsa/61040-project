import { Filter, FindOptions, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";
import { User } from "../app";

export interface PortfolioDoc extends BaseDoc {
  name: string;
  ownerName: string;
  owner: ObjectId;
  isPublic: boolean;
  shares: Array<ObjectId>;
}

export default class PortfolioConcept {
  public readonly portfolios = new DocCollection<PortfolioDoc>("portfolios");

  async create(name: string, owner: ObjectId, ownerName: string, isPublic: boolean) {
    await this.canCreate(name, owner);
    const shares = Array<ObjectId>();
    const _id = await this.portfolios.createOne({ name, owner, ownerName, isPublic, shares });
    return { msg: "Portfolio created successfully!", asset: await this.getPortfolioById(_id) };
  }

  async getPortfolios(query: Filter<PortfolioDoc>, sort?: FindOptions<PortfolioDoc>) {
    let posts;
    if (sort) {
      posts = await this.portfolios.readMany(query, sort);
    } else {
      posts = await this.portfolios.readMany(query, {
        sort: { dateUpdated: -1 },
      });
    }
    return posts;
  }

  async getOwnerName(_id: ObjectId) {
    const portfolio = await this.portfolios.readOne({ _id });
    if (portfolio) {
      const ownerName = (await User.getUserById(portfolio.owner)).username;
      return ownerName;
    } else {
      throw new NotFoundError(`Portfolio not found!`);
    }
  }

  async getPortfoliosByOwner(owner: ObjectId) {
    return await this.getPortfolios({ owner: owner });
  }

  async getViewablePortfoliosByOwner(owner: ObjectId, viewer: ObjectId) {
    if (viewer.equals(owner)) {
      return await this.getPortfoliosByOwner(owner);
    }
    return await this.getPortfolios({ owner: owner, isPublic: true });
  }

  async portfolioIsPublic(_id: ObjectId) {
    const portfolio = await this.portfolios.readOne({ _id });
    if (portfolio) {
      return portfolio.isPublic;
    } else {
      throw new NotFoundError(`Portfolio not found!`);
    }
  }

  async getPortfolioOwner(_id: ObjectId) {
    const portfolio = await this.portfolios.readOne({ _id });
    if (portfolio) {
      return portfolio.owner;
    } else {
      throw new NotFoundError(`Portfolio not found!`);
    }
  }

  async getPortfolioShares(_id: ObjectId) {
    const portfolio = await this.portfolios.readOne({ _id });
    if (portfolio) {
      return portfolio.shares;
    } else {
      throw new NotFoundError(`Portfolio not found!`);
    }
  }

  async getPortfolioById(_id: ObjectId) {
    const portfolio = await this.portfolios.readOne({ _id });
    if (portfolio === null) {
      throw new NotFoundError(`Portfolio not found!`);
    }
    return portfolio;
  }

  async getPortfolioByName(name: string) {
    const portfolio = await this.portfolios.readOne({ name });
    if (portfolio === null) {
      throw new NotFoundError(`Portfolio not found!`);
    }
    return portfolio;
  }

  async addAssetToPortfolio(_id: ObjectId, share: ObjectId) {
    const portfolio = await this.getPortfolioById(_id);
    await this.update(portfolio._id, { shares: portfolio.shares.concat(share) });
    return { msg: `Successfully added share '${share}' to portfolio '${name}'` };
  }

  async removeAssetFromPortfolio(_id: ObjectId, share: ObjectId) {
    const portfolio = await this.getPortfolioById(_id);
    const shares = portfolio.shares.filter((id) => id.toString() !== share.toString());
    await this.update(_id, { shares: shares });
    return { msg: `Successfully removed share '${share}' from portfolio '${_id}'` };
  }

  async update(_id: ObjectId, update: Partial<PortfolioDoc>) {
    await this.portfolios.updateOne({ _id }, update);
    return { msg: "Portfolio updated successfully!" };
  }

  async delete(_id: ObjectId) {
    await this.portfolios.deleteOne({ _id });
    return { msg: "Portfolio deleted!" };
  }

  async portfolioIdExists(_id: ObjectId) {
    const maybePortfolio = await this.portfolios.readOne({ _id });
    return maybePortfolio === null;
  }

  async portfolioNameExists(name: string) {
    const maybePortfolio = await this.portfolios.readOne({ name });
    return maybePortfolio !== null;
  }

  private async canCreate(name: string, owner: ObjectId) {
    if (!name) {
      throw new BadValuesError("Cannot create portfolio with empty name");
    }
    if (!owner) {
      throw new BadValuesError("Cannot create portfolio without an owner");
    }
    if ((await this.portfolios.readOne({ name, owner })) !== null) {
      throw new NotAllowedError(`A portfolio with name ${name} owned by ${owner} already exists`);
    }
    return true;
  }
}
