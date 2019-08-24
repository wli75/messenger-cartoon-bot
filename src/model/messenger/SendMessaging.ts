import { Id } from "./Id";
import { MessagingType } from "./MessagingType";
import { SendMessage } from "./SendMessage";
import { Tag } from "./Tag";

/**
 * See https://developers.facebook.com/docs/messenger-platform/reference/send-api
 */
export interface SendMessaging {
  message_type: MessagingType;
  recipient: Id;
  message: SendMessage;
  tag?: Tag;
}
