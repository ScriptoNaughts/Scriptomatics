module.exports = {
  eq: (value1, value2) => {
    return value1 === value2;
  },
  format_date: (date) => {
    return `${new Date(date).getMonth()}/${new Date(date).getDate()}/${
      new Date(date).getFullYear()
    }`;
  },
};
