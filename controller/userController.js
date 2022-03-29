const express = require('express');

const router = express.Router();
const multer = require('multer');
const config = require('../config/config');
const ObjectUtil = require('../util/ObjectUtil');
const userService = require('../service/userService');

let filename = '';
// 使用硬盘存储模式设置存放接收到的文件的路径以及文件名
const storage = multer.diskStorage({
	destination(req, file, cb) {
		// 接收到文件后输出的保存路径（若不存在则需要创建）
		cb(null, config.photoPath);
	},
	filename(req, file, cb) {
		// 将保存文件名设置为 随机字符串 + 时间戳名，比如 JFSDJF323423-1342342323.png
		filename = `${ObjectUtil.getName()}-${Date.now()}.png`;
		cb(null, filename);
	},
});
const upload = multer({ dest: config.photoPath, storage });

// 更新用户头像
router.post('/upload', upload.single('file'), (req, res) => {
	userService.uploadFile(req, res, filename);
});

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

// 获取个人作品
router.get('/productionList', (req, res) => {
	userService.getProductionList(req, res);
});

module.exports = router;
