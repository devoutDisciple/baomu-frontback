const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const wechatUtil = require('../util/wechatUtil');
const ObjectUtil = require('../util/ObjectUtil');
const pay = require('../models/pay');

const payModal = pay(sequelize);

module.exports = {
	// 测试
	test: async (req, res) => {
		try {
			const orderDetail = {
				id: 20,
				user_id: '36',
				out_trade_no: 'EGTH1A3HO4TM1643556358047',
				transaction_id: '4200001324202201305214321717',
				create_time: '2022-01-30 23:38:36',
			};
			const out_refund_no = ObjectUtil.getRandomStr();
			const teamDetail = await payModal.findOne({
				where: { transaction_id: orderDetail.transaction_id, out_trade_no: orderDetail.out_trade_no },
			});
			const params = {
				transaction_id: teamDetail.transaction_id,
				out_refund_no,
				refund: Number(teamDetail.money),
				total: Number(teamDetail.money),
			};
			console.log(JSON.stringify(params), 888);
			wechatUtil.payRefunds(params);
			// transaction_id, out_refund_no, refund, total
			res.send(resultMessage.success('成功了'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
