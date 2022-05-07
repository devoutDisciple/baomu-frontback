const moment = require('moment');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const award = require('../models/award');
const user = require('../models/user');
const responseUtil = require('../util/responseUtil');
const config = require('../config/config');

const timeformat = 'YYYY-MM-DD HH:mm:ss';

const userModal = user(sequelize);
const awardModal = award(sequelize);

module.exports = {
	// 上传图片
	uploadFile: async (req, res, filename) => {
		try {
			res.send(resultMessage.success({ url: filename }));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 添加
	add: async (req, res) => {
		try {
			const data = req.body;
			if (
				!data.user_id ||
				!data.award_url ||
				!data.certificate_gov ||
				!data.certificate_name ||
				!data.certificate_level ||
				!data.certificate_time
			) {
				return res.send(resultMessage.error('系统错误'));
			}
			data.state = 2;
			data.create_time = moment().format(timeformat);
			await awardModal.create(data);
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 获取用户认证信息
	getAll: async (req, res) => {
		try {
			const { user_id } = req.query;
			if (!user_id) return res.send(resultMessage.error('系统错误'));
			const awards = await awardModal.findOne({ where: { user_id, is_delete: 1 } });
			if (!awards) return res.send(resultMessage.success([]));
			const result = responseUtil.renderFieldsObj(awards, [
				'id',
				'user_id',
				'award_url',
				'certificate_gov',
				'certificate_name',
				'certificate_level',
				'certificate_time',
				'state',
			]);
			if (result) {
				result.award_url = config.preUrl.awardUrl + result.award_url;
				result.certificate_time = moment(result.date).format('YYYY-MM-DD');
			}
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 删除
	deleteItemById: async (req, res) => {
		try {
			const { id, user_id } = req.body;
			if (!id || !user_id) {
				return res.send(resultMessage.error('系统错误'));
			}
			await awardModal.update({ is_delete: 2 }, { where: { id } });
			await userModal.update({ is_award: 2 }, { where: { id: user_id } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
