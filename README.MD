# 🤖 Helix

A [Warframe](https://www.warframe.com/) ~~bot~~ cephalon.  

The bot is created in a way that enables it to be extended to support any bots or a rest api.  
See **Adding other bots**.

## Installation
1. Clone this repository `git clone https://github.com/MarkNjunge/helix.git`
2. Create a .env file similar to _.env.sample_. See **configuration** for options.​
3. Start using `yarn start`

## Configuration

| Environment variable | Description                              |
| -------------------- | ---------------------------------------- |
| PORT                 | (optional) Sets the port to run the app on. It can alternatively be set using as the first parameter in the run command `yarn start 4200`, using Docker port configuration, or excluded to run on 3000. |
| SLACK_OAUTH          | (optional) Required if if the bot is used with Slack |


## Functions
Examples assume that a Slack slash command `/wf` has been configured to be fulfilled by `/slack/slashes/warframe`  

Use `/wf help` for available commands.

### Wiki search 
Returns the results from the Warframe Wiki.  
Example usage: `/wf search:argon`

### Get a page from the wiki
Similar to search but returns the first result and an image (if present).  
Example usage: `/wf get:argon scope`

### Alerts
Returns the current alerts.
Example usage: `/wf alerts`

## Adding other bots

Create a folder in src for the bot e.g. _src/discord_. This folder should **only** contain code specific to that bot, all core functions should go under _src/shared_.