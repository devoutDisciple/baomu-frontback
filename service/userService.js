const mapUtil = require('../util/mapUtil');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const user = require('../models/user');
const responseUtil = require('../util/responseUtil');
const { getPhotoUrl } = require('../util/userUtil');

const userModal = user(sequelize);

module.exports = {
	// 上传用户头像
	uploadFile: async (req, res, filename) => {
		try {
			const { user_id, type } = req.body;
			if (!user) return res.send(resultMessage.error('上传失败'));
			const params = {};
			if (Number(type) === 1) {
				params.photo = filename;
			}
			if (Number(type) === 2) {
				params.bg_url = filename;
			}
			await userModal.update(params, { where: { id: user_id } });
			res.send(resultMessage.success({ url: filename }));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 更新用户基本信息
	updateInfo: async (req, res) => {
		try {
			const { nickname, photo, username, style_id, desc, user_id } = req.body;
			if (!user_id) return res.send(resultMessage.error('系统错误'));
			const params = {};
			if (nickname) params.nickname = nickname;
			if (username) params.username = username;
			if (photo) params.photo = photo;
			if (style_id) params.style_id = style_id;
			if (desc) params.desc = desc;
			await userModal.update(params, { where: { id: user_id } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 更新用户地理位置坐标
	updateLocation: async (req, res) => {
		try {
			const { latitude, longitude, user_id } = req.body;
			const { province, city, formatted_address } = await mapUtil.getAddressByCode({ latitude, longitude });
			console.log(province, city, formatted_address, 111);
			await userModal.update(
				{
					latitude,
					longitude,
					province,
					city,
					address: formatted_address,
				},
				{ where: { id: user_id } },
			);
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 获取距离该用户最近的人
	getUserByLocation: async (req, res) => {
		try {
			const { user_id } = req.query;
			const commonFields = [
				'id',
				'nickname',
				'photo',
				'longitude',
				'latitude',
				'province',
				'city',
				'address',
				'grade',
				'comment_num',
			];
			const selctFields = commonFields.join(',');
			const userDetail = await userModal.findOne({ where: { id: user_id } });
			const statement = `SELECT ${selctFields} ,(st_distance(point(longitude, latitude),point (${userDetail.longitude}, ${userDetail.latitude}))*111195/1000 ) as distance FROM user where id != ${user_id} ORDER BY distance ASC`;
			const result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
			const responseResult = responseUtil.renderFieldsAll(result, [...commonFields, 'distance']);
			responseResult.forEach((item) => {
				if (item.distance < 1) {
					item.distance = `${Number(item.distance * 1000).toFixed(0)}m`;
				} else {
					item.distance = `${Number(item.distance).toFixed(1)}km`;
				}
			});
			res.send(resultMessage.success(responseResult));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 更新用户基本信息
	getUserDetail: async (req, res) => {
		try {
			const { user_id } = req.query;
			if (!user_id) return res.send(resultMessage.error('系统错误'));
			const commonFields = [
				'id',
				'username',
				'nickname',
				'bg_url',
				'photo',
				'age',
				'province',
				'city',
				'address',
				'grade',
				'comment_num',
				'attention_num',
				'fans_num',
				'goods_num',
				'is_name',
				'is_scholl',
				'is_award',
				'is_level',
				'style_id',
				'desc',
			];
			const userDetail = await userModal.findOne({
				attributes: commonFields,
				where: { id: user_id },
			});
			if (!userDetail) return res.send(resultMessage.error('系统错误'));
			const result = responseUtil.renderFieldsObj(userDetail, commonFields);
			result.photo = getPhotoUrl(userDetail.photo);
			result.bg_url = getPhotoUrl(userDetail.bg_url);
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
