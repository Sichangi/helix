/**
 * @typedef AlertReward
 * @type {object}
 * @property {String[]} items List if item rewards
 * @property {Number} credits Credit rewards
 * @property {String} asString Rewards as a string
 * @property {String} thumbnail Reward thumbnail
 */

/**
 * @typedef Alert
 * @type {object}
 * @property {Number} expiry expiry in seconds
 * @property {String} type Mission type
 * @property {String} node Mission node
 * @property {String} faction Mission faction
 * @property {Number} minEnemyLevel Min enemy level
 * @property {Number} maxEnemyLevel Max enemy level
 * @property {Boolean} archwing Requires archwing
 * @property {AlertReward} reward
 */

const moment = require("moment");
const axios = require("axios").default;
const WorldState = require("warframe-worldstate-parser");

/**
 * Get current alerts
 * @returns {Promise<Alert[]>} alerts
 */
function alerts() {
  return axios
    .get("http://content.warframe.com/dynamic/worldState.php")
    .then(response => response.data)
    .then(data => JSON.stringify(data))
    .then(worldstateData => {
      const ws = new WorldState(worldstateData);

      const result = [];

      ws.alerts.forEach(alert => {
        result.push({
          expiry: moment(alert.expiry).unix(),
          type: alert.mission.type,
          node: alert.mission.node.replace(" (", "/").replace(")", ""),
          faction: alert.mission.faction,
          minEnemyLevel: alert.mission.minEnemyLevel,
          maxEnemyLevel: alert.mission.maxEnemyLevel,
          archwing: alert.mission.archwingRequired,
          reward: {
            items: alert.mission.reward.items,
            credits: alert.mission.reward.credits,
            asString: alert.mission.reward.asString,
            thumbnail: alert.mission.reward.thumbnail
          }
        });
      });

      return result;
    });
}

module.exports = { alerts };
