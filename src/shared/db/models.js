class LiveReward {
    constructor(itemName, user) {
        if(!user || !itemName) throw "Invalid input, itemName and user must be provided"
        this.item = itemName
        this.user = user
        this._expiry = ""
        this._latestMission = {}
    }

    set mission(mission) {
        this._latestMission = mission
    }

    get mission() {
        return this._latestMission
    }

    set expiry(stamp) {
        this._expiry = stamp
    }
}

module.exports = {
    LiveReward: LiveReward
}