const { getArrivalAirports } = require('./src/request');

getArrivalAirports('OSL').then(res => {
    const parsed = JSON.parse(res);
    const airports = parsed.map(airport => airport.arrivalAirport.code);
    console.log(airports)
})