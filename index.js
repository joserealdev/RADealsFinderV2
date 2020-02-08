const { telegramtoken } = require("./config.json");
const cron = require("node-cron");
const TelegramBot = require("node-telegram-bot-api");
const { checkNow } = require("./src/check");

const bot = new TelegramBot(telegramtoken, { polling: true });

bot.onText(/\/checknow/, (msg, match) => {
  checkNow(msg.chat.id)
    .then(res => {
      res.forEach(clientData => {
        bot.sendMessage(clientData.uid, clientData.message, {
          parse_mode: "Markdown",
          disable_web_page_preview: true
        });
      });
    })
    .catch(e => {
      bot.sendMessage(msg.chat.id, "No tienes vuelos");
    });
});

bot.onText(/^(?!\/addroute)/, (msg, match) => {});

bot.onText(/\/deleteroute(.*)/, (msg, match) => {});

bot.onText(/\/addroute/, (msg, match) => {});

bot.onText(/\/help/, (msg, match) => {
  sendHelp(msg.chat.id);
});

bot.onText(/\/start/, (msg, match) => {
  sendHelp(msg.chat.id);
});

cron.schedule("0 7,11,15,18,21 * * *", () => {
  checkNow().then(res => {
    res.forEach(clientData => {
      bot.sendMessage(clientData.uid, clientData.message);
    });
  });
});
