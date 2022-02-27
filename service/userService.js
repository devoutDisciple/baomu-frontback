const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const user = require('../models/user');

const userModal = user(sequelize);

module.exports = {
	// 更新用户基本信息
	updateInfo: async (req, res) => {
		try {
			const { username, photo, userid } = req.body;
			await userModal.update(
				{
					username,
					photo,
				},
				{ where: { id: userid } },
			);
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
