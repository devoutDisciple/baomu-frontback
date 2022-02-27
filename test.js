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

const body = {
	id: 'ec7254e9-b4df-599d-9293-8d10328f35e4',
	create_time: '2022-01-13T21:45:25+08:00',
	resource_type: 'encrypt-resource',
	event_type: 'REFUND.SUCCESS',
	summary: '退款成功',
	resource: {
		original_type: 'refund',
		algorithm: 'AEAD_AES_256_GCM',
		ciphertext:
			'e8aw0+bPZi7v1I51c8GZbXoB/M+xafDwU966a5cPCJLETK0SB5zufvTKRuEjQ66h1suWzX3M0FDS9XZ0uSiiSK9jqbWHiH8mlpzLqu/tHHs94c4Fb6WxJ9HAb4rhEuYpXpKpJKR2GnVtBwhPs8C5ICNasCuxXfBnvk2fR2KR/R9m/Kl6dDaHLtfLlsLm31xb5CXK9qryoFzT7lmreKBOesczEqcqbh++CPA5aIrNB44sQQwc0NHMupesBLdh8LS52d7bAZp636kP2CPw9/ePjso4hrMuSQ28rqKvd6oc4ZkeJa6EcXn8nZASMeKhb85olqz3g1MAeMWlu0zmhRJ9sXmJbfT3OR0COzFoykL2isQVmApG2AtNhQ4Q89pIEyaqhziPie3GbHaJBOTwUP9Pa+u1IqHfT1b1l3wxowgT1yK3TkKWvBUhEJjAByAqwCCvtE2i+MXhQ4ZWi3B8rGhlmc7fpAIDopCOBIetNu7J6b+W3Fod6yjSdSauHJhxUlRe1G2f+Q==',
		associated_data: 'refund',
		nonce: '8jYNLS2ynxAx',
	},
};

const result = pay.decipher_gcm(body.resource.ciphertext, body.resource.associated_data, body.resource.nonce, config.wx_apiv3_secret);

console.log(result, 111);
