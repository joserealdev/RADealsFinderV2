const request = require("request");
const { API } = require("../data/static.json");

const checkFlight = ({ from, destination, dateInterval, duration }) => {
  return new Promise((resolve, reject) => {
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
      inboundDepartureDateFrom: "2020-01-01",
      inboundDepartureDateTo: "2022-03-30",
      language: "es",
      limit: "32",
      market: "es-es",
      offset: "0",
      outboundDepartureDateFrom: dateInterval[0],
      outboundDepartureDateTo: dateInterval[1],
      priceValueTo: "150"
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
        reject(error);
      } else if (response.statusCode == 200) {
        resolve(body);
      } else {
        reject(response.statusCode);
      }
    });
  });
};

module.exports = {
  checkFlight
};
