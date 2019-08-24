import { AttachmentPayload } from "./AttachmentPayload";
import { AttachmentType } from "./AttachmentType";

/**
 * See https://developers.facebook.com/docs/messenger-platform/reference/send-api
 */
export interface Attachment {
  type: AttachmentType;
  payload: AttachmentPayload;
}
