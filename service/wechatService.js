const config = require('../config/config');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const wechatUtil = require('../util/wechatUtil');
const WXBizDataCrypt = require('../util/WXBizDataCrypt');
const user = require('../models/user');

const userModal = user(sequelize);

module.exports = {
	// 获取手机号
	getPhone: async (req, res) => {
		try {
			// encryptedData, iv为微信加密数据，需要解密，参考 https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html#%E5%8A%A0%E5%AF%86%E6%95%B0%E6%8D%AE%E8%A7%A3%E5%AF%86%E7%AE%97%E6%B3%95
			const { encryptedData, iv, code, userid } = req.body;
			// 获取session_key
			const { session_key } = await wechatUtil.getUserSessionKey(code);
			// 对encryptedData和iv进行解密
			const pc = new WXBizDataCrypt(config.wx_appid, session_key);

			const data = pc.decryptData(encryptedData, iv);
			if (data && data.phoneNumber) {
				const { phoneNumber } = data;
				await userModal.update(
					{
						phone: phoneNumber,
					},
					{
						where: {
							id: userid,
						},
					},
				);
				res.send(resultMessage.success(phoneNumber));
			}

			// 获取access_token
			// const { access_token } = await wechatUtil.getAccessToken();
			// request(
			// 	{
			// 		url: `${config.wechat_phone_url}?access_token=${access_token}`,
			// 		method: 'POST',
			// 		json: true,
			// 		headers: {
			// 			'content-type': 'application/json',
			// 		},
			// 		body: JSON.stringify({ code: iv, access_token }),
			// 	},
			// 	(error, response, body) => {
			// 		if (!error && response.statusCode === 200) {
			// 		}
			// 	},
			// );
			// res.send(resultMessage.success(result));
		} catch (error) {
			res.send(resultMessage.error());
		}
	},
};
