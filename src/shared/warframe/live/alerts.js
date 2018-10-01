const {alerts} = require("../worldstate");
const db = require("../../db");
const cron = require("node-cron");
const {schedules, messageSubject} = require("./");

/**
 *
 * @param watchArray {Array<LiveReward>}
 * @returns {Promise<Array>}
 */
async function filterAlerts(watchArray) {
  const currentAlerts = await alerts();

  const alertUpdates = [];

  watchArray.forEach(({item}, index) => {
    const thisAlert = watchArray[index];
    const found = currentAlerts.find(({reward}) => reward.asString.toLowerCase().indexOf(item.toLowerCase()) !== -1);
    if (found) {
      thisAlert.expiry = found.expiry;
      thisAlert.mission = found;
      alertUpdates.push(thisAlert);
    }
  });

  return alertUpdates;
}

function sendAlertUpdate(rewardUpdate) {
  db.push(db.ALERTREF, {
    key: "sentList",
    value: rewardUpdate.mission
  });

  const alert = rewardUpdate.mission;

  const message = {
    title: `[Alert] ${alert.type} mission rewarding ${rewardUpdate.item} is Available`,
    fallback: alert.type,
    text: `${alert.node}${alert.archwing ? " (Archwing)" : " "}\n${alert.faction} level ${alert.minEnemyLevel} - ${alert.maxEnemyLevel}`,
    thumb_url: alert.reward.thumbnail,
    fields: [
      {
        title: "Rewards",
        value: alert.reward.asString.replace("cr", " credits")
      }
    ],
    footer: "Available until",
    ts: alert.expiry
  };

  messageSubject.next({message: `Some ${rewardUpdate.item} reward is available`, userId: rewardUpdate.user, attachments: [message]});
}

exports.task = cron.schedule(schedules.alerts, async () => {
  const watchList = db.get(db.ALERTREF, "watchList");
  const isWatching = db.get(db.ALERTREF, "isWatching");

  if (isWatching && watchList.length > 0) {
    const available = await filterAlerts(watchList);
    available.forEach(update => {
      const dbVal = db.get(db.ALERTREF, "sentList");

      if (!dbVal.find(({expiry}) => expiry === update.mission.expiry)) {
        sendAlertUpdate(update);
      }
    });
  }
}, true);
