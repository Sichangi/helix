const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");

const DB = new low(adapter);
DB.defaults({
  bounties: {isWatching: false, watchList: [], sentList: []},
  alerts: {isWatching: false, watchList: [], sentList: []}
}).write();

class Database {
  constructor() {
    this.ALERTREF = "alerts";
    this.BOUNTYREF = "bounties";

    this._storage = DB;
  }

  get(collection, key) {
    return this._storage.get(`${collection}.${key}`).value();
  }

  set(collection, {key, value}) {
    this._storage.set(`${collection}.${key}`, value).write();
  }

  push(collection, {key, value}) {
    this._storage
      .get(`${collection}.${key}`)
      .push(value)
      .write();
  }

  remove(collection, {key = "watchList", value}) {
    this._storage
      .get(`${collection}.${key}`)
      .remove(value)
      .write();
  }
}

module.exports = new Database();
