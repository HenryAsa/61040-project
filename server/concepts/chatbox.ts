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
    await this.update(
      user,
      `This might take up to one minute. We appreciate your pateince as we are analazing your
    decision. We are also finding recent news.`,
      "ai",
    );
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
    let keyword;
    try {
      keyword = await this.generateKeyWord(prompt);
    } catch (e) {
      console.log(e);
    }
    const apiKey = "84e797c15318481497b234586bf54b06";
    const apiUrl = "https://newsapi.org/v2/everything";
    const parameters = {
      q: keyword, // Change 'technology' to your desired topic or keyword
      language: "en", // Language of the articles (e.g., 'en' for English)
      apiKey: apiKey,
    };
    const articles = await axios.get(apiUrl, { params: parameters }).catch((error) => {
      console.error("Error fetching news:", error);
    });
    let articleContent = "";
    for (const article of articles!.data.articles) {
      articleContent += "One of the articles is as follows \n";
      articleContent += article.content;
    }
    return articleContent;
  }

  private async generateKeyWord(prompt: string) {
    // prompt to be fed into the chat-gpt-api
    const userPrompt = `I am giving you the following prompt: ${prompt}. This prompt is related to investing and trading.
    Give me exactly one keyword that I can use to search for news article related to this prompt. Please return a keyword without any extra words or characters`;
    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        { role: "system", content: "You are a helpful assistant and researcher." },
        { role: "user", content: userPrompt },
      ],
      temperature: 0,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
    });
    const keyword = response.choices[0].message.content;
    return keyword;
  }

  private async generateResponse(decision: string, news: string) {
    // prompt to be fed into the chat-gpt-api
    const prompt = `You are a financial analyst analyzing a trading decision, thought, or idea. 
    The idea is to ${decision}. Here is the recent news related to this decision: 
    ${news}. 
    Based on this information, what would be the potential impact on the market?`;

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
