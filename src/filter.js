const get = require("lodash.get");

const filterFares = (userdata, budget, countries) => {
  const data = userdata.map(element => {
    const faresel = get(JSON.parse(element), "fares", []);
    const filter = faresel.map(fare => {
      const dpAirport = get(fare, "outbound.departureAirport.name", "");
      const dpAirportCode = get(fare, "outbound.departureAirport.iataCode", "");
      const arrAirport = get(fare, "inbound.departureAirport.name", "");
      const arrAirportCode = get(fare, "inbound.departureAirport.iataCode", "");
      const dates = [
        get(fare, "outbound.departureDate", "").split("T")[0],
        get(fare, "inbound.departureDate", "").split("T")[0]
      ];
      const price = get(fare, "summary.price.value", "");
      const country = get(fare, "outbound.arrivalAirport.countryName", "");
      return {
        dpAirport,
        dpAirportCode,
        arrAirport,
        arrAirportCode,
        dates,
        price,
        country
      };
    });
    return filter;
  });
  const concated = concatSelf(data);
  const filteredCountry = countries
    ? filterByCountry(concated, countries)
    : concated;
  const filteredPrice = filterByPrice(filteredCountry, budget);
  return getUnicLowest(filteredPrice);
};

const getUnicLowest = data => {
  const unique = [...new Set(data.map(item => item.arrAirport))];
  const hj = unique.map(val => {
    const { departure, precio, fechas } = lowestFare(val, data);
    return { salida: departure, destino: val, precio, fechas };
  });
  return hj.sort((a, b) =>
    a.precio > b.precio ? 1 : b.precio > a.precio ? -1 : 0
  );
};

const lowestFare = (llave, data) => {
  let min = 200.22;
  let dates = [];
  let departure = "";
  data.forEach(el => {
    if (el.arrAirport == llave && el.price < min) {
      min = el.price;
      dates = el.dates;
      departure = el.dpAirport;
    }
  });
  return { departure: departure, precio: min, fechas: dates };
};

const filterByCountry = (data, filterList) => {
  const filteredCountries = [];
  data.forEach(flight => {
    if (filterList.indexOf(flight.country.toLowerCase()) === -1) {
      filteredCountries.push(flight);
    }
  });
  return filteredCountries;
};

const filterByPrice = (data, budget) => {
  const filteredByPrice = [];
  data.forEach(flight => {
    if (flight.price < budget) {
      filteredByPrice.push(flight);
    }
  });
  return filteredByPrice;
};

const concatSelf = arr => {
  return [].concat.apply([], arr);
};

module.exports = {
  concatSelf,
  filterFares
};
