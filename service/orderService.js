const moment = require('moment');
const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const order = require('../models/order');
const subject = require('../models/subject');
const teacher = require('../models/teacher');
const team = require('../models/team');
const responseUtil = require('../util/responseUtil');
const { filterTeamState } = require('../util/filter');

const teamModal = team(sequelize);
const teacherModal = teacher(sequelize);
const subjectModal = subject(sequelize);
const orderModal = order(sequelize);

const dayFormat = 'YYYY.MM.DD';

orderModal.belongsTo(teamModal, { foreignKey: 'team_uuid', targetKey: 'uuid', as: 'teamDetail' });

module.exports = {
	// 获取课程详情
	getOrderDetailByUserid: async (req, res) => {
		try {
			const { userid, subId, proId } = req.query;
			if (!userid) return res.send(resultMessage.success([]));
			const data = await orderModal.findOne({
				where: { user_id: userid, subject_id: subId, project_id: proId, is_delete: 1 },
			});
			if (!data) return res.send(resultMessage.success({}));
			const result = responseUtil.renderFieldsObj(data, ['id', 'team_uuid', 'pay_state', 'type']);
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
	// 获取用户报名课程
	getAllOrderByUserid: async (req, res) => {
		try {
			const { userid } = req.query;
			if (!userid) return res.send(resultMessage.success([]));
			const data = await orderModal.findAll({
				where: {
					user_id: userid,
					is_delete: 1,
				},
				include: [
					{
						model: teamModal,
						as: 'teamDetail',
						attributes: ['id', 'order_ids', 'user_ids', 'start_user_id', 'num', 'state'],
					},
				],
			});
			const orderList = responseUtil.renderFieldsAll(data, ['id', 'team_uuid', 'subject_id', 'pay_state', 'type', 'teamDetail']);
			const result = [];
			if (orderList && orderList.length !== 0) {
				let len = orderList.length;
				while (len > 0) {
					len -= 1;
					const orderItem = orderList[len];
					let subjectDetail = await subjectModal.findOne({
						where: { id: orderItem.subject_id },
					});
					subjectDetail = responseUtil.renderFieldsObj(subjectDetail, [
						'id',
						'project_id',
						'title',
						'start_time',
						'end_time',
						'price',
						'teacher_ids',
						'create_time',
					]);
					const teacher_ids = JSON.parse(subjectDetail.teacher_ids);
					const teacherFields = ['id', 'name', 'photo'];
					let teachers = await teacherModal.findAll({
						where: { id: teacher_ids, is_delete: 1 },
						attributes: teacherFields,
					});
					teachers = responseUtil.renderFieldsAll(teachers, teacherFields);
					subjectDetail.teacher_detail = teachers;
					subjectDetail.start_time = moment(subjectDetail.start_time).format(dayFormat);
					subjectDetail.end_time = moment(subjectDetail.end_time).format(dayFormat);
					subjectDetail.create_time = moment(subjectDetail.create_time).format(dayFormat);
					orderItem.subjectDetail = subjectDetail;
					if (orderItem.teamDetail && orderItem.teamDetail.state) {
						orderItem.teamState = filterTeamState(orderItem.teamDetail.state);
					}
					result.push(orderItem);
				}
			}
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 获取用户报名课程根据type
	getAllOrderByUseridAndType: async (req, res) => {
		try {
			const { userid, type } = req.query;
			if (!userid) return res.send(resultMessage.success([]));
			const data = await orderModal.findAll({
				where: { user_id: userid, type, is_delete: 1 },
				include: [
					{
						model: teamModal,
						as: 'teamDetail',
						attributes: ['id', 'order_ids', 'user_ids', 'start_user_id', 'num', 'state'],
					},
				],
			});
			const orderList = responseUtil.renderFieldsAll(data, ['id', 'team_uuid', 'subject_id', 'pay_state', 'type', 'teamDetail']);
			const result = [];
			if (orderList && orderList.length !== 0) {
				let len = orderList.length;
				while (len > 0) {
					len -= 1;
					const orderItem = orderList[len];
					let subjectDetail = await subjectModal.findOne({ where: { id: orderItem.subject_id } });
					subjectDetail = responseUtil.renderFieldsObj(subjectDetail, [
						'id',
						'project_id',
						'title',
						'start_time',
						'end_time',
						'price',
						'teacher_ids',
						'create_time',
					]);
					const teacher_ids = JSON.parse(subjectDetail.teacher_ids);
					const teacherFields = ['id', 'name', 'photo'];
					let teachers = await teacherModal.findAll({
						where: { id: teacher_ids, is_delete: 1 },
						attributes: teacherFields,
					});
					teachers = responseUtil.renderFieldsAll(teachers, teacherFields);
					subjectDetail.teacher_detail = teachers;
					subjectDetail.start_time = moment(subjectDetail.start_time).format(dayFormat);
					subjectDetail.end_time = moment(subjectDetail.end_time).format(dayFormat);
					subjectDetail.create_time = moment(subjectDetail.create_time).format(dayFormat);
					orderItem.subjectDetail = subjectDetail;
					if (orderItem.teamDetail && orderItem.teamDetail.state) {
						orderItem.teamState = filterTeamState(orderItem.teamDetail.state);
					}
					result.push(orderItem);
				}
			}
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
