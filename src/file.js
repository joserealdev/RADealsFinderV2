const fs = require("fs");

const getUsers = () => {
  const file = JSON.parse(fs.readFileSync("./userData/users.json", "utf8")) || {};
  const { users = [] } = file;
  return users;
};

const getFlightsByUser = id => {
  const file = JSON.parse(fs.readFileSync("./userData/flights.json", "utf8")) || {};
  const { [id]: userFlights = [] } = file
  return userFlights;
};

const readFile = id => {
  const setup = JSON.parse(fs.readFileSync("./userData/flights.json", "utf8"));
  if (id) {
    return setup[id] ? { [id]: setup[id] } : null;
  }
  return setup;
};

const writeDelete = (uid, data) => {
  try {
    const setup = JSON.parse(fs.readFileSync("./userData/flights.json", "utf8"));
    setup[uid] = data;
    fs.writeFileSync("./userData/flights.json", JSON.stringify(setup, null, 2));
  } catch (error) {
    return false;
  }
  return true;
};

const writeFlight = (uid, data) => {
  try {
    const setup = JSON.parse(fs.readFileSync("./userData/flights.json", "utf8"));
    if (setup[uid]) {
      setup[uid].push(data);
    } else {
      setup[uid] = [data];
    }
    fs.writeFileSync("./userData/flights.json", JSON.stringify(setup, null, 2));
  } catch (error) {
    return false;
  }
  return true;
};

const writeTest = data => {
  try {
    fs.writeFileSync("./test.json", JSON.stringify(data, null, 2));
  } catch (error) {
    return {
      e: "Fallo al insertar: " + error
    };
  }
};

module.exports = {
  getUsers,
  getFlightsByUser,
  readFile,
  writeDelete,
  writeFlight,
  writeTest
};
