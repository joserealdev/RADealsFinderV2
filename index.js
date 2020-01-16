const { telegramtoken } = require("./config.json");
const cron = require("node-cron");
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(telegramtoken, { polling: true });

bot.onText(/\/checknow/, (msg, match) => {});

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
  checkNow();
});
