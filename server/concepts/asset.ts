import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface AssetDoc extends BaseDoc {
  asset_name: string;
  asset_ticker: string;
  current_price: number;
  price_history: Array<number>;
  shareholders: Array<ObjectId>;
}

export default class AssetConcept {
  public readonly assets = new DocCollection<AssetDoc>("assets");

  async create(asset_name: string, asset_ticker: string, current_price: number) {
    await this.canCreate(asset_name, asset_ticker);
    const _id = await this.assets.createOne({ asset_name: asset_name, asset_ticker: asset_ticker, current_price: current_price });
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
    const asset = await this.assets.readOne({ _id });
    if (asset === null) {
      throw new NotFoundError(`Asset not found!`);
    }
    return this.sanitizeAsset(asset);
  }

  async getAssetByAsset_name(asset_name: string) {
    const asset = await this.assets.readOne({ asset_name: asset_name });
    if (asset === null) {
      throw new NotFoundError(`Asset not found!`);
    }
    return this.sanitizeAsset(asset);
  }

  async searchAssetsByAsset_name(asset_name: string) {
    // REGEX SEARCHES FOR USERNAMES THAT MATCH
    let query: Filter<AssetDoc> = {};
    if (asset_name) {
      query = { asset_name: { $regex: `${asset_name}`, $options: "i" } };
    } else {
      query = {};
    }
    const assets = await this.assets.readMany(query);
    if (assets === null) {
      throw new NotFoundError(`Asset not found!`);
    }
    return await this.sanitizeAssets(assets);
  }

  async idsToAsset_names(ids: ObjectId[]) {
    const assets = await this.assets.readMany({ _id: { $in: ids } });

    // Store strings in Map because ObjectId comparison by reference is wrong
    const idToAsset = new Map(assets.map((asset) => [asset._id.toString(), asset]));
    return ids.map((id) => idToAsset.get(id.toString())?.asset_name ?? "DELETED_USER");
  }

  async getAssets(asset_name?: string) {
    // If asset_name is undefined, return all assets by applying empty filter
    const filter = asset_name ? { asset_name } : {};
    const assets = (await this.assets.readMany(filter)).map(this.sanitizeAsset);
    return assets;
  }

  async authenticate(asset_name: string, password: string) {
    const asset = await this.assets.readOne({ asset_name: asset_name, password: password });
    if (!asset) {
      throw new NotAllowedError("Asset_name or password is incorrect.");
    }
    return { msg: "Successfully authenticated.", _id: asset._id };
  }

  async update(_id: ObjectId, update: Partial<AssetDoc>) {
    if (update.asset_name !== undefined) {
      await this.isAssetNameUnique(update.asset_name);
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

  private async canCreate(asset_name: string, asset_ticker: string) {
    if (!asset_name) {
      throw new BadValuesError("The asset_name cannot be empty");
    }
    if (!this.isAssetTickerUnique(asset_ticker)) {
      throw new BadValuesError("Make the asset's ticker is at most 4 characters long and does not currently exist");
    }
    await this.isAssetNameUnique(asset_name);
  }

  private async isAssetNameUnique(asset_name: string) {
    if (await this.assets.readOne({ asset_name })) {
      throw new NotAllowedError(`Asset with asset_name ${asset_name} already exists!`);
    }
  }

  private async isAssetTickerUnique(asset_ticker: string) {
    if (await this.assets.readOne({ asset_ticker })) {
      throw new NotAllowedError(`Asset with asset_ticker ${asset_ticker} already exists!`);
    }
  }
}
