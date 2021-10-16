const fs = require("fs");

const allowUser = (uid) => {
  const usersFile = JSON.parse(
    fs.readFileSync("./userData/users.json", "utf8")
  );
  usersFile.users.forEach((user) => {
    if (user.id === uid) {
      user.allowed = true;
    }
  });
  try {
    fs.writeFileSync(
      "./userData/users.json",
      JSON.stringify(usersFile, null, 2)
    );
  } catch (e) {
    return false;
  }
  return true;
};

const createUserEntry = (userdata, lang) => {
  const usersFile = JSON.parse(
    fs.readFileSync("./userData/users.json", "utf8")
  );
  usersFile.users.push({
    id: userdata.id,
    nombre: userdata.first_name,
    username: userdata.username || "No tiene",
    isBot: userdata.is_bot,
    lang,
    allowed: false,
  });
  try {
    fs.writeFileSync(
      "./userData/users.json",
      JSON.stringify(usersFile, null, 2)
    );
    usersLang[userdata.id] = {
      id: userdata.id,
      lang: lang || "en",
    };
  } catch (e) {
    return false;
  }
  return true;
};

const getUsers = () => {
  const file =
    JSON.parse(fs.readFileSync("./userData/users.json", "utf8")) || {};
  const { users = [] } = file;
  return users;
};

const getUsersWithLang = () => {
  const file =
    JSON.parse(fs.readFileSync("./userData/users.json", "utf8")) || {};
  const { users = [] } = file;
  const mapped = {};
  users.forEach((user) => {
    mapped[user.id] = {
      id: user.id,
      lang: user.lang || "en",
    };
  });
  return mapped;
};

const getFlightsByUser = (id) => {
  const file =
    JSON.parse(fs.readFileSync("./userData/flights.json", "utf8")) || {};
  const { [id]: userFlights = [] } = file;
  return userFlights;
};

const readFile = (id) => {
  const setup = JSON.parse(fs.readFileSync("./userData/flights.json", "utf8"));
  if (id) {
    return setup[id] ? { [id]: setup[id] } : null;
  }
  return setup;
};

const writeDelete = (uid, data) => {
  try {
    const setup = JSON.parse(
      fs.readFileSync("./userData/flights.json", "utf8")
    );
    setup[uid] = data;
    fs.writeFileSync("./userData/flights.json", JSON.stringify(setup, null, 2));
  } catch (error) {
    return false;
  }
  return true;
};

const writeFlight = (uid, data) => {
  try {
    const setup = JSON.parse(
      fs.readFileSync("./userData/flights.json", "utf8")
    );
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

const writeTest = (data) => {
  try {
    fs.writeFileSync("./test.json", JSON.stringify(data, null, 2));
  } catch (error) {
    return {
      e: "Fallo al insertar: " + error,
    };
  }
};

module.exports = {
  allowUser,
  createUserEntry,
  getUsers,
  getFlightsByUser,
  getUsersWithLang,
  readFile,
  writeDelete,
  writeFlight,
  writeTest,
};
