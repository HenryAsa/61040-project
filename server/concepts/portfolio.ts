import { Filter, FindOptions, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface PortfolioDoc extends BaseDoc {
  name: string;
  owner: ObjectId;
  username: string;
  isPublic: boolean;
  shares: Array<ObjectId>;
}

export default class PortfolioConcept {
  public readonly portfolios = new DocCollection<PortfolioDoc>("portfolios");

  async create(name: string, owner: ObjectId, username: string, isPublic: boolean) {
    await this.canCreate(name, owner);
    const shares: Array<ObjectId> = [];
    const _id = await this.portfolios.createOne({ name, owner, username, isPublic, shares });
    return { msg: "Portfolio created successfully!", asset: await this.getPortfolioById(_id) };
  }

  async getPortfolios(query: Filter<PortfolioDoc>, sort?: FindOptions<PortfolioDoc>) {
    let portfolios;
    if (sort) {
      portfolios = await this.portfolios.readMany(query, sort);
    } else {
      portfolios = await this.portfolios.readMany(query, {
        sort: { dateUpdated: -1 },
      });
    }
    return portfolios;
  }

  async getOnePortfolioByUser(owner: ObjectId, name: string) {
    return await this.getPortfolios({ owner, name });
  }

  async getPortfoliosByOwner(owner: ObjectId) {
    return await this.getPortfolios({ owner });
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
    const portfolio = await this.getPortfolios({ name });
    if (portfolio === null) {
      throw new NotFoundError(`Portfolio not found!`);
    }
    return portfolio[0];
  }

  async getAssets(_id: ObjectId) {
    const portfolio = await this.portfolios.readOne({ _id });
    return portfolio?.shares;
  }

  async getUserAssets(user: ObjectId) {
    const portfolios = await this.portfolios.readMany({ owner: user });
    const assets = [];
    for (const portfolio of portfolios) {
      for (const asset of portfolio.shares) {
        assets.push(asset);
      }
    }
    return assets;
  }

  async addAssetToPortfolio(owner: ObjectId, name: string, asset: ObjectId) {
    const portfolio = (await this.portfolios.readMany({ owner, name }))[0];
    const shares: Array<ObjectId> = portfolio.shares;
    shares.push(asset);
    await this.update(portfolio._id, { shares });
    return { msg: `Successfully added share '${asset}' to portfolio '${portfolio.name}'` };
  }

  async removeAssetFromPortfolio(portfolioId: ObjectId, assetId: string) {
    const portfolio = await this.portfolios.readOne({ _id: portfolioId });
    let shares = portfolio!.shares;
    shares = shares.filter((element) => element.toString() !== assetId);
    await this.portfolios.updateOne({ _id: portfolioId }, { shares });
    return { msg: `Successfully removed share` };
  }

  async update(_id: ObjectId, update: Partial<PortfolioDoc>) {
    await this.portfolios.updateOne({ _id }, update);
    return { msg: "Portfolio updated successfully!" };
  }

  async deleteOne(_id: ObjectId) {
    await this.portfolios.deleteOne({ _id });
    return { msg: "Portfolio deleted!" };
  }

  async deleteByUser(user: ObjectId) {
    await this.portfolios.deleteMany({ user });
    return { msg: "User deleted!" };
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
