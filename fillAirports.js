const { getArrivalAirports } = require("./src/request");

getArrivalAirports("XRY").then((res) => {
  const airports = res.map((airport) => airport.arrivalAirport.code);
  console.log(airports);
});
