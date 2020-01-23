const { checkFlight } = require("./request.js");
const { readFile } = require("./file.js");
const { getFollowingSaturdays } = require("./helpers.js");
const { filterFares } = require("./filter.js");
const { NUMBER_OF_WEEKENDS } = require("../data/properties.json");

const checkNow = id => {
  const usersData = readFile(id);
  if (usersData) {
    Object.keys(usersData).forEach(key => {
      checkClientFlights(usersData[key], key).then(res => {
        console.log(res["111111"])
      });
    });
  }
};

const checkClientFlights = (flights, clientId) => {
  return new Promise((resolve, reject) => {
    const promises = [];
    flights.forEach(flight => {
      if (flight.searchForAWeekend) {
        promises.push(searchForAWeekend(flight));
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

const searchForAWeekend = flight => {
  return new Promise((resolve, reject) => {
    const promises = []
    const dates = getFollowingSaturdays(flight.dateInterval[0], NUMBER_OF_WEEKENDS);
    dates.forEach(date => {
      let params = {}
      if (flight.destination) {
        params = {
          destination: flight.destination
        };
      }
      params = {
        ...params,
        from: flight.from,
        dateInterval: [date, date],
        duration: 1
      };
      promises.push(checkFlight(params))
    });
    Promise.all(promises).then(values => {
      const filteredFares = filterFares(values, flight.budget, flight.notDestinations);
      resolve( filteredFares );
    });
  })
};

checkNow("111111")
