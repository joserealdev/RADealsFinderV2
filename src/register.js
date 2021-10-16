const { ACTIONS, LITERALS } = require("../data/properties.json");

const selectLanguage = () => {
  const row = [
    {
      text: "\u{1F1EA}\u{1F1F8}",
      callback_data: `action=${ACTIONS.LANGUAGE}&lang=es`,
    },
    {
      text: "\u{1F1EC}\u{1F1E7}",
      callback_data: `action=${ACTIONS.LANGUAGE}&lang=en`,
    },
  ];

  const opts = {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      inline_keyboard: [row],
    },
  };

  return { msg: LITERALS.CHOOSE_LANGUAGE, opts };
};

const chooseAllowUser = (udata) => {
  const row = [
    {
      text: "Sí",
      callback_data: `action=${ACTIONS.ALLOW_USER}&allow=yes&uid=${udata.id}`,
    },
    {
      text: "No",
      callback_data: `action=${ACTIONS.ALLOW_USER}&allow=no&uid=${udata.id}`,
    },
  ];

  const opts = {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      inline_keyboard: [row],
    },
  };

  const text = `El usuario ${udata.first_name} (@${udata.username}) se ha registrado. Permitir uso?`;

  return { msg: text, opts };
};

module.exports = {
  chooseAllowUser,
  selectLanguage,
};
