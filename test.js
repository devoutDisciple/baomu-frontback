const fs = require('fs');
const WxPay = require('wechatpay-node-v3');
const path = require('path');
const config = require('./config/config');

// 使用框架
const pay = new WxPay({
	appid: config.wx_appid,
	mchid: config.wechat_mchid,
	publicKey: fs.readFileSync(path.join(__dirname, './wechatPayCert/apiclient_cert.pem')), // 公钥
	privateKey: fs.readFileSync(path.join(__dirname, './wechatPayCert/apiclient_key.pem')), // 秘钥
});

const test = async () => {
	const params = {
		transaction_id: '4200001483202205051080635468',
		out_refund_no: 'K92CFBQT62MY1651756541438',
		notify_url: 'https://www.baomust.com/baomuyanyi/pay/handleWechatRefunds',
		reason: '退款',
		amount: { refund: 20, total: 20, currency: 'CNY' },
	};
	const result = await pay.refunds(params);
	console.log('退款结果是：', JSON.stringify(result));
};

test();
