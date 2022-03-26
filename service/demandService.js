const moment = require('moment');
const { getPhotoUrl } = require('../util/userUtil');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const demand = require('../models/demand');
const user = require('../models/user');
const priceRecord = require('../models/price_record');
const responseUtil = require('../util/responseUtil');

const priceRecordModal = priceRecord(sequelize);
const userModal = user(sequelize);
const demandModal = demand(sequelize);

demandModal.belongsTo(userModal, { foreignKey: 'user_id', targetKey: 'id', as: 'userDetail' });

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
			// const commonFields = [
			// 	'id',
			// 	'title',
			// 	'price',
			// 	'addressName',
			// 	'start_time',
			// 	'end_time',
			// 	'is_bargain',
			// 	'is_food',
			// 	'is_send',
			// 	'play_id',
			// 	'instrument_id',
			// ];
			// 方案一  按照距离
			// const { user_id } = req.query;
			// const userDetail = await userModal.findOne({
			// 	attributes: ['id', 'longitude', 'latitude'],
			// 	where: { id: user_id },
			// });
			// const statement = `SELECT demand.id as id, demand.user_id as user_id,demand.title as title,demand.price as price,demand.addressName as addressName,demand.start_time as start_time,
			// demand.end_time as end_time,demand.is_bargain as is_bargain,demand.play_id as play_id,demand.instrument_id as instrument_id,
			// userDetail.nickname AS userName, userDetail.photo AS userPhoto,
			// (st_distance(point(demand.longitude, demand.latitude),point (${userDetail.longitude}, ${userDetail.latitude}))*111195/1000 ) as distance FROM demand
			// LEFT OUTER JOIN user AS userDetail ON demand.user_id = userDetail.id ORDER BY distance ASC `;
			// const demands = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
			// 方案二  按照发布时间
			const commonFields = [
				'id',
				'user_id',
				'title',
				'price',
				'addressName',
				'start_time',
				'end_time',
				'is_bargain',
				'is_food',
				'is_send',
				'play_id',
				'instrument_id',
			];
			const demands = await demandModal.findAll({
				where: {
					is_delete: 1,
				},
				attributes: commonFields,
				include: [
					{
						model: userModal,
						as: 'userDetail',
						attributes: ['id', 'nickname', 'photo'],
					},
				],
				order: [['create_time', 'DESC']],
			});
			const result = responseUtil.renderFieldsAll(demands, [...commonFields, 'userDetail']);
			if (Array.isArray(result) && result.length !== 0) {
				result.forEach((item) => {
					item.username = item.userDetail.nickname;
					item.userPhoto = getPhotoUrl(item.userDetail.photo);
					delete item.userDetail;
				});
			}
			res.send(resultMessage.success(result || []));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 获取需求详情
	getDetailById: async (req, res) => {
		try {
			const { id, user_id } = req.query;
			if (!id || !user_id) return res.send(resultMessage.error('系统错误'));
			const commonFileds = [
				'id',
				'user_id',
				'title',
				'play_id',
				'instrument_id',
				'start_time',
				'end_time',
				'hours',
				'addressName',
				'longitude',
				'latitude',
				'is_bargain',
				'is_send',
				'is_food',
				'desc',
				'price',
				'state',
				'create_time',
			];
			let detail = await demandModal.findOne({ where: { id }, attributes: commonFileds });
			if (!detail) return res.send(resultMessage.error('系统错误'));
			detail = responseUtil.renderFieldsObj(detail, commonFileds);
			// 查看当前用户报价进行到某种状态
			const prices = await priceRecordModal.findAll({
				where: { user_id, demand_id: id },
				order: [['create_time', 'DESC']],
				limit: 1,
			});
			// detailState: 1-未参与报价 2-竞标结束 3-竞标进行中被拒绝 4-竞标进行中待商议
			detail.detailState = 1;
			if (prices && prices[0]) {
				const pricesItem = responseUtil.renderFieldsObj(prices[0], ['id', 'state', 'create_time']);
				detail.detailState = pricesItem.state + 1;
			}
			res.send(resultMessage.success(detail || {}));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 直接报名需求
	signDemand: async (req, res) => {
		try {
			const { id, user_id } = req.body;
			const demandDetail = await demandModal.findOne({ where: { id } });
			// 1-开始状态 2-竞价进行中 3-需求进行中（必须已支付） 4-交易成功 5-交易失败 6-交易取消
			if (!demandDetail || demandDetail.state !== 2 || demandDetail.is_bargain !== 2) {
				return res.send(resultMessage.success('系统错误'));
			}
			const join_ids = demandDetail.join_ids;
			let joinArr = [];
			if (join_ids) {
				joinArr = join_ids.split(',');
			}
			if (!joinArr.includes(user_id)) {
				joinArr.push(user_id);
			}
			// 更新需求的报价人员id
			await demandModal.update({ join_ids: joinArr.join(',') }, { where: { id } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
