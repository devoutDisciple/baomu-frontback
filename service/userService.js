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
			const params = {
				latitude,
				longitude,
				province,
				city,
				address: formatted_address,
			};
			await userModal.update(params, { where: { id: user_id } });
			res.send(resultMessage.success(params));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 获取距离该用户最近的人
	getUserByLocation: async (req, res) => {
		try {
			// onlyPerson 是否只是获取用户
			const { user_id, current, onlyPerson, address_select, person_style_id, plays_style_id, team_type_id } = req.query;
			let personParams = '';
			let addressParams = '';
			let personStyleParams = '';
			let playStyleParams = '';
			let teamTypeParams = '';
			// 是否仅仅选择单人还是团队，type 1-个人 2-团队
			if (onlyPerson && onlyPerson !== 'undefined') {
				personParams = 'and type = 1';
			}
			// 选择的地址
			if (address_select && address_select !== 'undefined') {
				addressParams = `and city like '%${address_select}%'`;
			}
			// 擅长风格
			if (person_style_id && person_style_id !== 'undefined') {
				personStyleParams = `and style_id = ${person_style_id}`;
			}
			// 演奏方式
			if (plays_style_id && plays_style_id !== 'undefined') {
				playStyleParams = `and play_id = ${plays_style_id}`;
			}
			// 乐队类型
			if (team_type_id && team_type_id !== 'undefined') {
				teamTypeParams = `and type = ${team_type_id}`;
			}
			const commonFields = [
				'id',
				'nickname',
				'photo',
				'longitude',
				'latitude',
				'province',
				'city',
				'type',
				'address',
				'grade',
				'comment_num',
				'is_name',
			];
			const offset = Number(Number(current) * pagesize);
			const selctFields = commonFields.join(',');
			const userDetail = await userModal.findOne({ where: { id: user_id } });
			const statement = `SELECT ${selctFields} ,(st_distance(point(longitude, latitude), 
            point (${userDetail.longitude}, ${userDetail.latitude}))*111195/1000 ) as distance 
			FROM user where id != ${user_id} ${personParams} ${addressParams} ${personStyleParams} ${playStyleParams} ${teamTypeParams} and is_delete = 1 
            and is_name = 1 and is_school = 1 and is_award = 1 and is_level = 1 
            ORDER BY distance ASC LIMIT ${offset}, ${pagesize}`;
			console.log(statement, 111);
			// FROM user ORDER BY distance ASC LIMIT ${offset}, ${pagesize}`;
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
				currentItem.photo = getPhotoUrl(currentItem.photo, currentItem.type);
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

	// 获取用户通过输入框搜索
	getUserBySearchValue: async (req, res) => {
		try {
			// onlyPerson 是否只是获取用户
			const { value, user_id } = req.query;
			const commonFields = [
				'id',
				'nickname',
				'photo',
				'longitude',
				'latitude',
				'province',
				'city',
				'type',
				'address',
				'grade',
				'comment_num',
				'is_name',
			];
			const selctFields = commonFields.join(',');
			const userDetail = await userModal.findOne({ where: { id: user_id } });
			const statement = `SELECT ${selctFields} ,(st_distance(point(longitude, latitude), 
            point (${userDetail.longitude}, ${userDetail.latitude}))*111195/1000 ) as distance 
			FROM user where id != ${user_id} and is_delete = 1 and 
            (nickname like '%${value}%' or username like '%${value}%' or 'desc' like '%${value}%')
            ORDER BY distance ASC`;
			// FROM user ORDER BY distance ASC LIMIT ${offset}, ${pagesize}`;
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
				currentItem.photo = getPhotoUrl(currentItem.photo, currentItem.type);
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
				'type',
				'team_id',
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
				'is_school',
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
			result.photo = getPhotoUrl(userDetail.photo, result.type);
			result.bg_url = getPhotoUrl(userDetail.bg_url, result.type);
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 获取邀请的人的详情
	getInvitationUserDetail: async (req, res) => {
		try {
			const { user_ids } = req.query;
			if (!user_ids) return res.send(resultMessage.error('系统错误'));
			const commonFields = ['id', 'username', 'nickname', 'photo', 'type'];
			const users = await userModal.findAll({
				attributes: commonFields,
				where: { id: JSON.parse(user_ids) },
			});
			if (!users) return res.send(resultMessage.error('系统错误'));
			const result = responseUtil.renderFieldsAll(users, commonFields);
			result.forEach((item) => {
				item.photo = getPhotoUrl(item.photo, item.type);
			});
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
