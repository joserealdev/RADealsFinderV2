const { telegramtoken, myid } = require("./config.json");
const cron = require("node-cron");
const TelegramBot = require("node-telegram-bot-api");
const { ACTIONS, LITERALS, HELP } = require("./data/properties.json");
const { checkNow } = require("./src/check");
const { deleteFlight, showFlights } = require("./src/delete");
const { addRoute } = require("./src/create");
const { isUserAllowed, getUser } = require("./src/helpers");
const { allowUser, createUserEntry } = require("./src/file");
const { chooseAllowUser, selectLanguage } = require("./src/register");

const bot = new TelegramBot(telegramtoken, { polling: true });

bot.onText(/\/start/, (msg, match) => {
  const chatID = msg.chat.id;
  if (!getUser(chatID)) {
    const res = selectLanguage();
    bot.sendMessage(chatID, res.msg, res.opts);
  }
});

bot.onText(/\/help/, (msg, match) => {
  const chatID = msg.chat.id;
  const lang = getUser(chatID).lang || "en";
  bot.sendMessage(chatID, HELP[lang].join(''));
});

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

bot.onText(/\/addroute/, (msg, match) => {
  const { chat: { id: chatID } } = msg;

  if (isUserAllowed(chatID)) {
    addRouteHandler(chatID, 'next=departure');
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
  deleteFlightHandler(chatID, message_id);
});

bot.on("callback_query", (callbackQuery) => {
  const {
    data,
    from: {
      id: messageChatId
    },
    message: {
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
    case ACTIONS.CREATE:
      addRouteHandler(messageChatId, params);
      break;
    case ACTIONS.CANCEL:
      bot.sendMessage(messageChatId, LITERALS.OPERATION_CANCELLED).then(res => {
        setTimeout(() => {
          bot.deleteMessage(messageChatId, res.message_id);
        }, 3000);
      });
      break;
    case ACTIONS.LANGUAGE:
      if (!getUser(messageChatId) && createUserEntry(callbackQuery.from, params.get("lang"))) {
        bot.sendMessage(messageChatId, "Se ha creado tu cuenta correctamente");
        if (!callbackQuery.from.is_bot) {
          const res = chooseAllowUser(callbackQuery.from);
          bot.sendMessage(myid, res.msg, res.opts);
        }
      } else {
        bot.sendMessage(messageChatId, "Hubo un fallo al crear su cuenta");
      }
      break;
    case ACTIONS.ALLOW_USER:
      if (params.get("allow") === "yes" && allowUser(parseInt(params.get("uid")))) {
        bot.sendMessage(parseInt(params.get("uid")), "Se ha autorizado tu acceso al bot");
      }
      break;
    default:
      bot.sendMessage(messageChatId, "Fallo").then(res => {
        setTimeout(() => {
          bot.deleteMessage(messageChatId, res.message_id);
        }, 3000);
      });
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
};

const addRouteHandler = (chatID, params) => {
  const res = addRoute(chatID, params);
  if (typeof res === 'object') {
    bot.sendMessage(chatID, res.msg, res.opts);
  } else {
    bot.sendMessage(chatID, res);
  }
};
