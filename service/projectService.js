const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const project = require('../models/project');
const responseUtil = require('../util/responseUtil');

const projectModal = project(sequelize);

module.exports = {
	// 获取所有班级
	getAllProjectByTypeId: async (req, res) => {
		try {
			const { typeid } = req.query;
			if (!typeid) return res.send(resultMessage.success([]));
			const data = await projectModal.findAll({ where: { type_id: typeid, is_delete: 1 }, order: [['sort', 'DESC']] });
			const result = responseUtil.renderFieldsAll(data, ['id', 'name', 'type_id']);
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
