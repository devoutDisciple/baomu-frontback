const moment = require('moment');
const config = require('../config/config');
const userUtil = require('./userUtil');
const sequelize = require('../dataSource/MysqlPoolClass');
const responseUtil = require('./responseUtil');
const commentRecord = require('../models/comment_record');
const user = require('../models/user');
const goodsRecord = require('../models/goods_record');

const userModal = user(sequelize);
const goodsRecordModal = goodsRecord(sequelize);
const commentRecordModal = commentRecord(sequelize);
commentRecordModal.belongsTo(userModal, { foreignKey: 'user_id', targetKey: 'id', as: 'userDetail' });

const timeformat = 'YYYY-MM-DD HH:mm';

const handleComment = async (comments, user_id, goodsType) => {
	if (!Array.isArray(comments)) return {};
	let len = comments.length;
	while (len > 0) {
		len -= 1;
		const item = comments[len];
		item.create_time = moment(item.create_time).format(timeformat);
		item.username = item.userDetail ? item.userDetail.nickname : '';
		item.userId = item.userDetail ? item.userDetail.id : '';
		item.userPhoto = item.userDetail ? userUtil.getPhotoUrl(item.userDetail.photo) : '';
		let imgUrls = [];
		if (item.img_urls) {
			imgUrls = JSON.parse(item.img_urls);
			if (imgUrls && imgUrls.length !== 0) {
				imgUrls.forEach((temp) => {
					temp.url = config.preUrl.commentUrl + temp.url;
				});
			}
		}
		item.img_urls = imgUrls;
		// 查询是否点过赞
		if (item && item.id && user_id) {
			const goodsDetail = await goodsRecordModal.findOne({ where: { user_id, comment_id: item.id, type: goodsType } });
			if (goodsDetail) {
				item.hadGoods = true;
			}
		}
	}
	const result = responseUtil.renderFieldsAll(comments, [
		'id',
		'desc',
		'type',
		'goods_num',
		'share_num',
		'comment_num',
		'content_id',
		'comment_id',
		'img_urls',
		'create_time',
		'userId',
		'username',
		'userPhoto',
		'userSchool',
		'hadGoods',
	]);
	if (Array.isArray(result)) {
		result.forEach((item) => {
			item.create_time = moment(item.create_time).format(timeformat);
		});
	}
	return result;
};

module.exports = {
	handleComment,
};
