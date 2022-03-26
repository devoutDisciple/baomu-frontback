const moment = require('moment');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const demand = require('../models/demand');
const user = require('../models/user');
const priceRecord = require('../models/price_record');

const priceRecordModal = priceRecord(sequelize);
const userModal = user(sequelize);
const demandModal = demand(sequelize);

demandModal.belongsTo(userModal, { foreignKey: 'user_id', targetKey: 'id', as: 'userDetail' });

module.exports = {
	// 添加报价
	addPrice: async (req, res) => {
		try {
			const { user_id, price, demand_id, type, state, operation } = req.body;
			console.log(user_id, price, demand_id);
			if (!(Number(price) > 0)) return res.send(resultMessage.success('报价输入有误'));
			const demandDetail = await demandModal.findOne({ where: { id: demand_id } });
			// 1-开始状态 2-竞价进行中 3-需求进行中（必须已支付） 4-交易成功 5-交易失败 6-交易取消
			if (!demandDetail || demandDetail.state !== 2) return res.send(resultMessage.success('系统错误'));
			const join_ids = demandDetail.join_ids;
			let joinArr = [];
			if (join_ids) {
				joinArr = join_ids.split(',');
			}
			if (!joinArr.includes(user_id)) {
				joinArr.push(user_id);
			}
			// 更新需求的报价人员id
			await demandModal.update({ join_ids: joinArr.join(',') }, { where: { id: demand_id } });
			// 创建报价记录
			await priceRecordModal.create({
				user_id,
				demand_id,
				price,
				type,
				state,
				operation,
				create_time: moment().format('YYYY-MM-DD HH:mm:ss'),
			});
			// 更新需求的竞价人员
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
