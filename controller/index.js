const loginController = require('./loginController');

const router = (app) => {
	// 登录相关
	app.use('/login', loginController);
};
module.exports = router;
