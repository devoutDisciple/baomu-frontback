const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const chalk = require('chalk');
const cookieParser = require('cookie-parser');
const sessionParser = require('express-session');
const config = require('./config/config');
const controller = require('./controller/index');
const ChangeLog = require('./middleware/ChangeLog');
const LogMiddleware = require('./middleware/LogMiddleware');
require('./schedule');

// 开启ssl证书
const privateKey = fs.readFileSync(path.join(__dirname, './ssl/7158614_chiangky.com.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, './ssl/7158614_chiangky.com.pem'), 'utf8');

const credentials = {
	// pfx: pfx, ,
	key: privateKey,
	cert: certificate,
};

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

// 改变默认的log
ChangeLog.changeLog();

// 改变默认的info
ChangeLog.changeInfo();

// 改变默认的error
ChangeLog.changeError();

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

const httpsServer = https.createServer(credentials, app);

if (config.env !== 'dev') {
	// 启动服务器，监听对应的端口
	httpsServer.listen(443, () => {
		console.log(chalk.yellow(`env: ${config.env}, server is listenning 443`));
	});
} else {
	// 监听8888端口
	app.listen(config.port, () => {
		console.log(chalk.yellow(`env: ${config.env}, server is listenning ${config.port}`));
	});
}
