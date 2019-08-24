import { Attachment } from "./Attachment";

/**
 * See https://developers.facebook.com/docs/messenger-platform/reference/send-api
 */
export interface SendMessage {
  text?: string;
  attachment?: Attachment;
}
