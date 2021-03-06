const express = require('express');

const app = express();
const chalk = require('chalk');
const cookieParser = require('cookie-parser');
const sessionParser = require('express-session');
const config = require('./config/config');
const controller = require('./controller/index');
const LogMiddleware = require('./middleware/LogMiddleware');
// require('./schedule');

// 解析cookie和session还有body
app.use(cookieParser()); // 挂载中间件，可以理解为实例化

app.use(
	sessionParser({
		secret: 'ruidoc', // 签名，与上文中cookie设置的签名字符串一致，
		cookie: {
			maxAge: 90000,
		},
		name: 'session_id', // 在浏览器中生成cookie的名称key，默认是connect.sid
		resave: false,
		saveUninitialized: true,
	}),
);

app.use(express.static(config.staticPath));

// parse application/json
app.use(express.json());

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// 自定义日志
app.use(LogMiddleware);

app.all('*', (req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
	res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Credentials', true); // 可以带cookies
	res.header('X-Powered-By', '3.2.1');
	next();
});

// 路由 controller层
controller(app);

app.listen(config.port, () => {
	console.log(chalk.yellow(`env: ${config.env}, server is listenning ${config.port}`));
});
