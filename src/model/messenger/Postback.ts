/**
 * See https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_postbacks
 */
export interface Postback {
  title: string;
  payload: string;
}
