const axios = require("axios").default;
const config = require("./../config");

/**
 * Send a regular message
 * @param {String} text Message
 * @param {String} channel Channel id
 * @param {Boolean} as_user
 * @param {Object} attachments Message attachments
 */
function sendRegularMessage(text, channel, as_user, attachments = []) {
  return axios({
    method: "post",
    url: "https://slack.com/api/chat.postMessage",
    headers: { Authorization: `Bearer ${config.slackOauth}` },
    data: {
      text,
      as_user,
      channel,
      attachments
    }
  });
}

/**
 * Send a message in response to a slash command
 * @param {String} response_url Message response url received in the body
 * @param {String} response_type in_channel or ephemeral
 * @param {String} text Message text
 * @param {Object} attachments Message
 */
function sendSlashMessage(response_url, response_type, text, attachments = []) {
  return axios({
    method: "post",
    url: response_url,
    headers: { "Content-type": "application/json" },
    data: {
      response_type,
      text,
      attachments
    }
  });
}

module.exports = {
  sendRegularMessage,
  sendSlashMessage
};
