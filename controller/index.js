const loginController = require('./loginController');
const userController = require('./userController');
const wechatController = require('./wechatController');
const instrumentController = require('./instrumentController');

const router = (app) => {
	// 登录相关
	app.use('/login', loginController);
	// 用户相关
	app.use('/user', userController);
	// 微信功能
	app.use('/wechat', wechatController);
	// 乐器相关
	app.use('/instrument', instrumentController);
};
module.exports = router;
