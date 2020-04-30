const fs = require("fs");

const createUserEntry = (userdata) => {
  const configFile = JSON.parse(fs.readFileSync("./userData/users.json", "utf8"));
  configFile.users.push(
    {
      id: userdata.chat.id,
      nombre: userdata.from.first_name,
      username: userdata.from.username || "No tiene",
      isBot: userdata.from.is_bot,
      allowed: false
    }
  )
  try {
    fs.writeFileSync("./userData/users.json", JSON.stringify(configFile, null, 2));
  } catch (e) {
    return false;
  }
  return true;
};

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
  createUserEntry,
  getUsers,
  getFlightsByUser,
  readFile,
  writeDelete,
  writeFlight,
  writeTest
};
