const getKSTDate = () => {
  const date = new Date();
  date.setTime(date.getTime() + 9 * 3600000);
  return date;
};

module.exports = { getKSTDate };
