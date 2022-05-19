const express = require('express');
const multer = require('multer');
const config = require('../config/config');
const ObjectUtil = require('../util/ObjectUtil');

const router = express.Router();
const awardService = require('../service/awardService');

let filename = '';
// 使用硬盘存储模式设置存放接收到的文件的路径以及文件名
const storage = multer.diskStorage({
	destination(req, file, cb) {
		// 接收到文件后输出的保存路径（若不存在则需要创建）
		cb(null, config.awardPath);
	},
	filename(req, file, cb) {
		// 将保存文件名设置为 随机字符串 + 时间戳名，比如 JFSDJF323423-1342342323.png
		filename = `${ObjectUtil.getName()}-${Date.now()}.jpg`;
		cb(null, filename);
	},
});
const upload = multer({ dest: config.awardPath, storage });

// 上传图片
router.post('/upload', upload.single('file'), (req, res) => {
	awardService.uploadFile(req, res, filename, config.awardPath);
});

// 添加认证
router.post('/add', (req, res) => {
	awardService.add(req, res);
});

// 获取用户认证信息
router.get('/all', (req, res) => {
	awardService.getAll(req, res);
});

// 删除
router.post('/deleteItemById', (req, res) => {
	awardService.deleteItemById(req, res);
});

module.exports = router;
