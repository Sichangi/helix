const db = require("../../db");
const {LiveReward} = require("../../db/models");
const {Subject} = require("rxjs");

const messageSubject = new Subject();
const schedules = {
  // Every 5 minutes
  alerts: "* */5 * * * *",
};

function manage(responseBody, context) {
  /* Declared here to avoid cyclic dependency issue [A requires B requires A] */
  const alerts = require("./alerts");
  const userId = responseBody.user_id;
  const request = responseBody.text.split(":");
  const command = request[1];
  const queryItem = request[2] || false;

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
  case "list":
    sendResponse(`[${context.toUpperCase()}] Here is the list of rewards you are watching:`, getUserRewards());
    break;
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
    sendErrorResponse(`Unknown command : ${context}:${command}`);
  }

  function getUserRewards(){
    const val = db.get(collectionRef, "watchList")
      .filter(({user}) => user === userId)
      .map(({item}) => ({text: item.charAt(0).toUpperCase() + item.slice(1)}));
    return val.length > 0? val : [{text: "You're currently not watching anything///"}];
  }

  function sendResponse(message, attachments) {
    messageSubject.next({message, userId, attachments});
  }

  function sendErrorResponse(message){
    messageSubject.error({message, fromErrResponseBody: responseBody});
  }
}

// TODO: Find appropriate error reporting strategy for failing crons [if they do fail]...
module.exports = {
  messageSubject,
  manage,
  schedules
};
