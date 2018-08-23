const db = require('../../db')
const {LiveReward} = require('../../db/models')
const alerts = require('./alerts')
// const bounties = require('./bounties')

const schedules = {
    // Every 10 minutes
    alerts: "10 * * * *",
    // Every 30 minutes
    bounties: "* 30 * * * *"
}

function manage(command, queryItem, userId, context) {
    let collectionRef = null
    let task = null

    if(!context || !userId) throw new Error("Expected a userId and context, [One of them is missing]")

    if (context === "alerts") {
        collectionRef = db.ALERTREF
        task = alerts.task
    } else if (context === "bounties") {
        collectionRef = db.BOUNTYREF
        // task = bounties.task
    }

    switch (command) {
        case 'add':
            if(!queryItem) throw new Error("Expected a queryItem, none was provided")
            let value = new LiveReward(queryItem, userId)
            db.push(collectionRef, {value})
            break;
        case 'remove':
            if(!queryItem) throw new Error("Expected a queryItem, none was provided")
            db.remove(collectionRef, {value: queryItem})
            break;
        case 'start':
            db.set(collectionRef, {value: true})
            task.start()
            break;
        case 'stop':
            db.set(collectionRef, {value: false})
            task.stop()
            break;
        default:
            throw new Error(`Unknown command : ${command}`)
    }
}


module.exports = {
    manage,
    schedules: schedules
}