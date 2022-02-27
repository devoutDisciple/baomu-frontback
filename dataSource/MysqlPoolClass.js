const Sequelize = require('sequelize');
const appConfi = require('../config/config');
const sqlConfig = require('../config/sqlConfig');

const sequelize = new Sequelize(sqlConfig.database, sqlConfig.username, sqlConfig.password, {
	host: sqlConfig.host,
	dialect: sqlConfig.dialect,
	pool: {
		max: 5,
		min: 0,
		idle: 10000,
		acquire: 30000,
	},

	timezone: '+08:00', // 东八时区

	// SQLite only
	storage: 'path/to/database.sqlite',
	logging: appConfi.env === 'dev', // 关闭日志功能
});

module.exports = sequelize;
