const lodash = require('lodash');
const sequelize = require('./dataSource/MysqlPoolClass');
const config = require('./config/config');
const user = require('./models/user');

const userModal = user(sequelize);

const len = 10;

const arr = [{ name: 'zhang' }, { name: 'li' }, { name: 'zhang' }];
const newarr = lodash.groupBy(arr, 'name');
console.log(newarr);
