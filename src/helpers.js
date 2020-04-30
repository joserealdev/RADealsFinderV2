const { getUsers } = require("./file");
const { LINK } = require("../data/properties.json");

const getFollowingSaturdays = (date, numberOfDays) => {
  const first = date ? new Date(date) : new Date();
  let lastChecked = formatDate(first);
  const days = [];
  while (days.length < numberOfDays) {
    const check = new Date(lastChecked);
    check.setDate(check.getDate() + 1);
    lastChecked = formatDate(check);
    if (check.getDay() === 6) {
      days.push(lastChecked);
    }
  }
  return days;
};

const formatDate = date => {
  const d = new Date(date);
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  const year = d.getFullYear();

  if (month.length < 2) {
    month = `0${month}`;
  }
  if (day.length < 2) {
    day = `0${day}`;
  }

  return [year, month, day].join("-");
};

const formatDateWithSlash = text => {
  return text.replace(/^(\d{4})-(\d{2})-(\d{2})$/g, "$3/$2/$1");
};

const formatFlights = (flights = []) => {
  const formated = flights.map(flight => {
    const mensaje =
      `\u{1F6EB} *${flight.salida}* ${formatDateWithSlash(
        flight.fechas[0]
      )} \u{23F0} ${flight.horaSalida}\n` +
      `\u{1F6EC} *${flight.destino}* ${formatDateWithSlash(
        flight.fechas[1]
      )} \u{23F0} ${flight.horaDestino}\n` +
      `\u{1F4B0} ${flight.precio}€\n` +
      `[Enlace](${LINK}/${flight.salidaCode}/${flight.destinoCode}/${formatDate(
        flight.fechas[0]
      )}/${formatDate(flight.fechas[1])}/1/0/0/0)`;
    return mensaje;
  });
  return formated.join("\n\n");
};

const isUserAllowed = id => {
  const user = getUsers().find(user => user.id == id) || {};
  return user.allowed;
};

const isUserRegistered = (id) => {
  const user = getUsers().find(user => user.id == id);
  return user;
};

module.exports = {
  formatFlights,
  getFollowingSaturdays,
  isUserAllowed,
  isUserRegistered
};
