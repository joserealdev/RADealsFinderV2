const fs = require("fs");

const readFile = id => {
  const setup = JSON.parse(fs.readFileSync("./userData/flights.json", "utf8"));
  if (id) {
    return setup[id] ? { [id]: setup[id] } : null;
  }
  return setup;
};
const writeFile = () => {};

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
  readFile,
  writeFile,
  writeTest
};
