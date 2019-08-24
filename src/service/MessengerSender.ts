import { injectable } from "inversify";
import { AttachmentType } from "../model/messenger/AttachmentType";
import { MessagingType } from "../model/messenger/MessagingType";
import { SendMessaging } from "../model/messenger/SendMessaging";
import logger from "../util/logger";
import request = require("request");
import { Tag } from "../model/messenger/Tag";

@injectable()
export class MessengerSender {
  private MESSAGES_URI = "https://graph.facebook.com/v2.6/me/messages";

  public sendText(psid: string, msg: string, msgType: MessagingType): void {
    const json: SendMessaging = {
      message_type: msgType,
      recipient: { id: psid },
      message: { text: msg },
    };
    this.sendMessage(psid, json);
  }

  public sendImage(
    psid: string,
    url: string,
    msgType: MessagingType,
    tag?: Tag
  ): void {
    const json: SendMessaging = {
      message_type: msgType,
      recipient: { id: psid },
      message: {
        attachment: {
          type: AttachmentType.Image,
          payload: { url: url, is_reusable: true },
        },
      },
      tag: tag,
    };
    this.sendMessage(psid, json);
  }

  private sendMessage(psid: string, json: SendMessaging): void {
    request(
      {
        uri: this.MESSAGES_URI,
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: "POST",
        json: json,
      },
      (err, res, body): void => {
        if (!err) {
          logger.info(`[Success] Message sent [psid: ${psid}]`);
        } else {
          logger.error(
            `[Failure] Failed to send message [psid: ${psid}]: ${err}`
          );
        }
      }
    );
  }
}
