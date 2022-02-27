const Sequelize = require('sequelize');
const moment = require('moment');
const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const subject = require('../models/subject');
const teacher = require('../models/teacher');
const subDetail = require('../models/detail');
const responseUtil = require('../util/responseUtil');

const Op = Sequelize.Op;
const subjectModal = subject(sequelize);
const teacherModal = teacher(sequelize);
const subDetailModal = subDetail(sequelize);
const timeformat = 'YYYY.MM.DD';

module.exports = {
	// 获取所有课程
	getAllSubjectByProjectId: async (req, res) => {
		try {
			const { projectid } = req.query;
			if (!projectid) return res.send(resultMessage.success([]));
			const commonFields = ['id', 'project_id', 'title', 'start_time', 'end_time', 'teacher_ids', 'price', 'tags'];
			const data = await subjectModal.findAll({
				where: { project_id: projectid, is_delete: 1 },
				attributes: commonFields,
				order: [['sort', 'DESC']],
			});
			const result = responseUtil.renderFieldsAll(data, commonFields);
			let teacher_ids = [];
			result.forEach(async (item) => {
				if (item.teacher_ids) {
					item.teacher_ids = JSON.parse(item.teacher_ids);
					teacher_ids = teacher_ids.concat(item.teacher_ids);
				}
				item.tags = JSON.parse(item.tags);
				item.start_time = moment(item.start_time).format(timeformat);
				item.end_time = moment(item.end_time).format(timeformat);
			});
			const teacherFields = ['id', 'name', 'photo'];
			let teachers = await teacherModal.findAll({
				where: { id: teacher_ids, is_delete: 1 },
				attributes: teacherFields,
			});
			teachers = responseUtil.renderFieldsAll(teachers, teacherFields);

			result.forEach(async (item) => {
				if (item.teacher_ids && item.teacher_ids.length !== 0) {
					let teacher_detail = [];
					item.teacher_ids.forEach((teach_id) => {
						teacher_detail = teacher_detail.concat(teachers.filter((tea) => tea.id === teach_id));
					});
					item.teacher_detail = teacher_detail;
				}
			});
			await res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 获取课程详情
	getSubjectDetailById: async (req, res) => {
		try {
			const { id } = req.query;
			const commonFields = [
				'id',
				'project_id',
				'title',
				'start_time',
				'end_time',
				'teacher_ids',
				'price',
				'apply_price',
				'cluster_price',
				'total_person',
				'limit_num',
				'tags',
				'state',
				'sort',
			];
			let detail = await subjectModal.findOne({
				where: { id },
				attributes: commonFields,
			});
			detail = responseUtil.renderFieldsObj(detail, commonFields);
			detail.start_time = moment(detail.start_time).format(timeformat);
			detail.end_time = moment(detail.end_time).format(timeformat);
			const teacher_ids = JSON.parse(detail.teacher_ids);
			const teacherFields = ['id', 'name', 'photo'];
			let teachers = await teacherModal.findAll({
				where: { id: teacher_ids, is_delete: 1 },
				attributes: teacherFields,
			});
			teachers = responseUtil.renderFieldsAll(teachers, teacherFields);

			detail.teacher_detail = teachers;
			const subDetailFields = ['id', 'url', 'detail_urls', 'teacher_urls', 'signup_urls'];
			let subItemDetail = await subDetailModal.findOne({
				where: { sub_id: detail.id, is_delete: 1 },
				attributes: subDetailFields,
			});
			subItemDetail = responseUtil.renderFieldsObj(subItemDetail, subDetailFields);
			detail.detail_urls = {
				url: subItemDetail.url,
				detailUrls: JSON.parse(subItemDetail.detail_urls),
				teachUrls: JSON.parse(subItemDetail.teacher_urls),
				signupUrls: JSON.parse(subItemDetail.signup_urls),
			};
			res.send(resultMessage.success(detail));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 根据关键词搜索
	getAllSubjectByKeywords: async (req, res) => {
		try {
			const { keywords } = req.query;
			const commonFields = ['id', 'project_id', 'title', 'start_time', 'end_time', 'price', 'teacher_ids', 'create_time', 'tags'];
			let subjectLists = await subjectModal.findAll({
				where: {
					title: {
						[Op.like]: `%${keywords}%`,
					},
				},
				attributes: commonFields,
				order: [['create_time', 'DESC']],
			});
			subjectLists = responseUtil.renderFieldsAll(subjectLists, commonFields);
			const result = [];
			if (subjectLists && subjectLists.length !== 0) {
				let len = subjectLists.length;
				while (len > 0) {
					len -= 1;
					const subjectDetail = subjectLists[len];
					const teacher_ids = JSON.parse(subjectDetail.teacher_ids);
					const teacherFields = ['id', 'name', 'photo'];
					let teachers = await teacherModal.findAll({
						where: { id: teacher_ids, is_delete: 1 },
						attributes: teacherFields,
					});
					teachers = responseUtil.renderFieldsAll(teachers, teacherFields);

					subjectDetail.teacher_detail = teachers;
					subjectDetail.start_time = moment(subjectDetail.start_time).format(timeformat);
					subjectDetail.end_time = moment(subjectDetail.end_time).format(timeformat);
					subjectDetail.create_time = moment(subjectDetail.create_time).format(timeformat);
					result.push(subjectLists[len]);
				}
			}
			res.send(resultMessage.success(subjectLists));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
