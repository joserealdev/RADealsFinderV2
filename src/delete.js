const { ACTIONS, LITERALS } = require("../data/properties.json");
const { getLang } = require("./helpers.js");
const { getFlightsByUser, writeDelete } = require("./file");

const showFlights = (id, message) => {
  const flights = getFlightsByUser(id);
  if (flights.length === 0) return LITERALS.NO_FLIGHTS[getLang(id)];

  const mapped = flights.map((flight, i) => {
    return [{
      text: `${flight.from} - ${flight.destination || LITERALS.ANYWHERE[getLang(id)]}`,
      callback_data: `action=${ACTIONS.DELETE}&index=${i}`
    }];
  });

  const cancelButton = (
    {
      text: LITERALS.CANCEL[getLang(id)],
      callback_data: `action=${ACTIONS.CANCEL}`
    }
  );

  const opts = {
    reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: true,
        inline_keyboard: [...mapped, [cancelButton]]
    }
  };

  return message
    ? {
        ...opts,
        reply_to_message_id: message
      }
    : opts;
}

const deleteFlight = (uid, fid) => {
  const flights = getFlightsByUser(uid);
  flights.splice(fid, 1);
  return writeDelete(uid, flights);
}

module.exports = {
  showFlights,
  deleteFlight
}