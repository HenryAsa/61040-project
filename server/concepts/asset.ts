import axios from "axios";
import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface AssetDoc extends BaseDoc {
  name: string;
  ticker: string;
  owner: ObjectId;
  datePurchased: Date;
}

export default class AssetConcept {
  public readonly assets = new DocCollection<AssetDoc>("assets");

  async create(ticker: string, owner: ObjectId) {
    const datePurchased = new Date();
    const _id = await this.assets.createOne({ ticker, owner, datePurchased });
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

  async getAssetsByShareholderId(user_id: ObjectId) {
    // GETS ALL OF THE ASSETS OWNED BY A USER
    const assets = await this.assets.readMany({ shareholders: { $elemMatch: { $eq: user_id } } });
    if (assets.length === 0) {
      throw new NotFoundError(`This user is not a shareholder of any assets`);
    }
    return this.sanitizeAssets(assets);
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
    return this.sanitizeAssets(assets);
  }

  async getAssets(asset_name?: string) {
    // If asset_name is undefined, return all assets by applying empty filter
    const filter = asset_name ? { asset_name } : {};
    const assets = (await this.assets.readMany(filter)).map(this.sanitizeAsset);
    return this.sanitizeAssets(assets);
  }

  async update(_id: ObjectId, update: Partial<AssetDoc>) {
    await this.assets.updateOne({ _id }, update);
    return { msg: "Asset updated successfully!" };
  }

  async delete(_id: ObjectId) {
    await this.assets.deleteOne({ _id });
    return { msg: "Asset deleted!" };
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
}
