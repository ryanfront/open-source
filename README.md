# telegram-bot-starter

a half-baked, bug-infested telegram bot starter kit that somehow still works.  
this repo is basically duct tape, coffee, and late-night regrets — but hey, it’s open source, so you can suffer too.

##  features
- **.env loader**: because hardcoding secrets is how you end up on hackernews.
- **command autoloader**: drop js files in `/commands` and pray it actually loads.
- **hot reload**: changes are picked up automatically (when it doesn’t crash).
- **graceful shutdown**: catches sigint/sigterm so your bot doesn’t ragequit mid-message.
- **error handling**: logs everything except your tears.

##  setup

```bash
# clone this dumpster fire
git clone https://github.com/your-username/telegram-bot-starter.git
cd telegram-bot-starter

# install the stuff
npm install

# create a .env file:
TELEGRAM_TOKEN=your-telegram-bot-token-here
```

## usage
```bash
# start the bot:
node index.js
- commands live in the /commands folder.
- each command file needs a metadata block like this at the top:

/*---
cmd: hello
desc: says hi to the user
---*/

export default (ctx) => {
  ctx.reply("hi, human.");
};

that makes /hello work inside telegram.
the parser ignores everything else — including your dignity.
```

## contribute

this is an open invite for fixes and improvements.
fork, make a branch, and open a pull request. or just open issues and complain, that works too.

## disclaimer

this bot is not production-ready. use at your own risk.
if it breaks, you get to keep both pieces.
