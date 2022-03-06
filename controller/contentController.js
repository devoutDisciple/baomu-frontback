const express = require('express');

const router = express.Router();
const contentService = require('../service/contentService');

// 获取推荐列表
router.get('/recomment', (req, res) => {
	contentService.getRecomment(req, res);
});

// 获取信息详情
router.get('/contentDetail', (req, res) => {
	contentService.getContentDetail(req, res);
});

// 获取用户发布过的内容
router.get('/contentsByUserId', (req, res) => {
	contentService.getContentsByUserId(req, res);
});

// 获取用户帖子或者博客
router.get('/contentsByTypeAndUserId', (req, res) => {
	contentService.getContentsByTypeAndUserId(req, res);
});

// 根据圈子id选择不同类型的数据
router.get('/contentsByCircleAndType', (req, res) => {
	contentService.getContentsByCircleAndType(req, res);
});

// 获取用户关注的内容
router.get('/userAttentionContents', (req, res) => {
	contentService.getUserAttentionContents(req, res);
});

module.exports = router;
