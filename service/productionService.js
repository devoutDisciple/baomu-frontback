const moment = require('moment');
const sizeOf = require('image-size');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const production = require('../models/production');
const user = require('../models/user');
const responseUtil = require('../util/responseUtil');
const config = require('../config/config');

const timeformat = 'YYYY-MM-DD HH:mm:ss';
const { getPhotoUrl } = require('../util/userUtil');

const userModal = user(sequelize);
const productionModal = production(sequelize);
productionModal.belongsTo(userModal, { foreignKey: 'user_id', targetKey: 'id', as: 'userDetail' });

const pagesize = 10;

module.exports = {
	// 上传图片
	uploadImg: async (req, res, filename) => {
		try {
			res.send(resultMessage.success({ url: filename }));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 上传视频
	uploadVideo: async (req, res, filename) => {
		try {
			res.send(resultMessage.success({ url: filename }));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 上传封面
	uploadCoverImg: async (req, res, filename) => {
		try {
			const dimensions = sizeOf(req.file.path);
			res.send(resultMessage.success({ url: filename, width: dimensions.width, height: dimensions.height }));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 添加
	add: async (req, res) => {
		try {
			const data = req.body;
			if (!data.user_id || !data.title || !data.instr_id || !data.desc || !data.img_url || !data.video || !data.type) {
				return res.send(resultMessage.error('系统错误'));
			}
			data.img_url = JSON.stringify(data.img_url) || '[]';
			data.video = JSON.stringify(data.video) || '{}';
			data.create_time = moment().format(timeformat);
			await productionModal.create(data);
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 获取用户作品
	getAllByUserId: async (req, res) => {
		try {
			const { user_id, type } = req.query;
			if (!user_id) return res.send(resultMessage.error('系统错误'));
			const lists = await productionModal.findAll({
				where: { user_id, type, is_delete: 1 },
				order: [['create_time', 'DESC']],
			});
			if (!lists || lists.length === 0) return res.send(resultMessage.success([]));
			const result = responseUtil.renderFieldsAll(lists, ['id', 'user_id', 'title', 'desc', 'instr_id', 'img_url', 'video']);
			result.forEach((item) => {
				item.img_url = JSON.parse(item.img_url);
				item.video = JSON.parse(item.video);
				// {"url":"J4BHYM31VLB7Z3Y8-1647622665497.png","height":260,"width":482,"duration":14.664,"size":2143880,"photo":{"url":"KFF5UR6M8M9ETOAB-1647622665543.png","width":482,"height":260}}
				if (item.video && item.video.url) {
					item.video.url = config.preUrl.productionUrl + item.video.url;
					item.video.photo.url = config.preUrl.productionUrl + item.video.photo.url;
					item.showImg = item.video.photo.url;
				}
				if (item.img_url && item.img_url.length !== 0) {
					const img_urls = [];
					item.img_url.forEach((url) => {
						img_urls.push(config.preUrl.productionUrl + url);
					});
					item.img_url = img_urls;
					item.showImg = item.img_url[0];
				}
			});
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 获取作品详情
	getDetailById: async (req, res) => {
		try {
			const { id } = req.query;
			if (!id) return res.send(resultMessage.error('系统错误'));
			const lists = await productionModal.findOne({
				where: { id, is_delete: 1 },
				include: [
					{
						model: userModal,
						as: 'userDetail',
						attributes: ['id', 'nickname', 'photo', 'type', 'is_name', 'is_school', 'is_level', 'is_award'],
					},
				],
			});
			if (!lists) return res.send(resultMessage.success({}));
			const result = responseUtil.renderFieldsObj(lists, [
				'id',
				'user_id',
				'title',
				'desc',
				'instr_id',
				'img_url',
				'video',
				'create_time',
				'userDetail',
			]);
			result.img_url = JSON.parse(result.img_url);
			result.video = JSON.parse(result.video);
			if (result.video && result.video.url) {
				result.video.url = config.preUrl.productionUrl + result.video.url;
				result.video.photo.url = config.preUrl.productionUrl + result.video.photo.url;
			}
			if (result.img_url && result.img_url.length !== 0) {
				const img_urls = [];
				result.img_url.forEach((url) => {
					img_urls.push(config.preUrl.productionUrl + url);
				});
				result.img_url = img_urls;
			}
			if (result.userDetail && result.userDetail.photo) {
				result.userDetail.photo = getPhotoUrl(result.userDetail.photo, result.userDetail.type);
			}
			result.create_time = moment(result.create_time).format('YYYY-MM-DD HH:mm');
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 分页获取所有动态
	getAllProductions: async (req, res) => {
		try {
			const { user_id, current = 1 } = req.query;
			if (!user_id) return res.send(resultMessage.error('系统错误'));
			const offset = Number((current - 1) * pagesize);
			const lists = await productionModal.findAll({
				where: { is_delete: 1 },
				include: [
					{
						model: userModal,
						as: 'userDetail',
						attributes: ['id', 'nickname', 'photo', 'type', 'is_name', 'is_school', 'is_level', 'is_award'],
					},
				],
				order: [
					['goods_num', 'DESC'],
					['create_time', 'DESC'],
				],
				limit: pagesize,
				offset,
			});
			if (!lists || lists.length === 0) return res.send(resultMessage.success([]));
			const result = responseUtil.renderFieldsAll(lists, [
				'id',
				'user_id',
				'type',
				'title',
				'desc',
				'instr_id',
				'img_url',
				'video',
				'userDetail',
				'create_time',
			]);
			result.forEach((item) => {
				item.create_time = moment(item.create_time).format('YYYY-MM-DD HH:mm');
				item.img_url = JSON.parse(item.img_url);
				item.video = JSON.parse(item.video);
				// {"url":"J4BHYM31VLB7Z3Y8-1647622665497.png","height":260,"width":482,"duration":14.664,"size":2143880,"photo":{"url":"KFF5UR6M8M9ETOAB-1647622665543.png","width":482,"height":260}}
				if (item.video && item.video.url) {
					item.video.url = config.preUrl.productionUrl + item.video.url;
					item.video.photo.url = config.preUrl.productionUrl + item.video.photo.url;
					item.showImg = item.video.photo.url;
				}
				if (item.img_url && item.img_url.length !== 0) {
					const img_urls = [];
					item.img_url.forEach((url) => {
						img_urls.push(config.preUrl.productionUrl + url);
					});
					item.img_url = img_urls;
					item.showImg = item.img_url[0];
				}
				if (item.userDetail && item.userDetail.photo) {
					item.userDetail.photo = getPhotoUrl(item.userDetail.photo, item.userDetail.type);
				}
			});
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 分页获取所有动态
	getTeamOneProductions: async (req, res) => {
		try {
			const { user_id } = req.query;
			if (!user_id) return res.send(resultMessage.error('系统错误'));
			const userCommonFields = ['id', 'nickname', 'photo', 'type', 'is_name', 'is_school', 'is_level', 'is_award'];
			// 一个作品
			const production1 = await productionModal.findOne({
				where: { type: 1, user_id, is_delete: 1 },
				include: [
					{
						model: userModal,
						as: 'userDetail',
						attributes: userCommonFields,
					},
				],
				order: [['create_time', 'DESC']],
			});
			// 一个动态
			const production2 = await productionModal.findOne({
				where: { type: 2, user_id, is_delete: 1 },
				include: [
					{
						model: userModal,
						as: 'userDetail',
						attributes: userCommonFields,
					},
				],
				order: [['create_time', 'DESC']],
			});
			const lists = [];
			if (production1) lists.push(production1);
			if (production2) lists.push(production2);
			if (lists.length === 0) return res.send(resultMessage.success([]));
			const result = responseUtil.renderFieldsAll(lists, [
				'id',
				'user_id',
				'type',
				'title',
				'desc',
				'instr_id',
				'img_url',
				'video',
				'userDetail',
				'create_time',
			]);
			result.forEach((item) => {
				item.create_time = moment(item.create_time).format('YYYY-MM-DD HH:mm');
				item.img_url = JSON.parse(item.img_url);
				item.video = JSON.parse(item.video);
				// {"url":"J4BHYM31VLB7Z3Y8-1647622665497.png","height":260,"width":482,"duration":14.664,"size":2143880,"photo":{"url":"KFF5UR6M8M9ETOAB-1647622665543.png","width":482,"height":260}}
				if (item.video && item.video.url) {
					item.video.url = config.preUrl.productionUrl + item.video.url;
					item.video.photo.url = config.preUrl.productionUrl + item.video.photo.url;
					item.showImg = item.video.photo.url;
				}
				if (item.img_url && item.img_url.length !== 0) {
					const img_urls = [];
					item.img_url.forEach((url) => {
						img_urls.push(config.preUrl.productionUrl + url);
					});
					item.img_url = img_urls;
					item.showImg = item.img_url[0];
				}
				if (item.userDetail && item.userDetail.photo) {
					item.userDetail.photo = getPhotoUrl(item.userDetail.photo, item.userDetail.type);
				}
			});
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	// 分页获取所有动态
	getAllProductionsByUserId: async (req, res) => {
		try {
			const { user_id, current = 1 } = req.query;
			if (!user_id) return res.send(resultMessage.error('系统错误'));
			const offset = Number((current - 1) * pagesize);
			const lists = await productionModal.findAll({
				where: { is_delete: 1, user_id },
				include: [
					{
						model: userModal,
						as: 'userDetail',
						attributes: ['id', 'nickname', 'photo', 'type'],
					},
				],
				order: [['create_time', 'DESC']],
				limit: pagesize,
				offset,
			});
			if (!lists || lists.length === 0) return res.send(resultMessage.success([]));
			const result = responseUtil.renderFieldsAll(lists, [
				'id',
				'user_id',
				'title',
				'desc',
				'instr_id',
				'img_url',
				'video',
				'userDetail',
				'create_time',
			]);
			result.forEach((item) => {
				item.create_time = moment(item.create_time).format('YYYY-MM-DD HH:mm');
				item.img_url = JSON.parse(item.img_url);
				item.video = JSON.parse(item.video);
				// {"url":"J4BHYM31VLB7Z3Y8-1647622665497.png","height":260,"width":482,"duration":14.664,"size":2143880,"photo":{"url":"KFF5UR6M8M9ETOAB-1647622665543.png","width":482,"height":260}}
				if (item.video && item.video.url) {
					item.video.url = config.preUrl.productionUrl + item.video.url;
					item.video.photo.url = config.preUrl.productionUrl + item.video.photo.url;
					item.showImg = item.video.photo.url;
				}
				if (item.img_url && item.img_url.length !== 0) {
					const img_urls = [];
					item.img_url.forEach((url) => {
						img_urls.push(config.preUrl.productionUrl + url);
					});
					item.img_url = img_urls;
					item.showImg = item.img_url[0];
				}
				if (item.userDetail && item.userDetail.photo) {
					item.userDetail.photo = getPhotoUrl(item.userDetail.photo, item.userDetail.type);
				}
			});
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},

	deleteItemById: async (req, res) => {
		try {
			const { id } = req.body;
			if (!id) res.send(resultMessage.error());
			await productionModal.update({ is_delete: 2 }, { where: { id } });
			res.send(resultMessage.success('success'));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
