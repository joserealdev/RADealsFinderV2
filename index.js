const { telegramtoken } = require("./config.json");
const cron = require("node-cron");
const TelegramBot = require("node-telegram-bot-api");
const { ACTIONS, LITERALS } = require("./data/properties.json");
const { checkNow } = require("./src/check");
const { deleteFlight, showFlights } = require("./src/delete");
const { isUserAllowed } = require("./src/helpers");

const bot = new TelegramBot(telegramtoken, { polling: true });

bot.onText(/\/checknow/, (msg, match) => {
  const chatID = msg.chat.id;
  if (isUserAllowed(chatID)) {
    checkNow(chatID)
      .then(res => {
        res.forEach(clientData => {
          sendMessage(clientData.uid, clientData.message);
        });
      })
      .catch(e => {
        sendMessage(chatID, e || LITERALS.NO_FLIGHTS);
      });
  } else {
    sendMessage(chatID, LITERALS.NOT_ALLOWED);
  }
});

bot.onText(/\/delete/, (msg, match) => {
  const {
    chat: {
      id: chatID
    },
    message_id
  } = msg;
  if (isUserAllowed(chatID)) {
    deleteFlightHandler(chatID, message_id);
  } else {
    sendMessage(chatID, LITERALS.NOT_ALLOWED);
  }
});

bot.on("callback_query", (callbackQuery) => {
  const {
    data,
    message: {
      chat: {
        id: messageChatId
      },
      message_id
    }
  } = callbackQuery;
  bot.deleteMessage(messageChatId, message_id);

  const params = new URLSearchParams(data);
  switch (params.get("action")) {
    case ACTIONS.DELETE:
      if (deleteFlight(messageChatId, params.get("index"))) {
        deleteFlightHandler(messageChatId);
      } else {
        bot.sendMessage(messageChatId, "ERROR AL BORRAR")
      }
      break;
    case ACTIONS.CANCEL:
      bot.sendMessage(messageChatId, "Operación cancelada").then(res => {
        setTimeout(() => {
          bot.deleteMessage(messageChatId, res.message_id);
        }, 3000);
      });
      break;
    default:
      bot.sendMessage(messageChatId, "Fallo");
      setTimeout(() => {
        bot.deleteMessage(messageChatId, res.message_id);
      }, 3000);
      break;
  }
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

const deleteFlightHandler = (chatID, messageId) => {
  const res = showFlights(chatID, messageId);
  if (typeof res === 'object') {
    bot.sendMessage(chatID, LITERALS.FLIGHT_TO_DELETE, res);
  } else {
    bot.sendMessage(chatID, res);
  }
}
