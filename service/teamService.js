const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const team = require('../models/team');
const order = require('../models/order');
const user = require('../models/user');
const responseUtil = require('../util/responseUtil');
const { filterTeamState } = require('../util/filter');

const userModal = user(sequelize);
const orderModal = order(sequelize);
const teamModal = team(sequelize);

orderModal.belongsTo(userModal, { foreignKey: 'user_id', targetKey: 'id', as: 'userDetail' });

module.exports = {
	// 获取组团详情根据team uuid
	getTeamDetailByTeamUuid: async (req, res) => {
		try {
			const { team_uuid } = req.query;
			if (!team_uuid) return res.send(resultMessage.success({}));
			const data = await teamModal.findOne({
				where: { uuid: team_uuid, is_delete: 1 },
			});
			const result = responseUtil.renderFieldsObj(data, [
				'id',
				'uuid',
				'subject_id',
				'project_id',
				'order_ids',
				'user_ids',
				'is_starter',
				'num',
				'state',
			]);
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 获取组团详情
	getTeamDetailAndProcessByUserid: async (req, res) => {
		try {
			const { team_uuid } = req.query;
			if (!team_uuid) return res.send(resultMessage.success({}));
			const commonTeamFields = ['id', 'order_ids', 'user_ids', 'num', 'state', 'create_time', 'end_time'];
			const data = await teamModal.findOne({
				where: { uuid: team_uuid, is_delete: 1 },
				attributes: commonTeamFields,
			});
			const teamDetail = responseUtil.renderFieldsObj(data, commonTeamFields);
			teamDetail.teamState = filterTeamState(teamDetail.state);
			const order_ids = JSON.parse(teamDetail.order_ids);
			const orderList = await orderModal.findAll({
				where: { id: order_ids },
				order: [['create_time', 'ASC']],
				attributes: ['user_id', 'type', 'create_time'],
				include: [
					{
						model: userModal,
						as: 'userDetail',
						attributes: ['id', 'username', 'photo'],
					},
				],
			});
			const result = responseUtil.renderFieldsAll(orderList, ['user_id', 'type', 'create_time', 'userDetail']);
			teamDetail.orderDtail = result;
			res.send(resultMessage.success(teamDetail));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
