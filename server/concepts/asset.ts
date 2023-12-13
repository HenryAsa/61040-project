import axios from "axios";
import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface AssetDoc extends BaseDoc {
  ticker: string;
  owner: ObjectId;
  quantity: number;
  pricePurchased: Date;
}

export default class AssetConcept {
  public readonly assets = new DocCollection<AssetDoc>("assets");

  async create(ticker: string, owner: ObjectId, quantity: number) {
    const pricePurchased = await this.getCurrentPrice(ticker);
    const _id = await this.assets.createOne({ ticker, owner, quantity, pricePurchased });
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

  async getAssetOwner(_id: ObjectId) {
    const asset = await this.assets.readOne({ _id });
    if (asset === null) {
      throw new NotFoundError(`Asset not found!`);
    }
    return asset.owner;
  }

  async getAssetById(_id: ObjectId) {
    // GETS ASSET BY ITS OBJECTID
    const asset = await this.assets.readOne({ _id });
    if (asset === null) {
      throw new NotFoundError(`Asset not found!`);
    }
    return this.sanitizeAsset(asset);
  }

  async getManyAssetsById(Ids: Array<ObjectId>) {
    const assets = [];
    for (const _id of Ids) {
      const asset = await this.assets.readOne({ _id });
      assets.push(asset);
    }
    return assets;
  }

  async getAssetsByShareholderId(user_id: ObjectId) {
    // GETS ALL OF THE ASSETS OWNED BY A USER
    const assets = await this.assets.readMany({ owner: user_id });
    if (assets.length === 0) {
      throw new NotFoundError(`This user is not a shareholder of any assets`);
    }
    return this.sanitizeAssets(assets);
  }

  async searchAssetsByTicker(ticker: string) {
    // REGEX SEARCHES FOR ASSET TICKERS THAT MATCH
    const assets = await this.assets.readMany({ ticker });
    if (assets.length === 0) {
      throw new NotFoundError(`This user is not a shareholder of any assets`);
    }
    return this.sanitizeAssets(assets);
  }

  async deleteOne(_id: ObjectId) {
    await this.assets.deleteOne({ _id });
    return { msg: "Asset deleted!" };
  }

  async deleteByUser(user: ObjectId) {
    await this.assets.deleteMany({ user });
    return { msg: "User deleted!" };
  }

  async getAssetsValue(assets: Array<ObjectId>) {
    let value = 0;
    for (const assetId of assets) {
      const asset = await this.assets.readOne({ _id: assetId });
      const quantity = asset!.quantity!;
      const price = await this.getCurrentPrice(asset!.ticker!);
      value += quantity * price;
    }
    return value;
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
