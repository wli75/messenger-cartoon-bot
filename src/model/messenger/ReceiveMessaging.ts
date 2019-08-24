import { Id } from "./Id";
import { Postback } from "./Postback";
import { ReceiveMessage } from "./ReceiveMessage";

/**
 * See https://developers.facebook.com/docs/messenger-platform/reference/webhook-events
 */
export interface ReceiveMessaging {
  sender: Id;
  recipient: Id;
  message?: ReceiveMessage;
  postback?: Postback;
}
