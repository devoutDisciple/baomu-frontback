const resultMessage = require('../util/resultMessage');
const sequelize = require('../dataSource/MysqlPoolClass');
const swiper = require('../models/swiper');
const responseUtil = require('../util/responseUtil');
const config = require('../config/config');

const swiperModal = swiper(sequelize);

module.exports = {
	// 获取所有轮播图
	getAllSwiper: async (req, res) => {
		try {
			const data = await swiperModal.findAll({ where: { is_delete: 1 } });
			const result = responseUtil.renderFieldsAll(data, ['id', 'url']);
			result.forEach((item) => {
				item.url = config.preUrl.swiperUrl + item.url;
			});
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
