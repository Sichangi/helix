const moment = require("moment");
const axios = require("axios").default;
// @ts-ignore
const WorldState = require("warframe-worldstate-parser");

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

/**
 * @typedef Mission
 * @type {Object}
 * @property {String} missionType
 * @property {String} modifier
 * @property {String} modifierDescription
 * @property {String} node
 */

/**
 * @typedef SortieResult
 * @type {Object}
 * @property {Number} expiry
 * @property {String} faction
 * @property {String} boss
 * @property {String} availableFor
 * @property {Mission[]} missions
 */

/**
 * Get current sortie
 * @returns {Promise<SortieResult>}
 */
function sortie() {
  return axios
    .get("http://content.warframe.com/dynamic/worldState.php")
    .then(response => response.data)
    .then(data => JSON.stringify(data))
    .then(worldstateData => {
      const ws = new WorldState(worldstateData);

      const result = {
        // @ts-ignore
        expiry: moment(ws.sortie.expiry).unix(),
        // @ts-ignore
        faction: ws.sortie.faction,
        // @ts-ignore
        boss: ws.sortie.boss,
        // @ts-ignore
        availableFor: ws.sortie.eta,
        missions: []
      };

      // @ts-ignore
      ws.sortie.variants.forEach(variant => {
        result.missions.push({
          missionType: variant.missionType,
          modifier: variant.modifier,
          modifierDescription: variant.modifierDescription,
          node: variant.node
        });
      });

      return result;
    });
}

/**
 * @typedef News
 * @type {Object}
 * @property {String} message
 * @property {String} link
 * @property {String} imageLink
 * @property {Number} date
 */

/**
 * Get the current news
 * @returns {Promise<News[]>}
 */
function news() {
  return axios
    .get("http://content.warframe.com/dynamic/worldState.php")
    .then(response => response.data)
    .then(data => JSON.stringify(data))
    .then(worldstateData => {
      const ws = new WorldState(worldstateData);

      const result = [];
      ws.news.reverse();

      ws.news.forEach(item => {
        if (!item.translations.en) {
          return;
        }
        result.push({
          message: item.translations.en,
          link: item.link,
          imageLink: item.imageLink,
          date: moment(item.date).unix()
        });
      });

      return result;
    });
}

/**
 * @typedef VoidTraderResult
 * @type {object}
 * @property {Boolean} active
 * @property {String} location
 * @property {String} start
 * @property {String} end
 * @property {String[]} inventory
 */
/**
 * Void Trader (Baro) details
 * @returns {Promise<VoidTraderResult>}
 */
function voidTrader() {
  return axios
    .get("http://content.warframe.com/dynamic/worldState.php")
    .then(response => response.data)
    .then(data => JSON.stringify(data))
    .then(worldstateData => {
      const ws = new WorldState(worldstateData);

      const result = {
        // @ts-ignore
        active: ws.voidTrader.active,
        // @ts-ignore
        location: ws.voidTrader.location,
        // @ts-ignore
        start: ws.voidTrader.startString,
        // @ts-ignore
        end: ws.voidTrader.endString,
        // @ts-ignore
        inventory: ws.voidTrader.inventory
      };

      return result;
    });
}

/**
 * @typedef EarthResult
 * @type {object}
 * @property {Boolean} isDay
 * @property {String} timeLeft
 */

/**
 * Get earth time
 * @returns {Promise<EarthResult>}
 */
function earth() {
  return axios
    .get("http://content.warframe.com/dynamic/worldState.php")
    .then(response => response.data)
    .then(data => JSON.stringify(data))
    .then(worldstateData => {
      const ws = new WorldState(worldstateData);

      return {
        isDay: ws.earthCycle.isDay,
        timeLeft: ws.earthCycle.timeLeft
      };
    });
}

/**
 * @typedef CetusBounty
 * @type {object}
 * @property {String} type
 * @property {String} enemyLevels
 * @property {String[]} rewardPool
 */
/**
 * @typedef CetusResult
 * @type {object}
 * @property {Boolean} isDay
 * @property {String} timeLeft
 * @property {String} expires
 * @property {CetusBounty[]} bounties
 */
/**
 * Get earth time
 * @returns {Promise<CetusResult>}
 */
function cetus() {
  return axios
    .get("http://content.warframe.com/dynamic/worldState.php")
    .then(response => response.data)
    .then(data => JSON.stringify(data))
    .then(worldstateData => {
      const ws = new WorldState(worldstateData);

      const bounties = [];
      let expires = "";

      ws.syndicateMissions.forEach(mission => {
        if (mission.syndicate == "Ostrons") {
          mission.jobs.forEach(job => {
            bounties.push({
              type: job.type,
              enemyLevels: `${job.enemyLevels[0]} - ${job.enemyLevels[1]}`,
              rewardPool: job.rewardPool
            });
          });

          expires = mission.eta;
        }
      });

      return {
        isDay: ws.cetusCycle.isDay,
        timeLeft: ws.cetusCycle.timeLeft,
        bounties,
        expires
      };
    });
}

/**
 * @typedef Fissure
 * @type {object}
 * @property {string} node
 * @property {string} missionType
 * @property {string} enemy
 * @property {string} tier
 * @property {string} expires
 */

/**
 * Get current fissure missions
 * @returns {Promise<Fissure[]>}
 */
function fissures() {
  return axios
    .get("http://content.warframe.com/dynamic/worldState.php")
    .then(response => response.data)
    .then(data => JSON.stringify(data))
    .then(worldstateData => {
      const ws = new WorldState(worldstateData);

      const results = [];

      ws.fissures.forEach(fissure => {
        results.push({
          node: fissure.node.replace(" (", "/").replace(")", ""),
          missionType: fissure.missionType,
          enemy: fissure.enemy,
          tier: fissure.tier,
          expires: fissure.eta
        });
      });

      return results;
    });
}

module.exports = { alerts, sortie, news, voidTrader, earth, cetus, fissures };
