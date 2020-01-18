const { checkFlight } = require("./request.js");
const { readFile } = require("./file.js");

const checkNow = id => {
  const usersData = readFile(id);
  if (usersData) {
    Object.keys(usersData).forEach(key => {
      checkClientFlights(usersData[key], key).then(res => {
        console.log(res);
      });
    });
  }
};

const checkClientFlights = (flights, clientId) => {
  return new Promise((resolve, reject) => {
    const promises = [];
    flights.forEach(flight => {
      if (flight.searchForAWeekend) {
      } else {
        const params = {
          from: flight.from,
          destination: flight.destination,
          dateInterval: flight.dateInterval,
          duration: flight.duration
        };
        promises.push(checkFlight(params));
      }
    });

    Promise.all(promises).then(values => {
      resolve({ [clientId]: values });
    });
  });
};

checkNow();
