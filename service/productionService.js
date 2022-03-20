const moment = require('moment');
const sizeOf = require('image-size');
const sequelize = require('../dataSource/MysqlPoolClass');
const resultMessage = require('../util/resultMessage');
const production = require('../models/production');
const responseUtil = require('../util/responseUtil');
const config = require('../config/config');

const timeformat = 'YYYY-MM-DD HH:mm:ss';

const productionModal = production(sequelize);

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
			if (!data.user_id || !data.title || !data.instr_id || !data.desc || !data.img_url || !data.video) {
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
			const { user_id } = req.query;
			if (!user_id) return res.send(resultMessage.error('系统错误'));
			const lists = await productionModal.findAll({ where: { user_id, is_delete: 1 }, order: [['create_time', 'DESC']] });
			if (!lists || lists.lenght === 0) return res.send(resultMessage.success([]));
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
				if (item.img_url && item.img_url.lenght !== 0) {
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
			const lists = await productionModal.findOne({ where: { id, is_delete: 1 } });
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
			]);
			result.img_url = JSON.parse(result.img_url);
			result.video = JSON.parse(result.video);
			if (result.video && result.video.url) {
				result.video.url = config.preUrl.productionUrl + result.video.url;
				result.video.photo.url = config.preUrl.productionUrl + result.video.photo.url;
			}
			if (result.img_url && result.img_url.lenght !== 0) {
				const img_urls = [];
				result.img_url.forEach((url) => {
					img_urls.push(config.preUrl.productionUrl + url);
				});
				result.img_url = img_urls;
			}
			result.create_time = moment(result.create_time).format('YYYY-MM-DD HH:mm');
			res.send(resultMessage.success(result));
		} catch (error) {
			console.log(error);
			res.send(resultMessage.error());
		}
	},
};
