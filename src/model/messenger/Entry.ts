import { ReceiveMessaging } from "./ReceiveMessaging";

/**
 * See https://developers.facebook.com/docs/messenger-platform/reference/webhook-events
 */
export interface Entry {
  id: string;
  time: number;
  messaging: ReceiveMessaging[];
}
