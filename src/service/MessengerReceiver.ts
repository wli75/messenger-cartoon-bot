import { inject, injectable } from "inversify";
import { ActionType } from "../model/messenger/ActionType";
import { Entry } from "../model/messenger/Entry";
import { Event } from "../model/messenger/Event";
import { MessagingType } from "../model/messenger/MessagingType";
import { Postback } from "../model/messenger/Postback";
import { PostbackPayload } from "../model/messenger/PostbackPayload";
import { ReceiveMessage } from "../model/messenger/ReceiveMessage";
import { ReceiveMessaging } from "../model/messenger/ReceiveMessaging";
import { CartoonBot } from "../service/CartoonBot";
import TYPES from "../types";
import logger from "../util/logger";

@injectable()
export class MessengerReceiver {
  private cartoonBot: CartoonBot;

  public constructor(@inject(TYPES.CartoonBot) cartoonBot: CartoonBot) {
    this.cartoonBot = cartoonBot;
  }

  public async handlePageEvent(event: Event): Promise<void> {
    event.entry.forEach((entry: Entry): void => {
      entry.messaging.forEach((messaging: ReceiveMessaging): void => {
        if (messaging.message) {
          this.handleMessage(messaging.sender.id, messaging.message);
        } else if (messaging.postback) {
          this.handlePostback(messaging.sender.id, messaging.postback);
        } else {
          logger.info("Received unknown messaging type");
        }
      });
    });
  }

  private handleMessage(psid: string, message: ReceiveMessage): void {
    if (/help/i.test(message.text)) {
      logger.info(`Received help message [psid: ${psid}]`);
      this.cartoonBot.sendHelpMessage(psid);
    } else if (/show subscription/i.test(message.text)) {
      this.cartoonBot.sendSubscriptionsMessage(psid);
    } else if (/unsubscribe/i.test(message.text)) {
      this.handleUnsubscribeMessage(psid, message.text);
    } else if (/subscribe/i.test(message.text)) {
      this.handleSubscribeMessage(psid, message.text);
    } else if (/notification/i.test(message.text)) {
      this.handleEnableNotificationMessage(psid, message.text);
    } else if (/update/i.test(message.text)) {
      logger.info(`Received update message [psid: ${psid}]`);
      this.cartoonBot.sendCartoonUpdate(psid, MessagingType.Response);
    } else {
      logger.info(`Received unknown message [psid: ${psid}]`);
      this.cartoonBot.sendUnknownMessage(psid);
    }
  }

  private handleUnsubscribeMessage(psid: string, message: string): void {
    const tokens = message.trim().split(/\b\s+/, 2);
    if (tokens.length >= 2) {
      logger.info(
        `Received unsubscribe message [psid: ${psid}, blog name ${tokens[1]}]`
      );
      this.cartoonBot.unsubscribeAndSendMessage(psid, tokens[1]);
    } else {
      logger.info(
        `Received unsubscribe message with unknown blog name [psid: ${psid}]`
      );
      this.cartoonBot.sendUnknownMessage(psid);
    }
  }

  private handleSubscribeMessage(psid: string, message: string): void {
    const tokens = message.trim().split(/\b\s+/, 2);
    if (tokens.length >= 2) {
      logger.info(
        `Received subscribe message [psid: ${psid}, blog name ${tokens[1]}]`
      );
      this.cartoonBot.subscribeAndSendMessage(psid, tokens[1]);
    } else {
      logger.info(
        `Received subscribe message with unknown blog name [psid: ${psid}]`
      );
      this.cartoonBot.sendUnknownMessage(psid);
    }
  }

  private handleEnableNotificationMessage(psid: string, message: string): void {
    const tokens = message.trim().split(/\b\s+/, 2);
    if (tokens.length >= 2 && /on/i.test(tokens[1])) {
      logger.info(`Received enable notification message [psid: ${psid}]`);
      this.cartoonBot.setNotificationFlagAndSendMessage(psid, true);
    } else if (tokens.length >= 2 && /off/i.test(tokens[1])) {
      logger.info(`Received disable notification message [psid: ${psid}]`);
      this.cartoonBot.setNotificationFlagAndSendMessage(psid, false);
    } else {
      logger.info(
        `Received notification message with unknown flag [psid: ${psid}]`
      );
      this.cartoonBot.sendUnknownMessage(psid);
    }
  }

  private handlePostback(psid: string, postback: Postback): void {
    const payload: PostbackPayload = JSON.parse(postback.payload);
    switch (payload.action) {
      case ActionType.StartAction:
        logger.info(`Received start action [psid: ${psid}]`);
        this.cartoonBot.getStarted(psid);
        break;
      default:
        logger.info(
          `Received unknown postback action [${payload.action}] [psid: ${psid}]`
        );
        break;
    }
  }
}
