/**
 * See https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messages
 */
export interface ReceiveMessage {
  mid: string;
  text: string;
}
