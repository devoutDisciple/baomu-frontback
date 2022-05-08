const moment = require('moment');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const userAttentionUser = require('../models/user_attention_user');
const user = require('../models/user');

const userModal = user(sequelize);
const userAttentionUserModal = userAttentionUser(sequelize);

module.exports = {
	// 添加关注
	add: async (req, res) => {
		try {
			const { user_id, other_id } = req.body;
			if (!user_id || !other_id) return res.send(resultMessage.error('系统错误'));
			await userAttentionUserModal.create({ user_id, other_id, create_time: moment().format('YYYY-MM-DD HH:mm:ss') });
			userModal.increment({ attention_num: 1 }, { where: { id: user_id } });
			userModal.increment({ fans_num: 1 }, { where: { id: other_id } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 获取用户是否关注
	getUserIsAttention: async (req, res) => {
		try {
			const { user_id, other_id } = req.query;
			if (!user_id || !other_id) return res.send(resultMessage.success(2));
			const record = await userAttentionUserModal.findOne({ where: { user_id, other_id, is_delete: 1 } });
			if (!record) return res.send(resultMessage.success(2));
			res.send(resultMessage.success(1));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 取消关注
	cancleAttention: async (req, res) => {
		try {
			const { user_id, other_id } = req.body;
			if (!user_id || !other_id) return res.send(resultMessage.error('系统错误'));
			await userAttentionUserModal.update({ is_delete: 2 }, { where: { user_id, other_id } });
			userModal.decrement({ attention_num: 1 }, { where: { id: user_id } });
			userModal.decrement({ fans_num: 1 }, { where: { id: other_id } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
