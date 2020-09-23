const request = require("request");
const { API } = require("../data/properties.json");

const checkFlight = ({ from, destination, dateInterval, duration }) => {
  return new Promise((resolve, reject) => {
    const year = new Date().getFullYear();
    let parameters = {};
    if (destination) {
      parameters = {
        arrivalAirportIataCode: destination
      };
    }
    parameters = {
      ...parameters,
      departureAirportIataCode: from,
      durationFrom: duration[0],
      durationTo: duration[1] ? duration[1] : duration[0],
      inboundDepartureDateFrom: `${year}-01-01`,
      inboundDepartureDateTo: `${year + 1}-12-31`,
      language: "es",
      limit: "32",
      market: "es-es",
      offset: "0",
      outboundDepartureDateFrom: dateInterval[0],
      outboundDepartureDateTo: dateInterval[1],
      priceValueTo: "200"
    };

    const options = {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-encoding": "*"
      },
      uri: API,
      qs: parameters,
      method: "GET"
    };

    request(options, (error, response, body) => {
      if (error) {
        reject(`Request error. ${error}`);
      } else if (response.statusCode == 200) {
        resolve(body);
      } else {
        reject(`Error, statusCode: ${response.statusCode}`);
      }
    });
  });
};

const getArrivalAirports = (airport) => {
  return new Promise((resolve, reject) => {
    const parameters = {
      departurePhrase: airport,
      market: "es-es"
    };

    const options = {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-encoding": "*",
        referer: "https://www.ryanair.com/es/es/search/flights"
      },
      uri: "https://www.ryanair.com/api/locate/v1/autocomplete/routes",
      qs: parameters,
      method: "GET"
    };

    request(options, (error, response, body) => {
      if (error) {
        reject(`Get arrival error. ${error}`);
      } else if (response.statusCode == 200) {
        resolve(body);
      } else {
        reject(`Get arrival error, statusCode: ${response.statusCode}`);
      }
    });
  });
}

module.exports = {
  checkFlight,
  getArrivalAirports
};
