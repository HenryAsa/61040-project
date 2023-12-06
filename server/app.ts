import ChatConcept from "./concepts/chatbox";
import FriendConcept from "./concepts/friend";
import InterestConcept from "./concepts/interests";
import MediaConcept from "./concepts/media";
import MoneyConcept from "./concepts/money";
import PostConcept from "./concepts/post";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const AIAgent = new ChatConcept();
export const Friend = new FriendConcept();
export const Interest = new InterestConcept();
export const Media = new MediaConcept();
export const Money = new MoneyConcept();
export const Post = new PostConcept();
export const User = new UserConcept();
export const WebSession = new WebSessionConcept();
