const getFollowingSaturdays = (date, numberOfDays) => {
  const first = date ? new Date(date) : new Date();
  let lastChecked = formatDate(first);
  const days = [];
  while (days.length < numberOfDays) {
    const check = new Date(lastChecked);
    check.setDate(check.getDate() + 1);
    lastChecked = formatDate(check);
    if (check.getDay() === 6) {
      days.push(lastChecked);
    }
  }
  return days;
};

const formatDate = (date) => {
  const d = new Date(date);
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  const year = d.getFullYear();

  if (month.length < 2) { month = `0${month}`; }
  if (day.length < 2) { day = `0${day}`; }

  return [year, month, day].join('-');
}

module.exports = {
  getFollowingSaturdays
};
