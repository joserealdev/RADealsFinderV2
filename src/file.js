const fs = require("fs");

const readFile = id => {
  const setup = JSON.parse(fs.readFileSync("./userData/flights.json", "utf8"));
  if (id) {
    return setup[id] ? { [id]: setup[id] } : null;
  }
  return setup;
};
const writeFile = () => {};

module.exports = {
  readFile,
  writeFile
};
