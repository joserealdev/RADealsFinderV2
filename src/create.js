const { myid } = require('../config.json');
const { writeFlight } = require("./file");
const { getLang } = require("./helpers.js");
const { ACTIONS, LITERALS } = require("../data/properties.json");
const airportCodes = require("../data/codes.json");
const { departureAirports, destinationAirports } = require("../data/airports.json");

const udata = {};

const insertUdata = (uid, data) => {
  const params = new URLSearchParams(data);
  const nextAction = params.get("next");
  params.delete("next");
  params.delete("action");
  const [key, value] = params.toString().split("=");
  if (key && value) {
    udata[uid][key] = value;
  };
  return nextAction;
};

const addRoute = (uid, data) => {
  const nextAction = insertUdata(uid, data);
  const cases = {
    departure: (param) => showDepartureAirports(param),
    destination: (param) => showDestinationAirports(param),
    year1: (param) => chooseYear1(param),
    month1: (param) => chooseMonth1(param),
    day1: (param) => chooseDay1(param),
    year2: (param) => chooseYear2(param),
    month2: (param) => chooseMonth2(param),
    day2: (param) => chooseDay2(param),
    duration: (param) => chooseDuration(param),
    budget: (param) => chooseBudget(param),
    insert: (param) => insertData(param)
  };
	return cases[nextAction](uid) || "ERROR";
};

const showDepartureAirports = (uid) => {
  udata[uid] = {};

  const buttons = [];
	let row = [];
	departureAirports.forEach((airport, i) => {
		if (i > 0 && i%3 == 0) {
			buttons.push(row)
			row = []
		}
		row.push({
			text: airport.nombre,
			callback_data: `action=${ACTIONS.CREATE}&departure=${airport.code}&next=destination`
		})
	})
	if (row.length > 0) buttons.push(row);
  buttons.push([getCancelButton(uid)]);

	return { msg: LITERALS.DEPARTURE_AIRPORT[getLang(uid)], opts: getOptsKeyboard(buttons) };
};

const showDestinationAirports = (uid) => {
	const selectedAirport = destinationAirports.find(airport => airport.code == udata[uid].departure);

	const buttons = [];
	let row = [];
	selectedAirport.rutas.forEach((ruta, i) => {
		if (i > 0 && i%3 == 0) {
			buttons.push(row)
			row = []
		}
		row.push({
			text: airportCodes[ruta],
			callback_data: `action=${ACTIONS.CREATE}&destination=${ruta}&next=year1`
		})
	})
	if (row.length > 0) buttons.push(row)
	buttons.push([{text: LITERALS.ANYWHERE[getLang(uid)], callback_data: `action=${ACTIONS.CREATE}&destination=all&next=year1`}])
  buttons.push([getCancelButton(uid)]);

	return { msg: LITERALS.DESTINATION_AIRPORT[getLang(uid)], opts: getOptsKeyboard(buttons) };
};

const chooseYear1 = (uid) => {
  const thisYear = new Date().getFullYear();
  const buttons = [[thisYear, thisYear + 1].map(year => {
    return (
      {
        text: year,
        callback_data: `action=${ACTIONS.CREATE}&year1=${year}&next=month1`
      }
    );
  })];
  if (uid === myid) buttons.push([{text: "Escapada Sab-Dom", callback_data: `action=${ACTIONS.CREATE}&year1=esc&next=budget`}]);
  buttons.push([getCancelButton(uid)]);

	return { msg: LITERALS.CHOOSE_YEAR[getLang(uid)], opts: getOptsKeyboard(buttons) };
};

const chooseMonth1 = (uid) => {
  const months = getLang(uid) === 'es'
    ? ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const actualMonth = new Date().getMonth();
  const split = parseInt(udata[uid].year1) == new Date().getFullYear() ? actualMonth : 0

  const buttons = [];
	let row = [];
  months.slice(split, months.length).map((month, i) => {
    if(i>0 && i%3 == 0){
      buttons.push(row)
      row = []
    }
    row.push({
      text: month,
      callback_data: `action=${ACTIONS.CREATE}&month1=${('0' + (months.indexOf(month) + 1)).slice(-2)}&next=day1`
    })
  })
  if (row.length > 0) buttons.push(row);
  buttons.push([getCancelButton(uid)]);

	return { msg: LITERALS.CHOOSE_MONTH[getLang(uid)], opts: getOptsKeyboard(buttons) };
};

const chooseDay1 = (uid) => {
  const thisMonthTotalDays = new Date(parseInt(udata[uid].year1), parseInt(udata[uid].month1), 0).getDate();
  let i = new Date().getMonth() == parseInt(udata[uid].month1) - 1 ? new Date().getDate() : 1;

  const buttons = [];
	let row = [];
  while (i <= thisMonthTotalDays) {
    if (i > 0 && i%3 == 0){
      buttons.push(row)
      row = []
    }
    row.push({
      text: i,
      callback_data: `action=${ACTIONS.CREATE}&day1=${('0' + i).slice(-2)}&next=year2`
    })
    i++;
  }
  if (row.length > 0) buttons.push(row)
  buttons.push([getCancelButton(uid)]);

	return { msg: LITERALS.CHOOSE_DAY[getLang(uid)], opts: getOptsKeyboard(buttons) };
};

const chooseYear2 = (uid) => {
  const thisYear = new Date(udata[uid].year1).getFullYear();
  const buttons = [[thisYear, thisYear + 1].map(year => {
    return (
      {
        text: year,
        callback_data: `action=${ACTIONS.CREATE}&year2=${year}&next=month2`
      }
    );
  })];
  buttons.push([getCancelButton(uid)]);

	return { msg: LITERALS.CHOOSE_YEAR[getLang(uid)], opts: getOptsKeyboard(buttons) };
};

const chooseMonth2 = (uid) => {
  const months = getLang(uid) === 'es'
    ? ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const split = parseInt(udata[uid].year1) == parseInt(udata[uid].year2) ? parseInt(udata[uid].month1) - 1 : 0

  const buttons = [];
	let row = [];
  months.slice(split, months.length).map((month, i) => {
    if(i>0 && i%3 == 0){
      buttons.push(row)
      row = []
    }
    row.push({
      text: month,
      callback_data: `action=${ACTIONS.CREATE}&month2=${('0' + (months.indexOf(month) + 1)).slice(-2)}&next=day2`
    })
  })
  if (row.length > 0) buttons.push(row);
  buttons.push([getCancelButton(uid)]);

	return { msg: LITERALS.CHOOSE_MONTH[getLang(uid)], opts: getOptsKeyboard(buttons) };
};

const chooseDay2 = (uid) => {
  const thisMonthTotalDays = new Date(parseInt(udata[uid].year2), parseInt(udata[uid].month2), 0).getDate()
  let i = parseInt(udata[uid].year1) == parseInt(udata[uid].year2)
    && parseInt(udata[uid].month1) == parseInt(udata[uid].month2) ? parseInt(udata[uid].day1) : 1

  const buttons = [];
	let row = [];
  while (i <= thisMonthTotalDays) {
    if (i > 0 && i%3 == 0){
      buttons.push(row)
      row = []
    }
    row.push({
      text: i,
      callback_data: `action=${ACTIONS.CREATE}&day2=${('0' + i).slice(-2)}&next=duration`
    })
    i++;
  }
  if (row.length > 0) buttons.push(row)
  buttons.push([getCancelButton(uid)]);

	return { msg: LITERALS.CHOOSE_DAY[getLang(uid)], opts: getOptsKeyboard(buttons) };
};

const chooseDuration = (uid) => {
  const fRow = [3, 4, 5, 6, 7].map(day => {
    return (
      {
        text: day,
        callback_data: `action=${ACTIONS.CREATE}&duration=${day}&next=budget`
      }
    )
  });
  const sRow = [
    {
      text: "3 a 5",
      callback_data: `action=${ACTIONS.CREATE}&duration=3-5&next=budget`
    },
    {
      text: "4 a 7",
      callback_data: `action=${ACTIONS.CREATE}&duration=4-7&next=budget`
    }
  ];
  const buttons = [fRow, sRow, [getCancelButton(uid)]];

	return { msg: LITERALS.CHOOSE_DURATION[getLang(uid)], opts: getOptsKeyboard(buttons) };
};

const chooseBudget = (uid) => {
  const fRow = [50, 75, 100, 150, 200].map(money => {
    return (
      {
        text: money,
        callback_data: `action=${ACTIONS.CREATE}&budget=${money}&next=insert`
      }
    )
  });
  const buttons = [fRow, [getCancelButton(uid)]];
  return { msg: LITERALS.CHOOSE_BUDGET[getLang(uid)], opts: getOptsKeyboard(buttons) };
};

const insertData = (uid) => {
  const udatos = udata[uid];
  let flight = {
    from: udatos.departure,
    budget: parseInt(udatos.budget)
  };

  const destination = udatos.destination && udatos.destination !== "all"
    ? udatos.destination
    : null;
  if (destination) {
    flight = {
      ...flight,
      destination
    }
  };

  const searchForAWeekend = udatos.year1 === "esc";
  if (searchForAWeekend) {
    flight = {
      ...flight,
      searchForAWeekend
    };
  } else {
    const dateInterval = [
      `${udatos.year1}-${udatos.month1}-${udatos.day1}`,
      `${udatos.year2}-${udatos.month2}-${udatos.day2}`
    ];
    const duration = udatos.duration.split("-").map(num => parseInt(num));
    flight = {
      ...flight,
      dateInterval,
      duration
    };
  };
  
  return writeFlight(uid, flight)
    ? LITERALS.FLIGHT_INSERTED[getLang(uid)]
    : LITERALS.FLIGHT_INSERTED_ERROR[getLang(uid)];
}

const getCancelButton = (id) => {
  return {
    text: LITERALS.CANCEL[getLang(id)],
    callback_data: `action=${ACTIONS.CANCEL}`
  };
};

const getOptsKeyboard = (buttons) => {
  return {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      inline_keyboard: buttons
    }
  };
};

module.exports = {
	addRoute
};