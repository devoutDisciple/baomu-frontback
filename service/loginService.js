const moment = require('moment');
const sequelize = require('../dataSource/MysqlPoolClass');
const user = require('../models/user');
const resultMessage = require('../util/resultMessage');
const responseUtil = require('../util/responseUtil');

const userModal = user(sequelize);
const wechatUtil = require('../util/wechatUtil');

module.exports = {
	// 通过openid微信登录
	loginByWxOpenid: async (req, res) => {
		try {
			const { code, avatarUrl, nickName } = req.body;
			const { openid } = await wechatUtil.getUserSessionKey(code);
			const userDetail = await userModal.findOne({ where: { wx_openid: openid } });
			// 初始登录，仅仅获得了openid
			if (!userDetail && !avatarUrl && !nickName) {
				await userModal.create({
					wx_openid: openid,
					create_time: moment().format('YYYY-MM-DD HH:mm:ss'),
				});
			}
			// 直接登录，获得了用户基本信息
			if (!userDetail && avatarUrl && nickName) {
				await userModal.create({
					wx_openid: openid,
					username: '',
					photo: '',
					create_time: moment().format('YYYY-MM-DD HH:mm:ss'),
				});
			}
			// 有了用户openid，却没用用户基本信息
			if (userDetail && avatarUrl && nickName && (userDetail.photo === 'photo.png' || !userDetail.photo)) {
				await userModal.update({ username: nickName, photo: avatarUrl }, { where: { wx_openid: openid } });
			}
			let userResult = await userModal.findOne({ where: { wx_openid: openid } });
			userResult = responseUtil.renderFieldsObj(userResult, ['id', 'wx_openid', 'username', 'photo', 'phone']);
			res.send(resultMessage.success(userResult));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 通过userId微信登录
	loginByUserId: async (req, res) => {
		try {
			const { userId } = req.body;
			let userResult = await userModal.findOne({ where: { id: userId } });
			userResult = responseUtil.renderFieldsObj(userResult, ['id', 'wx_openid', 'username', 'photo']);
			res.send(resultMessage.success(userResult));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
