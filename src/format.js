const { LINK } = require("../data/properties.json");

const formatFlights = (flights = []) => {
  const formated = flights.map(flight => {
    const salida = formatDate(flight.fechas[0]);
    const regreso = formatDate(flight.fechas[1]);
    const mensaje =
      "\u{1F6EB} *" +
      flight.salida +
      "* " +
      salida +
      "\n" +
      "\u{1F6EC} *" +
      flight.destino +
      "* " +
      regreso +
      "\n" +
      "\u{1F4B0} " +
      flight.precio +
      "€\n" +
      `[Enlace](${LINK}/DEP/ARR/${salida}/${regreso}/1/0/0/0)`;
    return mensaje;
  });
  return formated.join("\n\n");
};

const formatDate = text => {
  return text.replace(/^(\d{4})-(\d{2})-(\d{2})$/g, "$3/$2/$1");
};

module.exports = {
  formatFlights
};
