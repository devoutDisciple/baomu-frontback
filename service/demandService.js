const moment = require('moment');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const demand = require('../models/demand');
const user = require('../models/user');
const responseUtil = require('../util/responseUtil');

const userModal = user(sequelize);
const demandModal = demand(sequelize);

module.exports = {
	// 创建需求
	addDemand: async (req, res) => {
		try {
			const { body } = req;
			body.end_time = moment(body.end_time).format('YYYY-MM-DD 23:59:59');
			body.create_time = moment().format('YYYY-MM-DD HH:mm:ss');
			if (!body.user_id) return res.send(resultMessage.error('系统错误'));
			if (typeof body.price !== 'number' || !(Number(body.price) > 0)) {
				return res.send(resultMessage.error('金额错误'));
			}
			await demandModal.create(body);
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 根据地理位置获取需求
	getDemandByAddress: async (req, res) => {
		try {
			const { user_id } = req.query;
			const userDetail = await userModal.findOne({
				attributes: ['id', 'longitude', 'latitude'],
				where: { id: user_id },
			});
			const statement = `SELECT * ,(st_distance(point(longitude, latitude),point (${userDetail.longitude}, ${userDetail.latitude}))*111195/1000 ) as distance FROM demand ORDER BY distance ASC`;
			console.log(statement, 111);
			const result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
