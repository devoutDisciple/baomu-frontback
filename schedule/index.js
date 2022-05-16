const schedule = require('node-schedule');
const Sequelize = require('sequelize');
const moment = require('moment');
const sequelize = require('../dataSource/MysqlPoolClass');
const wechatUtil = require('../util/wechatUtil');
const demand = require('../models/demand');
const team = require('../models/team');
const pay = require('../models/pay');
const ObjectUtil = require('../util/ObjectUtil');

const demandModal = demand(sequelize);
const payModal = pay(sequelize);
const teamModal = team(sequelize);
const Op = Sequelize.Op;

const timeFormat = 'YYYY-MM-DD HH:mm:ss';

// 查看所有拼团，每小时的1分执行
schedule.scheduleJob('* 1 * * * *', async () => {
	const hours73Ago = moment().subtract(73, 'hours').format('YYYY-MM-DD HH:mm:ss');
	// 获取最近73小时的组团信息
});

// 退款，每天的早上八点
// schedule.scheduleJob('* * 8 * * *', async () => {
schedule.scheduleJob('* * 8 * * *', async () => {
	const hours48Ago = moment().subtract(48, 'hours').format('YYYY-MM-DD HH:mm:ss');
	// 获取所有拼团失败的信息
});
