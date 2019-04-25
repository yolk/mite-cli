'use strict';

module.exports = {
  description: () => {
    return (
      `optional value in cents to set for new hourly rate`
    );
  },
  parse: (val) => {
    if (typeof val !== 'string') return val;
    if (!val.match(/^\d+(.?\d+)$/)) {
      throw new Error(`The given hourlyRate is not valid.`);
    }
    val = parseFloat(val, 10);
    if (isNaN(val)) {
      throw new Error(`The given hourlyRate is not valid.`);
    }
    return val * 1000;
  }
};
