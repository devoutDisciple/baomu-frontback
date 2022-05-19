const express = require('express');
const multer = require('multer');
const config = require('../config/config');
const ObjectUtil = require('../util/ObjectUtil');

const router = express.Router();
const levelService = require('../service/levelService');

let filename = '';
// 使用硬盘存储模式设置存放接收到的文件的路径以及文件名
const storage = multer.diskStorage({
	destination(req, file, cb) {
		// 接收到文件后输出的保存路径（若不存在则需要创建）
		cb(null, config.levelPath);
	},
	filename(req, file, cb) {
		// 将保存文件名设置为 随机字符串 + 时间戳名，比如 JFSDJF323423-1342342323.png
		filename = `${ObjectUtil.getName()}-${Date.now()}.jpg`;
		cb(null, filename);
	},
});
const upload = multer({ dest: config.levelPath, storage });

// 添加技能
router.post('/upload', upload.single('file'), (req, res) => {
	levelService.uploadFile(req, res, filename, config.levelPath);
});

// 获取所有
router.get('/all', (req, res) => {
	levelService.getAll(req, res);
});

// 删除
router.post('/deleteItemById', (req, res) => {
	levelService.deleteItemById(req, res);
});

module.exports = router;
