import { Request } from "express";
import { inject } from "inversify";
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  interfaces,
} from "inversify-express-utils";
import { Event } from "../model/messenger/Event";
import { MessengerReceiver } from "../service/MessengerReceiver";
import TYPES from "../types";
import logger from "../util/logger";

@controller("/webhook")
export class MessengerController extends BaseHttpController {
  private messengerReceiver: MessengerReceiver;

  public constructor(
    @inject(TYPES.MessengerReceiver) messengerReceiver: MessengerReceiver
  ) {
    super();
    this.messengerReceiver = messengerReceiver;
  }

  @httpGet("/")
  public validateWebhook(req: Request): interfaces.IHttpActionResult {
    logger.info("[Try] Validate webhook");
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      logger.info("[Success] Webhook validation successful");
      return this.ok(challenge);
    } else {
      logger.info("[Failure] Webhook validation failed");
      return this.statusCode(403);
    }
  }

  @httpPost("/")
  public handleEvent(req: Request): interfaces.IHttpActionResult {
    const event: Event = req.body;
    if (event.object === "page") {
      this.messengerReceiver.handlePageEvent(event);
      // Must send back a 200 within 20 seconds. Otherwise, the request will time out and the msg will be resent.
      return this.ok();
    } else {
      return this.notFound();
    }
  }
}
