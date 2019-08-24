// declare metadata by @controller annotation
import "./controller/MessengerController";

import { Container } from "inversify";
import { InstagramDao } from "./dao/InstagramDao";
import { CartoonBot } from "./service/CartoonBot";
import { InstagramService } from "./service/InstagramService";
import { MessengerReceiver } from "./service/MessengerReceiver";
import { MessengerSender } from "./service/MessengerSender";
import TYPES from "./types";

const container = new Container();
container
  .bind<MessengerReceiver>(TYPES.MessengerReceiver)
  .to(MessengerReceiver);
container.bind<MessengerSender>(TYPES.MessengerSender).to(MessengerSender);
container.bind<CartoonBot>(TYPES.CartoonBot).to(CartoonBot);
container.bind<InstagramService>(TYPES.InstagramService).to(InstagramService);
container.bind<InstagramDao>(TYPES.InstagramDao).to(InstagramDao);

export default container;
