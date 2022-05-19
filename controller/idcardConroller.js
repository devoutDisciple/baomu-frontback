const express = require('express');
const multer = require('multer');
const config = require('../config/config');
const ObjectUtil = require('../util/ObjectUtil');

const router = express.Router();
const idcardService = require('../service/idcardService');

let filename = '';
// 使用硬盘存储模式设置存放接收到的文件的路径以及文件名
const storage = multer.diskStorage({
	destination(req, file, cb) {
		// 接收到文件后输出的保存路径（若不存在则需要创建）
		cb(null, config.idcardPath);
	},
	filename(req, file, cb) {
		// 将保存文件名设置为 随机字符串 + 时间戳名，比如 JFSDJF323423-1342342323.png
		filename = `${ObjectUtil.getName()}-${Date.now()}.jpg`;
		cb(null, filename);
	},
});
const upload = multer({ dest: config.idcardPath, storage });

// 上传图片
router.post('/upload', upload.single('file'), (req, res) => {
	idcardService.uploadFile(req, res, filename, config.idcardPath);
});

// 增加记录
router.post('/add', (req, res) => {
	idcardService.add(req, res);
});

// 查看所有记录
router.get('/all', (req, res) => {
	idcardService.getAll(req, res);
});

// 删除
router.post('/deleteItemById', (req, res) => {
	idcardService.deleteItemById(req, res);
});

module.exports = router;
