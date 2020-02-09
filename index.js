const { telegramtoken } = require("./config.json");
const cron = require("node-cron");
const TelegramBot = require("node-telegram-bot-api");
const { checkNow } = require("./src/check");

const bot = new TelegramBot(telegramtoken, { polling: true });

bot.onText(/\/checknow/, (msg, match) => {
  checkNow(msg.chat.id)
    .then(res => {
      res.forEach(clientData => {
        sendMessage(clientData.uid, clientData.message);
      });
    })
    .catch(e => {
      sendMessage(msg.chat.id, "No tienes vuelos");
    });
});

cron.schedule("0 7,11,15,18,21 * * *", () => {
  checkNow().then(res => {
    res.forEach(clientData => {
      sendMessage(clientData.uid, clientData.message);
    });
  });
});

const sendMessage = (uid, text) => {
  bot.sendMessage(uid, text, {
    parse_mode: "Markdown",
    disable_web_page_preview: true
  });
};
