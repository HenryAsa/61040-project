import axios from "axios";
import { Filter, ObjectId } from "mongodb";
import OpenAI from "openai";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";
const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

export interface Message {
  author: string;
  text: string;
}

export interface ChatDoc extends BaseDoc {
  user: ObjectId;
  messages: Array<Message>;
}

export default class ChatConcept {
  public readonly chatboxes = new DocCollection<ChatDoc>("chat");

  async create(user: ObjectId) {
    const _id = await this.chatboxes.createOne({ user, messages: [] });
    return { msg: "Chatbox successfully created!", post: await this.chatboxes.readOne({ _id }) };
  }

  async getMessages(query: Filter<ChatDoc>) {
    const messages = await this.chatboxes.readMany(query, {});
    return messages;
  }

  async getByUser(user: ObjectId) {
    return (await this.getMessages({ user }))[0];
  }

  async update(user: ObjectId, text: string, author: string) {
    const messages = (await this.getByUser(user)).messages;
    const message: Message = { author, text };
    messages.push(message);
    await this.chatboxes.updateOne({ user }, { messages });
    return { msg: "Post successfully updated!" };
  }

  async removeLast(user: ObjectId) {
    const messages = (await this.getByUser(user)).messages;
    messages.pop();
    await this.chatboxes.updateOne({ user }, { messages });
    return { msg: "Post successfully updated!" };
  }

  async send(user: ObjectId, text: string) {
    await this.update(user, text, "self");
    await this.update(user, "Analyzing ...", "ai");
    return { msg: "Message is received" };
  }

  async deleteByUser(user: ObjectId) {
    await this.chatboxes.deleteOne({ user });
    return { msg: "Post deleted successfully!" };
  }

  async getResponse(user: ObjectId, prompt: string) {
    const news = await this.getNews(prompt);
    const response = await this.generateResponse(prompt, news!);
    await this.removeLast(user);
    await this.update(user, response!, "ai");
    return response;
  }

  private async getNews(prompt: string) {
    const keywords = await this.generateKeyWords(prompt);
    const q = keywords!.join(",");
    const API_KEY = "KZHRUF576K9VJM0S";
    const BASE_URL = "https://www.alphavantage.co/";
    const response = await axios.get(`${BASE_URL}query?function=NEWS_SENTIMENT&tickers=${q}&time_from=20220410T0130&limit=1000&sort=LATEST&apikey=${API_KEY}`);
    const data = await response.data;
    return await data["feed"];
  }

  private async generateKeyWords(prompt: string) {
    // prompt to be fed into the chat-gpt-api
    const userPrompt = `Generate only one keyword related to the current market trends and factors affecting stock prices. 
    Consider economic indicators, industry news, and geopolitical events. Keywords should include terms such as 
    'stock market,' 'economic forecast,' 'industry performance,' 'global trade,' 'central bank policies,' 
    and any other relevant terms that might impact investment decisions.
    You keyword must be related to this prompt ${prompt}. I am trying to use eyour keyword to search news.
    your output must be only a keyword, nothing more, no quotation marks, no new line mark, no dash, only use space between words.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        { role: "system", content: "You are a helpful assistant and researcher." },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
    });
    const message = response.choices[0];
    return message.message.content;
  }

  private async generateResponse(decision: string, news: string) {
    // prompt to be fed into the chat-gpt-api
    const prompt = `You are a financial analyst analyzing a trading decision. 
    The decision is to ${decision}. Here is the recent news related to this decision: 
    ${news}. Based on this information, what would be the potential impact on the market?`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        { role: "system", content: "You are a financial analyst assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
    });
    const message = response.choices[0];
    return message.message.content;
  }
}

export class PostAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", author, _id);
  }
}
