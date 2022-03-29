const mapUtil = require('../util/mapUtil');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const user = require('../models/user');
const production = require('../models/production');
const responseUtil = require('../util/responseUtil');
const { getPhotoUrl } = require('../util/userUtil');
const config = require('../config/config');

const userModal = user(sequelize);
const productionModal = production(sequelize);
const pagesize = 10;

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
			const { user_id, current } = req.query;
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
			const offset = Number(Number(current) * pagesize);
			const selctFields = commonFields.join(',');
			const userDetail = await userModal.findOne({ where: { id: user_id } });
			const statement = `SELECT ${selctFields} ,(st_distance(point(longitude, latitude), 
            point (${userDetail.longitude}, ${userDetail.latitude}))*111195/1000 ) as distance 
			FROM user ORDER BY distance ASC LIMIT ${offset}, ${pagesize}`;
			// FROM user where id != ${user_id} ORDER BY distance ASC LIMIT ${offset}, ${pagesize}`;
			const result = await sequelize.query(statement, { type: sequelize.QueryTypes.SELECT });
			if (!result || result.length === 0) return res.send(resultMessage.success([]));
			const responseResult = responseUtil.renderFieldsAll(result, [...commonFields, 'distance']);
			let len = responseResult.length;
			const newResult = [];
			while (len > 0) {
				len -= 1;
				const currentItem = responseResult[len];
				if (currentItem.distance < 1) {
					currentItem.distance = `${Number(currentItem.distance * 1000).toFixed(0)}m`;
					if (currentItem.distance === '0m') currentItem.distance = '100m以内';
				} else {
					currentItem.distance = `${Number(currentItem.distance).toFixed(1)}km`;
				}
				currentItem.photo = getPhotoUrl(currentItem.photo);
				const productionList = await productionModal.findAll({
					attributes: ['id', 'img_url', 'video'],
					// type 1-作品 2-动态
					where: { user_id: currentItem.id, type: 1 },
					order: [['create_time', 'DESC']],
					limit: 3,
					offset: 0,
				});
				let productionImgs = [];
				if (productionList && productionList.length !== 0) {
					productionList.forEach((item) => {
						const img_url = JSON.parse(item.img_url);
						const videoDetail = JSON.parse(item.video);
						if (img_url && img_url.length !== 0) {
							const newImgs = img_url.map((img) => ({ type: 'img', url: `${config.preUrl.productionUrl}${img}` }));
							productionImgs = [...newImgs, ...productionImgs];
						}
						if (videoDetail && Object.keys(videoDetail).length !== 0) {
							videoDetail.url = config.preUrl.productionUrl + videoDetail.url;
							videoDetail.photo.url = config.preUrl.productionUrl + videoDetail.photo.url;
							productionImgs.push({ ...videoDetail, type: 'video' });
						}
					});
				}
				currentItem.productionImgs = productionImgs;
				newResult.unshift(currentItem);
			}
			res.send(resultMessage.success(newResult));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 获取用户基本信息
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

	// 获取用户作品列表
	getProductionList: async (req, res) => {
		try {
			const { user_id, type } = req.query;
			if (!user_id) return res.send(resultMessage.error('系统错误'));
			const productionList = await productionModal.findAll({
				attributes: ['id', 'img_url', 'video'],
				where: { user_id, type },
				order: [['create_time', 'DESC']],
				limit: 3,
				offset: 0,
			});
			if (!productionList) return res.send(resultMessage.success([]));
			let result = [];
			if (productionList && productionList.length !== 0) {
				productionList.forEach((item) => {
					const img_url = JSON.parse(item.img_url);
					const videoDetail = JSON.parse(item.video);
					if (img_url && img_url.length !== 0) {
						const newImgs = img_url.map((img) => ({ type: 'img', url: `${config.preUrl.productionUrl}${img}` }));
						result = [...newImgs, ...result];
					}
					if (videoDetail && Object.keys(videoDetail).length !== 0) {
						videoDetail.url = config.preUrl.productionUrl + videoDetail.url;
						videoDetail.photo.url = config.preUrl.productionUrl + videoDetail.photo.url;
						result.push({ ...videoDetail, type: 'video' });
					}
				});
			}
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
