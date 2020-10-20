const { telegramtoken, myid } = require("./config.json");
const cron = require("node-cron");
const TelegramBot = require("node-telegram-bot-api");
const { ACTIONS, LITERALS, HELP } = require("./data/properties.json");
const { checkNow } = require("./src/check");
const { deleteFlight, showFlights } = require("./src/delete");
const { addRoute } = require("./src/create");
const { isUserAllowed, getUser, getLang } = require("./src/helpers");
const { allowUser, createUserEntry, getUsersWithLang, getUsers } = require("./src/file");
const { chooseAllowUser, selectLanguage } = require("./src/register");
global.usersLang = getUsersWithLang();

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
  bot.sendMessage(chatID, HELP[getLang(chatID)].join(''));
});

bot.onText(/\/checknow/, (msg, match) => {
  const chatID = msg.chat.id;
  if (isUserAllowed(chatID)) {
    checkNow(chatID)
      .then(res => {
        res.forEach(clientData => {
          sendMessage(clientData.uid, clientData.message || LITERALS.NO_FLIGHTS[getLang(chatID)]);
        });
      })
      .catch(e => {
        sendMessage(chatID, e || LITERALS.NO_FLIGHTS[getLang(chatID)]);
      });
  } else {
    sendMessage(chatID, LITERALS.NOT_ALLOWED[getLang(chatID)]);
  }
});

bot.onText(/\/addroute/, (msg, match) => {
  const { chat: { id: chatID } } = msg;

  if (isUserAllowed(chatID)) {
    addRouteHandler(chatID, 'next=departure');
  } else {
    sendMessage(chatID, LITERALS.NOT_ALLOWED[getLang(chatID)]);
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

bot.onText(/\/godtext (.*)/, (msg, match) => {
  const chatID = msg.chat.id;
  if (chatID === myid) {
    const users = getUsers();
    users.forEach((user) => {
      sendMessage(user.id, match[1]);
    });
  }
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
        bot.sendMessage(messageChatId, LITERALS.DELETE_ERROR[getLang(messageChatId)])
      }
      break;

    case ACTIONS.CREATE:
      addRouteHandler(messageChatId, params);
      break;

    case ACTIONS.CANCEL:
      bot.sendMessage(messageChatId, LITERALS.OPERATION_CANCELLED[getLang(messageChatId)]).then(res => {
        setTimeout(() => {
          bot.deleteMessage(messageChatId, res.message_id);
        }, 3000);
      });
      break;

    case ACTIONS.LANGUAGE:
      if (!getUser(messageChatId) && createUserEntry(callbackQuery.from, params.get("lang"))) {
        bot.sendMessage(messageChatId, LITERALS.ACCOUNT_CREATED[getLang(messageChatId)]);
        if (!callbackQuery.from.is_bot) {
          const res = chooseAllowUser(callbackQuery.from);
          bot.sendMessage(myid, res.msg, res.opts);
        }
      } else {
        bot.sendMessage(messageChatId, LITERALS.ACCOUNT_FAIL[getLang(messageChatId)]);
      }
      break;

    case ACTIONS.ALLOW_USER:
      if (params.get("allow") === "yes" && allowUser(parseInt(params.get("uid")))) {
        bot.sendMessage(parseInt(params.get("uid")), LITERALS.ACCOUNT_GRANTED[getLang(parseInt(params.get("uid")))]);
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
      sendMessage(clientData.uid, clientData.message || LITERALS.NO_FLIGHTS[getLang(clientData.uid)]);
    });
  }).catch((e) => {
    sendMessage(myid, `Error CRON. ${e}`);
  });
});

const sendMessage = (uid, text) => {
  bot.sendMessage(uid, text, {
    parse_mode: "Markdown",
    disable_web_page_preview: true
  }).catch((e) => {
    bot.sendMessage(myid, `ERROR: ${e}`);
  });
};

const deleteFlightHandler = (chatID, messageId) => {
  const res = showFlights(chatID, messageId);
  if (typeof res === 'object') {
    bot.sendMessage(chatID, LITERALS.FLIGHT_TO_DELETE[getLang(chatID)], res);
  } else {
    sendMessage(chatID, res);
  }
};

const addRouteHandler = (chatID, params) => {
  const res = addRoute(chatID, params);
  if (typeof res === 'object') {
    bot.sendMessage(chatID, res.msg, res.opts);
  } else {
    sendMessage(chatID, res);
  }
};
