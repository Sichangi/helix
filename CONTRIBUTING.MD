# Contributing

## Things to contribute

- Bug fixes.
- New features.
- Support for new bots.

## How to contribute

1. Fork and clone the repository
2. Create your branch: `git checkout -b fix-my-bugfix`
3. Commit your changes: `git commit -m "Fix bug"`
4. Push to the branch: `git push origin fix-my-bugfix`
5. Submit a pull request.

### Adding other bots

Create a folder in src for the bot e.g. _src/discord_. This folder should **only** contain code specific to that bot, all core functions should go under _src/shared_.

## Things to note

- Make sure you're code matches the [eslint config](./.eslintrc.json) and the general code style (imports, exports, bracket positions e.t.c).

- Any _core_ code, i.e. code in src/shared, should have jsdoc comments. Descriptions don't matter but types should be correct.

- If you are using [VS Code](https://code.visualstudio.com/), the settings in _.vscode_ will achieve the desired formatting.

- It'll be ideal if you create an issue before making a pull request.
