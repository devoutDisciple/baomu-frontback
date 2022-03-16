const express = require('express');

const router = express.Router();
const userService = require('../service/userService');

// 更新用户基本信息
router.post('/updateInfo', (req, res) => {
	userService.updateInfo(req, res);
});

// 更新用户地理位置
router.post('/updateLocation', (req, res) => {
	userService.updateLocation(req, res);
});

// 根据距离远近获取首页演员
router.get('/userByLocation', (req, res) => {
	userService.getUserByLocation(req, res);
});

// 获取个人信息详情
router.get('/userDetail', (req, res) => {
	userService.getUserDetail(req, res);
});

module.exports = router;
