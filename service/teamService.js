const moment = require('moment');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const team = require('../models/team');
const user = require('../models/user');
const production = require('../models/production');
const ObjectUtil = require('../util/ObjectUtil');
const mapUtil = require('../util/mapUtil');
const config = require('../config/config');
const responseUtil = require('../util/responseUtil');

const timeformat = 'YYYY-MM-DD HH:mm:ss';

const productionModal = production(sequelize);
const userModal = user(sequelize);
const teamModal = team(sequelize);

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
			const { user_id, name, photo, bg_url, team_user_ids, study_id, desc, latitude, longitude } = req.body;
			if (!user_id || !name || !photo || !bg_url || !team_user_ids || !study_id || !desc || !latitude || !longitude) {
				return res.send(resultMessage.error('系统错误'));
			}
			const { province, city, formatted_address } = await mapUtil.getAddressByCode({ latitude, longitude });
			const params = {
				team_uuid: ObjectUtil.getUuid(),
				user_ids: team_user_ids,
				ower_id: user_id,
				name,
				photo,
				bg_url,
				style_id: study_id,
				desc,
				latitude,
				longitude,
				province,
				city,
				address: formatted_address,
				create_time: moment().format(timeformat),
			};
			const result = await teamModal.create(params);
			console.log(result.id, result.user_ids);
			const userDetail = await userModal.create({
				wx_openid: result.team_uuid,
				nickname: result.name,
				photo: result.photo,
				bg_url: result.bg_url,
				type: 2, // 1-个人  2-团队
				team_id: result.id,
				style_id: result.style_id,
				desc: result.desc,
				latitude,
				longitude,
				province,
				city,
				address: formatted_address,
				create_time: result.create_time,
			});
			await teamModal.update({ user_table_id: userDetail.id }, { where: { id: result.id } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 获取团队列表根据用户id
	getTeamsByUserId: async (req, res) => {
		try {
			const { user_id } = req.query;
			if (!user_id) return res.send(resultMessage.error('系统错误'));
			const condition = [sequelize.fn('FIND_IN_SET', user_id, sequelize.col('user_ids')), { is_delete: 1 }];
			const teams = await teamModal.findAll({
				where: condition,
				order: [['create_time', 'DESC']],
			});
			if (!teams || teams.length === 0) return res.send(resultMessage.success([]));
			const result = responseUtil.renderFieldsAll(teams, [
				'id',
				'user_ids',
				'ower_id',
				'user_table_id',
				'name',
				'photo',
				'create_time',
			]);
			let len = result.length;
			const newResult = [];
			while (len > 0) {
				len -= 1;
				const currentItem = result[len];
				currentItem.photo = config.preUrl.teamUrl + currentItem.photo;
				currentItem.create_time = moment(currentItem.create_time).format('YYYY.MM.DD');
				currentItem.user_ids = currentItem.user_ids.split(',');
				currentItem.person_num = currentItem.user_ids.length;
				const productionList = await productionModal.findAll({
					attributes: ['id', 'img_url', 'video'],
					// type 1-作品 2-动态
					where: { user_id: currentItem.user_table_id, type: 2 },
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

			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
