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

const formatFlights = (flights = []) => {
  const formated = flights.map(flight => {
    const salida = formatDate(flight.fechas[0]);
    const regreso = formatDate(flight.fechas[1]);
    const mensaje =
      `\u{1F6EB} *${flight.salida}* ${salida} -> ${flight.horaSalida}\n` +
      `\u{1F6EC} *${flight.destino}* ${regreso} -> ${flight.horaDestino}\n` +
      `\u{1F4B0} ${flight.precio}€\n` +
      `[Enlace](${LINK}/${flight.salidaCode}/${flight.destinoCode}/${salida}/${regreso}/1/0/0/0)`;
    return mensaje;
  });
  return formated.join("\n\n");
};

module.exports = {
  formatFlights,
  getFollowingSaturdays
};
