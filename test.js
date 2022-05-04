const moment = require('moment');

const days = moment('2022-01-02').diff(moment('2022-01-04'), 'days');

console.log(days, 1111);
