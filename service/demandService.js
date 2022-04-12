const Sequelize = require('sequelize');
const moment = require('moment');
const { getPhotoUrl } = require('../util/userUtil');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const demand = require('../models/demand');
const user = require('../models/user');
const priceRecord = require('../models/price_record');
const responseUtil = require('../util/responseUtil');

const Op = Sequelize.Op;
const priceRecordModal = priceRecord(sequelize);
const userModal = user(sequelize);
const demandModal = demand(sequelize);

demandModal.belongsTo(userModal, { foreignKey: 'user_id', targetKey: 'id', as: 'userDetail' });

const pagesize = 10;

module.exports = {
	// 创建需求
	addDemand: async (req, res) => {
		try {
			const { body } = req;
			const params = Object.assign(body, {});
			params.start_time = moment(params.start_time).format('YYYY-MM-DD 00:00:01');
			params.end_time = moment(params.end_time).format('YYYY-MM-DD 23:59:59');
			params.create_time = moment().format('YYYY-MM-DD HH:mm:ss');
			if (!params.user_id) return res.send(resultMessage.error('系统错误'));
			if (typeof params.price !== 'number' || !(Number(params.price) > 0)) {
				return res.send(resultMessage.error('金额错误'));
			}
			const demandDetail = await demandModal.create(params);
			// 邀请的需求，创建一个需求方的报价
			if (params.type === 2) {
				await priceRecordModal.create({
					user_id: params.join_ids,
					publisher_id: params.user_id,
					demand_id: demandDetail.id,
					price: params.price,
					type: 2, // 1-演员报价 2-需求方报价
					state: 2,
					create_time: moment().format('YYYY-MM-DD HH:mm:ss'),
				});
			}
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 根据地理位置获取需求
	getDemandByAddress: async (req, res) => {
		try {
			const { current, user_id, address_select, plays_style_id } = req.query;
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
			const offset = Number(Number(current) * pagesize);
			const where = {
				state: 1, // 1-竞价进行中 2-竞价结束，需求进行中（未支付） 3-需求进行中（已支付） 4-需求取消  5-待付款给用户 6-交易成功 7-交易取消
				is_delete: 1,
				addressAll: {
					[Op.like]: `%${address_select}%`,
				},
				[Op.not]: {
					user_id,
				},
			};
			if (plays_style_id) {
				where.play_id = plays_style_id;
			}
			const demands = await demandModal.findAll({
				where,
				attributes: commonFields,
				include: [
					{
						model: userModal,
						as: 'userDetail',
						attributes: ['id', 'nickname', 'photo'],
					},
				],
				order: [['create_time', 'DESC']],
				limit: pagesize,
				offset,
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

	// 根据输入框查询需求
	getDeamandByIptValue: async (req, res) => {
		try {
			const { user_id, value } = req.query;
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
			const where = {
				state: 1, // 1-竞价进行中 2-竞价结束，需求进行中（未支付） 3-需求进行中（已支付） 4-需求取消  5-待付款给用户 6-交易成功 7-交易取消
				is_delete: 1,
				[Op.or]: {
					title: {
						[Op.like]: `%${value}%`,
					},
					desc: {
						[Op.like]: `%${value}%`,
					},
				},
				[Op.not]: {
					user_id,
				},
			};
			const demands = await demandModal.findAll({
				where,
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
			// 由于是个人查看，所以状态跟着报价状态走
			// detailState: 1-未参与竞标 2-竞标进行中待商议 3-被拒绝  4-中标
			detail.detailState = 1;
			if (prices && prices[0]) {
				const pricesItem = responseUtil.renderFieldsObj(prices[0], ['id', 'state', 'create_time']);
				detail.detailState = pricesItem.state;
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
			// 创建报名记录
			await priceRecordModal.create({
				user_id,
				demand_id: id,
				type: 1,
				state: 4,
				create_time: moment().format('YYYY-MM-DD HH:mm:ss'),
			});
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 查询个人工作记录
	getDemandByUserId: async (req, res) => {
		try {
			const { user_id, type } = req.query;
			// type 1-发布的 2-参与的
			let where = '';
			// 我发布的
			if (Number(type) === 1) {
				where = `WHERE user_id = ${user_id} `;
			}
			// 我参与竞价的
			if (Number(type) === 2) {
				where = `WHERE FIND_IN_SET(${user_id}, join_ids) `;
			}
			const statement = `SELECT demand.id, demand.user_id, demand.join_ids, demand.title, demand.play_id, 
            demand.instrument_id, demand.addressName, demand.price, demand.state, demand.create_time, userDetail.nickname AS username, userDetail.photo AS userPhoto 
            FROM demand AS demand LEFT OUTER JOIN user AS userDetail ON demand.user_id = userDetail.id 
            ${where} ORDER BY demand.create_time DESC;`;
			const demands = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
			// const commonDemandsField = [
			// 	'id',
			// 	'user_id',
			// 	'join_ids',
			// 	'title',
			// 	'play_id',
			// 	'instrument_id',
			// 	'addressName',
			// 	'price',
			// 	'state',
			// 	'create_time',
			// 	'username',
			// 	'userPhoto',
			// 	'join_users',
			// 	'playName',
			// 	'instrumentName',
			// 	'instrumentUrl',
			// ];
			const result = [];
			if (demands && demands.length !== 0) {
				let len = demands.length;
				while (len > 0) {
					len -= 1;
					const curItem = Object.assign(demands[len], {});
					curItem.userPhoto = getPhotoUrl(curItem.userPhoto);
					curItem.create_time = moment(curItem.create_time).format('YYYY.MM.dDD');
					const join_ids = curItem.join_ids;
					// 获取当前需求，当前参与人的报价状态，获取最后一条记录
					const priceRecordDetail = await priceRecordModal.findAll({
						where: { demand_id: curItem.id, user_id },
						order: [['create_time', 'DESC']],
						limit: 1,
					});
					if (priceRecordDetail && priceRecordDetail.length !== 0) {
						curItem.priceState = priceRecordDetail[0].state;
						// 1-未参与竞标 2-竞标进行中待商议 3-被拒绝  4-中标
						// 再中标的基础上加上需求状态
						// curItem.state = Number(priceRecordDetail.state) + Number(curItem.state);
					}
					// 查询参与竞价人员的信息
					if (join_ids) {
						const userFields = ['id', 'nickname', 'photo'];
						const join_ids_arr = join_ids.split(',');
						console.log(join_ids_arr, 23323);
						let users = await userModal.findAll({
							where: { id: join_ids_arr },
							attributes: userFields,
						});
						if (users && users.length !== 0) {
							users = responseUtil.renderFieldsAll(users, userFields);
							users.forEach((item) => {
								item.photo = getPhotoUrl(item.photo);
							});
							curItem.join_users = users;
						}
					}
					result.unshift(curItem);
				}
			}
			res.send(resultMessage.success(result || []));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
