import { Entry } from "./Entry";

/**
 * See https://developers.facebook.com/docs/messenger-platform/reference/webhook-events
 */
export interface Event {
  object: string;
  entry: Entry[];
}
