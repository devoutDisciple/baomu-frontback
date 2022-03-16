const moment = require('moment');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const idcard = require('../models/idcard');
const responseUtil = require('../util/responseUtil');
const config = require('../config/config');

const timeformat = 'YYYY-MM-DD HH:mm:ss';

const idcardModal = idcard(sequelize);

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
			const body = req.body;
			if (!body.user_id || !body.idcard1 || !body.idcard2) {
				return res.send(resultMessage.error('系统错误'));
			}
			body.state = 2;
			body.create_time = moment().format(timeformat);
			await idcardModal.create(body);
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
			const idcards = await idcardModal.findOne({ where: { user_id, is_delete: 1 } });
			if (!idcards) return res.send(resultMessage.success({}));
			const result = responseUtil.renderFieldsObj(idcards, ['idcard1', 'idcard2', 'state']);
			if (result) {
				result.idcard1 = config.preUrl.idcardUrl + result.idcard1;
				result.idcard2 = config.preUrl.idcardUrl + result.idcard2;
			}
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
