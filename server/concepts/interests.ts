import axios from "axios";
import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

// const apiKey = process.env["NEWS_API_KEY"];
// const newsAPI = new NewsAPI(apiKey!);

export interface InterestDoc extends BaseDoc {
  user: ObjectId;
  interests: Array<string>;
}

export default class InterestConcept {
  public readonly tags = new DocCollection<InterestDoc>("tags");

  async create(user: ObjectId) {
    const _id = await this.tags.createOne({ user, interests: [] });
    return { msg: "Interests successfully created!", tag: await this.tags.readOne({ _id }) };
  }

  async getInterests(query: Filter<InterestDoc>) {
    const tags = await this.tags.readMany(query);
    return tags;
  }

  async getByUser(user: ObjectId) {
    return (await this.getInterests({ user }))[0];
  }

  async update(user: ObjectId, interests: Array<string>) {
    // const interests = (await this.getByUser(user)).interests;
    // interests.push(interest);
    await this.tags.updateOne({ user }, { interests });
    return { msg: "Interests successfully updated!" };
  }

  async removeTag(user: ObjectId, interestToRemove: string) {
    const interests = (await this.getByUser(user)).interests.filter((interest) => {
      return interest !== interestToRemove;
    });
    await this.tags.updateOne({ user }, { interests });
    return { msg: "Interest successfully removed!" };
  }

  async delete(user: ObjectId) {
    await this.tags.deleteOne({ user: user });
    return { msg: "Interest deleted successfully!" };
  }

  async getNews(user: ObjectId) {
    const interests = (await this.getByUser(user)).interests;
    let q = "";
    for (const topic of interests) {
      q += topic;
      q += ",";
    }
    // const headlines = await newsAPI.getEverything({
    //   q: q,
    //   qInTitle: "stock",
    //   sources: ["abc-news"],
    //   language: "en",
    //   sortBy: "relevancy",
    //   pageSize: 20,
    //   page: 1,
    // });
    // SWTUCJXHOH2T4ZLQ
    // const symbol = "AAPL";
    const API_KEY = "SWTUCJXHOH2T4ZLQ";
    const BASE_URL = "https://www.alphavantage.co/";
    console.log(q);
    const response = await axios.get(`${BASE_URL}query?function=NEWS_SENTIMENT&tickers=APPL&apikey=${API_KEY}`);
    console.log(response);
    const data = await response.data;
    return await data["feed"];
  }
}
