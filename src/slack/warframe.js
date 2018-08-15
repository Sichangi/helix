const winston = require("winston");
const moment = require("moment");
const warframe = require("./../shared/warframe");
const messaging = require("./messaging");

function slashWF(requestBody) {
  const command = requestBody.text.split(":")[0];

  /* eslint-disable indent */
  switch (command) {
    case "help":
      help(requestBody);
      break;
    case "search":
      search(requestBody);
      break;
    case "get":
      get(requestBody);
      break;
    case "alerts":
      alerts(requestBody);
      break;
    case "sortie":
      sortie(requestBody);
      break;
    case "news":
      news(requestBody);
      break;
    default:
      unknown(requestBody);
      break;
  }
  /* eslint-enable indent */
}

/**
 * Send the default response
 */
function unknown(requestBody) {
  const command = requestBody.command;
  winston.warn(`Unknown command: \`${command} ${requestBody.text}`);
  messaging
    .sendSlashMessage(
      requestBody.response_url,
      "ephemeral",
      `¯\\_(ツ)_/¯\nMaybe try \`${command} help\``
    )
    .catch(error => handleError(error, requestBody));
}

/**
 * Send help
 */
function help(requestBody) {
  const command = requestBody.command;

  const attachments = [
    {
      title: "Help",
      fallback: "Help",
      text: "Gives a desription of the available commands"
    },
    {
      title: "search",
      fallback: "search",
      text: `Searches the wiki e.g. \`${command} search:argon\``
    },
    {
      title: "get",
      fallback: "get",
      text: `Return the first item from the wiki e.g. \`${command} get:argon scope\``
    },
    {
      title: "alerts",
      fallback: "alerts",
      text: `Returns the current alerts e.g. \`${command} alerts\``
    },
    {
      title: "sortie",
      fallback: "sortie",
      text: `Returns the current sortie e.g. \`${command} sortie\``
    },
    {
      title: "news",
      fallback: "news",
      text: `Returns the current news e.g. \`${command} news\``
    }
  ];

  messaging
    .sendSlashMessage(
      requestBody.response_url,
      "ephemeral",
      "Here are the available commands",
      attachments
    )
    .catch(error => handleError(error, requestBody));
}

/**
 * Search the wiki
 */
function search(requestBody) {
  const query = requestBody.text.split(":")[1];

  warframe.wiki
    .search(query)
    .then(results => {
      const attachments = [];

      results.forEach(result => {
        attachments.push({
          fallback: result.title,
          title: result.title,
          text: result.description,
          title_link: result.url
        });
      });

      const responseTitle = `Here are the results for *${query}*`;

      return messaging.sendSlashMessage(
        requestBody.response_url,
        "in_channel",
        responseTitle,
        attachments
      );
    })
    .catch(error => handleError(error, requestBody, query));
}

/**
 * Get details of an item
 */
function get(requestBody) {
  const query = requestBody.text.split(":")[1];

  warframe.wiki
    .getDetails(query)
    .then(result => {
      const responseTitle = `Here is the top result for *${query}*`;

      const attachments = [
        {
          fallback: result.title,
          title: result.title,
          text: result.description,
          title_link: result.url
        },
        {
          fallback: "Image",
          image_url: result.image_url
        }
      ];

      return messaging.sendSlashMessage(
        requestBody.response_url,
        "in_channel",
        responseTitle,
        attachments
      );
    })
    .catch(error => handleError(error, requestBody, query));
}

/**
 * Get the current alerts
 */
function alerts(requestBody) {
  warframe.worldstate
    .alerts()
    .then(results => {
      const attachments = [];

      results.forEach(alert => {
        let text = `${alert.node}\n${alert.faction} level ${
          alert.minEnemyLevel
        } - ${alert.maxEnemyLevel}`;

        if (alert.archwing) {
          text = `${alert.node} (Archwing)\n${alert.faction} level ${
            alert.minEnemyLevel
          } - ${alert.maxEnemyLevel}`;
        }

        attachments.push({
          title: alert.type,
          fallback: alert.type,
          text,
          thumb_url: alert.reward.thumbnail,
          fields: [
            {
              title: "Rewards",
              value: alert.reward.asString.replace("cr", " credits")
            }
          ],
          footer: "Avalable until",
          ts: alert.expiry
        });
      });

      return messaging.sendSlashMessage(
        requestBody.response_url,
        "in_channel",
        "",
        attachments
      );
    })
    .catch(error => handleError(error, requestBody));
}

function sortie(requestBody) {
  warframe.worldstate
    .sortie()
    .then(result => {
      const attachments = [];

      result.missions.forEach(mission => {
        const text = `${mission.node}\n${mission.modifier}\n${
          mission.modifierDescription
        }`;
        attachments.push({
          title: mission.missionType,
          fallback: mission.missionType,
          text
        });
      });
      return messaging.sendSlashMessage(
        requestBody.response_url,
        "in_channel",
        `Here is the current sortie.\nBoss: *${result.boss}*\nFaction: *${
          result.faction
        }*\nExpires in *${result.availableFor}*`,
        attachments
      );
    })
    .catch(error => handleError(error, requestBody));
}

/**
 * Return current news
 */
function news(requestBody) {
  warframe.worldstate
    .news()
    .then(news => {
      const attachmets = [];
      news.forEach(item => {
        attachmets.push({
          fallback: item.message,
          title: item.message,
          title_link: item.link,
          footer: moment.unix(item.date).format("h:mm a, ddd D MMM")
        });
      });

      return messaging.sendSlashMessage(
        requestBody.response_url,
        "in_channel",
        "",
        attachmets
      );
    })
    .catch(error => handleError(error, requestBody));
}

/**
 * Handle error for warframe requests
 */
function handleError(error, requestBody, query = "") {
  if (
    error.message == "No results found." ||
    error.message == "Request failed with status code 404"
  ) {
    error.message = `No results found for *"${query}"*`;
  }
  winston.error(error.message);

  const attachments = [
    {
      fallback: "Error",
      title: "Error",
      text: error.message,
      color: "danger"
    }
  ];

  messaging
    .sendSlashMessage(
      requestBody.response_url,
      "ephemeral",
      "Error",
      attachments
    )
    .catch(error => handleError(error, requestBody));
}

module.exports = { slashWF, alerts };
