import axios from "axios";
import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface AssetDoc extends BaseDoc {
  name: string;
  ticker: string;
  shareholders: Array<ObjectId>;
}

export default class AssetConcept {
  public readonly assets = new DocCollection<AssetDoc>("assets");

  async create(asset_name: string, asset_ticker: string) {
    await this.canCreate(asset_name, asset_ticker);
    const _id = await this.assets.createOne({ name: asset_name, ticker: asset_ticker.toLocaleUpperCase() });
    return { msg: "Asset created successfully!", asset: await this.getAssetById(_id) };
  }

  private sanitizeAsset(asset: AssetDoc) {
    // eslint-disable-next-line
    return asset;
  }

  private sanitizeAssets(assets: Array<AssetDoc>) {
    // eslint-disable-next-line
    return assets.map((asset) => this.sanitizeAsset(asset));
  }

  async getAssetById(_id: ObjectId) {
    // GETS ASSET BY ITS OBJECTID
    const asset = await this.assets.readOne({ _id });
    if (asset === null) {
      throw new NotFoundError(`Asset not found!`);
    }
    return this.sanitizeAsset(asset);
  }

  async getAssetByName(asset_name: string) {
    // GETS ASSET BY ITS NAME
    const asset = await this.assets.readOne({ name: asset_name });
    if (asset === null) {
      throw new NotFoundError(`Asset with the name "${asset_name}" was not found!`);
    }
    return this.sanitizeAsset(asset);
  }

  async getAssetByTicker(asset_ticker: string) {
    // GETS ASSET BY ITS TICKER
    let asset = await this.assets.readOne({ ticker: asset_ticker });
    if (asset === null) {
      asset = (await this.create(asset_ticker, asset_ticker)).asset;
      // throw new NotFoundError(`Asset with the ticker "${asset_ticker}" was not found!`);
    }
    return this.sanitizeAsset(asset);
  }

  async getAssetsByShareholderId(user_id: ObjectId) {
    // GETS ALL OF THE ASSETS OWNED BY A USER
    const assets = await this.assets.readMany({ shareholders: { $elemMatch: { $eq: user_id } } });
    if (assets.length === 0) {
      throw new NotFoundError(`This user is not a shareholder of any assets`);
    }
    return this.sanitizeAssets(assets);
  }

  async searchAssetsByName(asset_name: string) {
    // REGEX SEARCHES FOR ASSET NAMES THAT MATCH
    let query: Filter<AssetDoc> = {};
    if (asset_name) {
      query = { name: { $regex: `${asset_name}`, $options: "i" } };
    } else {
      query = {};
    }
    const assets = await this.assets.readMany(query);
    if (assets === null) {
      throw new NotFoundError(`Asset not found!`);
    }
    return await this.sanitizeAssets(assets);
  }

  async searchAssetsByTicker(asset_ticker: string) {
    // REGEX SEARCHES FOR ASSET TICKERS THAT MATCH
    let query: Filter<AssetDoc> = {};
    if (asset_ticker) {
      query = { ticker: { $regex: `${asset_ticker}`, $options: "i" } };
    } else {
      query = {};
    }
    const assets = await this.assets.readMany(query);
    if (assets === null) {
      throw new NotFoundError(`Asset not found!`);
    }
    return await this.sanitizeAssets(assets);
  }

  async idsToNames(ids: ObjectId[]) {
    const assets = await this.assets.readMany({ _id: { $in: ids } });
    // Store strings in Map because ObjectId comparison by reference is wrong
    const idToAsset = new Map(assets.map((asset) => [asset._id.toString(), asset]));
    return ids.map((id) => idToAsset.get(id.toString())?.name ?? "DELETED_USER");
  }

  async getAssets(asset_name?: string) {
    // If asset_name is undefined, return all assets by applying empty filter
    const filter = asset_name ? { asset_name } : {};
    const assets = (await this.assets.readMany(filter)).map(this.sanitizeAsset);
    return assets;
  }

  async addShareholderToAsset(asset_id: ObjectId, user_id: ObjectId) {
    // ADDS A SHAREHOLDER (OWNER) TO THE LIST OF OWNERS
    const asset = await this.getAssetById(asset_id);
    await this.isShareholder(asset_id, user_id, true);
    await this.update(user_id, { shareholders: asset.shareholders.concat(user_id) });
    return asset.shareholders;
  }

  async removeShareholderFromAsset(asset_id: ObjectId, user_to_remove: ObjectId) {
    // REMOVES A SHAREHOLDER FROM THE LIST OF OWNERS
    const asset = await this.getAssetById(asset_id);
    await this.isNotShareholder(asset_id, user_to_remove, true);
    const shareholders = asset.shareholders.filter((users) => users.toString() !== user_to_remove.toString());
    await this.update(asset_id, { shareholders: shareholders });
    return { msg: `Successfully removed the shareholder '${user_to_remove}' from the asset '${asset_id}'` };
  }

  async isShareholder(asset_id: ObjectId, user_id: ObjectId, throw_error: boolean = true) {
    // CHECKS WHETHER A USER IS A SHAREHOLDER OF AN ASSET, BY DEFAULT THROWS AN ERROR IF THE USER IS NOT A SHAREHOLDER
    const asset = await this.getAssetById(asset_id);
    const is_shareholder = asset.shareholders.some((id) => id.toString() === user_id.toString());
    if (!throw_error) return is_shareholder;
    if (!is_shareholder) throw new NotShareholderError(user_id, asset_id);
  }

  async isNotShareholder(asset_id: ObjectId, user_id: ObjectId, throw_error: boolean = true) {
    // CHECKS WHETHER A USER IS NOT A SHAREHOLDER OF AN ASSET, BY DEFAULT THROWS AN ERROR IF THE USER IS A SHAREHOLDER
    const is_not_shareholder = !(await this.isShareholder(asset_id, user_id, false));
    if (!throw_error) return is_not_shareholder;
    if (!is_not_shareholder) throw new AlreadyShareholderError(user_id, asset_id);
  }

  async update(_id: ObjectId, update: Partial<AssetDoc>) {
    if (update.name !== undefined) {
      await this.isNameUnique(update.name);
    }
    await this.assets.updateOne({ _id }, update);
    return { msg: "Asset updated successfully!" };
  }

  async delete(_id: ObjectId) {
    await this.assets.deleteOne({ _id });
    return { msg: "Asset deleted!" };
  }

  async assetExists(_id: ObjectId) {
    const maybeAsset = await this.assets.readOne({ _id });
    if (maybeAsset === null) {
      throw new NotFoundError(`Asset not found!`);
    }
  }

  async getCurrentPrice(symbol: string) {
    const API_KEY = "KZHRUF576K9VJM0S";
    const BASE_URL = "https://www.alphavantage.co/";
    const response = await axios.get(`${BASE_URL}query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
    const data = await response.data;
    const currentPrice = await data["Global Quote"]["05. price"];
    return currentPrice;
  }

  async getHistory(symbol: string, timeSeries: string) {
    const API_KEY = "KZHRUF576K9VJM0S";
    const BASE_URL = "https://www.alphavantage.co/";
    let response;
    let dates;
    let prices;
    if (timeSeries === "24hours") {
      response = await axios.get(`${BASE_URL}query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=30min&outputsize=compact&apikey=${API_KEY}`);
      const data = await response.data;
      const currentPrice = await data["Time Series (30min)"];
      dates = Object.keys(currentPrice).reverse();
      prices = dates.map((date) => parseFloat(currentPrice[date]["4. close"]));
    } else if (timeSeries === "daily") {
      response = await axios.get(`${BASE_URL}query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${API_KEY}`);
      const data = await response.data;
      const currentPrice = await data["Time Series (Daily)"];
      dates = Object.keys(currentPrice).reverse();
      prices = dates.map((date) => parseFloat(currentPrice[date]["4. close"]));
    } else {
      response = await axios.get(`${BASE_URL}query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&outputsize=compact&apikey=${API_KEY}`);
      const data = await response.data;
      const currentPrice = await data["Monthly Time Series"];
      dates = Object.keys(currentPrice).reverse();
      prices = dates.map((date) => parseFloat(currentPrice[date]["4. close"]));
    }

    return { dates, prices };
  }

  private async canCreate(asset_name: string, asset_ticker: string) {
    if (!asset_name) {
      throw new BadValuesError("The asset_name cannot be empty");
    }
    if (!this.isTickerUnique(asset_ticker)) {
      throw new BadValuesError("Make the asset's ticker is at most 4 characters long and does not currently exist");
    }
    await this.isNameUnique(asset_name);
  }

  private async isNameUnique(asset_name: string) {
    if (await this.assets.readOne({ asset_name })) {
      throw new NotAllowedError(`Asset with asset_name ${asset_name} already exists!`);
    }
  }

  private async isTickerUnique(asset_ticker: string) {
    if (await this.assets.readOne({ asset_ticker })) {
      throw new NotAllowedError(`Asset with asset_ticker ${asset_ticker} already exists!`);
    }
  }
}

export class AlreadyShareholderError extends NotAllowedError {
  constructor(
    public readonly user: ObjectId,
    public readonly asset_id: ObjectId,
  ) {
    super("This user is already a shareholder of this asset!", user, asset_id);
  }
}

export class NotShareholderError extends NotAllowedError {
  constructor(
    public readonly user_id: ObjectId,
    public readonly asset_id: ObjectId,
  ) {
    super("{0} is not a shareholder of the asset {1}!", user_id, asset_id);
  }
}
