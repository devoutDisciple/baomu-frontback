const schedule = require('node-schedule');
const Sequelize = require('sequelize');
const moment = require('moment');
const sequelize = require('../dataSource/MysqlPoolClass');
const wechatUtil = require('../util/wechatUtil');
const order = require('../models/order');
const team = require('../models/team');
const pay = require('../models/pay');
const ObjectUtil = require('../util/ObjectUtil');

const orderModal = order(sequelize);
const payModal = pay(sequelize);
const teamModal = team(sequelize);
const Op = Sequelize.Op;

const timeFormat = 'YYYY-MM-DD HH:mm:ss';

// 查看所有拼团，每小时的1分执行
schedule.scheduleJob('* 1 * * * *', async () => {
	const hours73Ago = moment().subtract(73, 'hours').format('YYYY-MM-DD HH:mm:ss');
	// 获取最近73小时的组团信息
	const results = await teamModal.findAll({
		where: {
			state: 2,
			create_time: {
				[Op.gte]: hours73Ago,
			},
		},
	});
	if (!results || results.length === 0) return;
	results.map(async (item) => {
		// 如果超过72小时
		if (moment(new Date()).diff(moment(item.end_time), 'minute') > 72 * 60) {
			// 超过1小时的都退款
			// if (moment(new Date()).diff(moment(item.create_time), 'minute') > 1 * 60) {
			console.log(`拼团的id: ${item.id}, 开始时间：${item.create_time}, 结束时间：${item.end_time}`);
			// 将状态刚更新为拼团超时而失败
			await teamModal.update({ state: 4 }, { where: { id: item.id } });
			console.log(`更新拼团状态: 拼团id: ${item.id}, 更新状态为：拼团超时而失败`);
		}
	});
});

// 退款，每天的早上八点
// schedule.scheduleJob('* * 8 * * *', async () => {
schedule.scheduleJob('* * 8 * * *', async () => {
	const hours48Ago = moment().subtract(48, 'hours').format('YYYY-MM-DD HH:mm:ss');
	// 获取所有拼团失败的信息
	const results = await teamModal.findAll({
		where: {
			state: 4,
			create_time: {
				[Op.gte]: hours48Ago,
			},
		},
	});
	if (!results || results.length === 0) return;
	results.map(async (item) => {
		// 将状态刚更新为退款
		await teamModal.update({ state: 6 }, { where: { id: item.id } });
		const orderDetails = await orderModal.findAll({
			attributes: ['id', 'user_id', 'out_trade_no', 'transaction_id'],
			where: { team_uuid: item.uuid },
		});

		if (orderDetails && orderDetails.length !== 0) {
			orderDetails.map(async (orderDetail) => {
				console.log(`即将更新的order的id是：${orderDetail.id}`);
				const out_refund_no = ObjectUtil.getRandomStr();
				const payDetail = await payModal.findOne({
					where: { transaction_id: orderDetail.transaction_id, out_trade_no: orderDetail.out_trade_no },
				});
				const params = {
					transaction_id: payDetail.transaction_id,
					out_refund_no,
					refund: Number(payDetail.money),
					total: Number(payDetail.money),
				};
				wechatUtil.payRefunds(params);
				// transaction_id, out_refund_no, refund, total
				console.log(`发起退款: 退款的订单id: ${orderDetail.id}, 退款时间： ${moment().format(timeFormat)}`);
			});
		}
	});
});
