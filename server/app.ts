import FriendConcept from "./concepts/friend";
import MoneyConcept from "./concepts/money";
import PortfolioConcept from "./concepts/portfolio";
import PostConcept from "./concepts/post";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const Money = new MoneyConcept();
export const Portfolio = new PortfolioConcept();
