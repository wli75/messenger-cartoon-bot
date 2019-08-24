# messenger-cartoon-bot

A Facebook Messenger bot that sends cartoon updates from Instagram.

## Getting Started
You can either run the bot on Glitch or on your local machine.

### Run on Glitch
https://glitch.com/~messenger-cartoon-bot

### Run on local machine
* Clone the repository
```
git clone https://github.com/wli75/messenger-cartoon-bot.git
```
* Install dependencies, build and run the project
```
npm install
npm run build
npm start
```

## Demo

| Command         | Description                                                      |
| --------------- | -----------------------------------------------------------------|
| get started     | Triggered by the "Get Started" button. Sends a greeting message. |
| help            | Display a list of available commands.                            |

![screenshot for get started and help](https://raw.githubusercontent.com/wli75/messenger-cartoon-bot/master/asset/getStarted_help.PNG =250x)

| Command               | Description                                                    |
| --------------------- | ---------------------------------------------------------------|
| show subscription     | List Instagram accounts you're subscribed for cartoon updates. |
| subscribe [account]   | Subscribe to an Instagram account for cartoon updates.         |
| unsubscribe [account] | Unsubscribe from an Instagram account for cartoon updates.     |

![screenshot for subscription](https://raw.githubusercontent.com/wli75/messenger-cartoon-bot/master/asset/subscription.PNG)

| Command               | Description                                                                |
| --------------------- | ---------------------------------------------------------------------------|
| notification [on/off] | Turn on/off cartoon update notification. By default, it's on.              |
| update                | Check if there are cartoon updates. This is useful if notification is off. |

![screenshot for notification](https://raw.githubusercontent.com/wli75/messenger-cartoon-bot/master/asset/notification.PNG)

| Command             | Description                           |
| ------------------- | --------------------------------------|
| unsupported command | Sends a "I don't understand" message. |

![screenshot for unsupported command](https://raw.githubusercontent.com/wli75/messenger-cartoon-bot/master/asset/unknown.PNG)

## Technologies used
### `dependencies`

| Package         | Description                                      |
| --------------- | -------------------------------------------------|
| express         | Node.js web framework                            |
| request         | HTTP request library                             |
| inversify       | Dependency injection framework                   |
| better-sqlite3  | Sqlite database                                  |
| puppeteer       | Web-scraping                                     |
| winston         | Logging library                                  |
| morgan          | HTTP request logging middleware for node.js      |

### `devDependencies`

| Package        | Description                        |
| -------------- | ---------------------------------- |
| typescript     | JavaScript compiler/type checker   |
| eslint         | Linter                             |
| prettier       | Ensure consistent code format      |
| jest           | Testing library                    |
