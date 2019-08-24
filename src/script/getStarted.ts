import request = require("request");

/**
 * Register the payload of the get_started button.
 * See https://developers.facebook.com/docs/messenger-platform/reference/messenger-profile-api/ ,
 * https://developers.facebook.com/docs/messenger-platform/reference/messenger-profile-api/get-started-button/
 */

const MESSENGER_PROFILE_URI = `https://graph.facebook.com/v4.0/me/messenger_profile?access_token=${process.env.PAGE_ACCESS_TOKEN}`;
const payload = {
  action: "start_action",
};
const body = {
  get_started: {
    payload: JSON.stringify(payload),
  },
};

request(
  {
    uri: MESSENGER_PROFILE_URI,
    method: "POST",
    json: body,
  },
  (err, res, body): void => {
    if (!err) {
      console.log(`[Success] Response: ${JSON.stringify(res)}`);
    } else {
      console.error(`[Failure] Failed to send message: ${err}`);
    }
  }
);
