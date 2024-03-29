const get = require("lodash.get");
const { checkFlight } = require("./request.js");
const { readFile, writeTest } = require("./file.js");
const {
  formatFlights,
  getFollowingSaturdays,
  getLang,
  isUserAllowed,
} = require("./helpers.js");
const { concatSelf, filterFares } = require("./filter.js");
const { NUMBER_OF_WEEKENDS, LITERALS } = require("../data/properties.json");
const weekendFares = {};

const checkNow = (id) => {
  return new Promise((resolve, reject) => {
    const usersData = readFile(id);
    if (usersData) {
      Object.keys(usersData).forEach((key) => {
        if (isUserAllowed(key)) {
          checkClientFlights(usersData[key], key)
            .then((res) => {
              const messages = Object.keys(res).map((uid) => {
                const message = formatFlights(res[uid], uid);
                return { uid, message };
              });
              resolve(messages);
            })
            .catch((e) => {
              reject(e);
            });
        } else {
          reject(LITERALS.NOT_ALLOWED[getLang(id)]);
        }
      });
    }
  });
};

const checkClientFlights = (flights, clientId) => {
  return new Promise((resolve, reject) => {
    const promises = [];
    flights.forEach((flight) => {
      if (flight.searchForAWeekend) {
        promises.push(searchWeekend(flight));
      } else {
        promises.push(searchNormal(flight));
      }
    });

    Promise.all(promises)
      .then((values) => {
        const concated = concatSelf(values);
        resolve({ [clientId]: concated });
      })
      .catch((e) => {
        reject(e);
      });
  });
};

const searchNormal = (flight) => {
  return new Promise((resolve, reject) => {
    const promises = [];
    let params = {};
    if (flight.destination) {
      params = {
        destination: flight.destination,
      };
    }
    params = {
      ...params,
      from: flight.from,
      dateInterval: flight.dateInterval,
      duration: flight.duration,
    };
    promises.push(checkFlight(params));
    Promise.all(promises)
      .then((values) => {
        const filteredFares = filterFares(
          values,
          flight.budget,
          flight.notDestinations
        );
        resolve(filteredFares);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

const searchWeekend = (flight) => {
  const now = new Date();
  if (
    weekendFares[flight.from] &&
    weekendFares[flight.from].lastCheck > now.setHours(now.getHours() - 3)
  ) {
    return new Promise((resolve, reject) => {
      const filteredFares = filterFares(
        weekendFares[flight.from].data,
        flight.budget,
        flight.notDestinations
      );
      resolve(filteredFares);
    });
  } else {
    return new Promise((resolve, reject) => {
      const promises = [];
      const date = get(flight, "dateInterval[0]");
      const dates = getFollowingSaturdays(date, NUMBER_OF_WEEKENDS);
      dates.forEach((date) => {
        let params = {};
        if (flight.destination) {
          params = {
            destination: flight.destination,
          };
        }
        params = {
          ...params,
          from: flight.from,
          dateInterval: [date, date],
          duration: [01],
        };
        promises.push(checkFlight(params));
      });
      Promise.all(promises)
        .then((values) => {
          weekendFares[flight.from] = {
            data: values,
            lastCheck: now.getTime(),
          };
          const filteredFares = filterFares(
            values,
            flight.budget,
            flight.notDestinations
          );
          resolve(filteredFares);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
};

module.exports = {
  checkNow,
};
