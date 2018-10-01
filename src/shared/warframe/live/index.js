const {sendRegularMessage} = require("../../../slack/messaging");
const db = require("../../db");
const {LiveReward} = require("../../db/models");

const schedules = {
  // Every 5 minutes
  alerts: "* */5 * * * *",
};

function manage(command, queryItem, userId, context) {
  /* Declared here to avoid cyclic dependency issue [A requires B requires A] */
  const alerts = require("./alerts");

  let collectionRef;
  let task;
  let reward;

  if (!context) {throw new Error("Expected a context to manage the live watch, None provided");}

  if (context === "alerts") {
    collectionRef = db.ALERTREF;
    task = alerts.task;
  }

  if (command === "add" || command === "remove") {
    if (!queryItem || !userId) {throw new Error("Expected a queryItem, none was provided");}
    reward = new LiveReward(queryItem, userId);
  }

  switch (command) {
  case "add":
    if(!db.get(collectionRef, "watchList").find(({item, user}) => item.toLowerCase() === queryItem.toLowerCase() && user === userId)){
      db.push(collectionRef, {key: "watchList", value: reward});
      sendResponse(`I'm now watching for ${queryItem} ${context}`);
    } else {
      sendResponse("Oops, am already watching for that");
    }
    break;
  case "remove":
    db.remove(collectionRef, {key: "watchList", value: reward});
    sendResponse(`I'm no longer watching for ${queryItem} ${context}`);
    break;
  case "start":
    db.set(collectionRef, {key: "isWatching", value: true});
    task.start();
    sendResponse(`Successfully started watching ${context}`);
    break;
  case "stop":
    db.set(collectionRef, {key: "isWatching", value: false});
    task.stop();
    sendResponse(`Successfully stopped watching ${context}`);
    break;
  default:
    throw new Error(`Unknown command : ${command}`);
  }

  function sendResponse(message) {
    sendRegularMessage(message, userId, true);
  }
}

// TODO: Find appropriate error reporting strategy for failing crons [if they do fail]...
module.exports = {
  manage,
  schedules
};
