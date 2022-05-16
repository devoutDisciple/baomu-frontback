const Core = require('@alicloud/pop-core');
const config = require('../config/config');

const requestOption = {
	method: 'POST',
};

const client = new Core({
	accessKeyId: config.message_accessKeyId,
	accessKeySecret: config.message_accessKeySecret,
	endpoint: config.message_endpoint,
	apiVersion: config.message_apiVersion,
});

const RegionId = 'cn-hangzhou';

module.exports = {
	// 发送议价信息给演员或者商家
	sernd_message_for_sign_process: (phoneNum) => {
		if (config.send_message_flag === 2) return;
		const params = {
			RegionId,
			PhoneNumbers: phoneNum,
			SignName: config.notify_message_sign,
			TemplateCode: config.MESSAGE_FOR_SIGN_PROCESS,
		};
		return new Promise((resolve, reject) => {
			client.request('SendSms', params, requestOption).then(
				(result) => {
					console.log(JSON.stringify(result));
					resolve({ phoneNum });
				},
				(ex) => {
					reject('发送失败');
					console.log(ex);
				},
			);
		});
	},

	// 发送议价同意信息给演员或者商家
	sernd_message_for_sign_success: (phoneNum, name) => {
		if (config.send_message_flag === 2) return;
		const params = {
			RegionId,
			PhoneNumbers: phoneNum,
			SignName: config.MESSAGE_FOR_SIGN_SUCCESS,
			TemplateCode: config.message_refundsCode,
		};
		return new Promise((resolve, reject) => {
			client.request('SendSms', params, requestOption).then(
				(result) => {
					console.log(JSON.stringify(result));
					resolve({ phoneNum, name });
				},
				(ex) => {
					reject('发送失败');
					console.log(ex);
				},
			);
		});
	},

	// 发送议价拒绝信息给演员或者商家
	sernd_message_for_sign_refuse: (phoneNum, name) => {
		if (config.send_message_flag === 2) return;
		const params = {
			RegionId,
			PhoneNumbers: phoneNum,
			SignName: config.MESSAGE_FOR_SIGN_REFUSE,
			TemplateCode: config.message_teamSuccessCode,
		};
		return new Promise((resolve, reject) => {
			client.request('SendSms', params, requestOption).then(
				(result) => {
					console.log(JSON.stringify(result));
					resolve({ phoneNum, name });
				},
				(ex) => {
					reject('发送失败');
					console.log(ex);
				},
			);
		});
	},

	// 商家-发送短信给商家付款完成
	sernd_message_for_shoper_pay_success: (phoneNum) => {
		if (config.send_message_flag === 2) return;
		const params = {
			RegionId,
			PhoneNumbers: phoneNum,
			SignName: config.notify_message_sign,
			TemplateCode: config.message_signupSuccessCode,
		};
		return new Promise((resolve, reject) => {
			client.request('SendSms', params, requestOption).then(
				(result) => {
					console.log(JSON.stringify(result));
					resolve({ phoneNum });
				},
				(ex) => {
					reject('发送失败');
					console.log(ex);
				},
			);
		});
	},

	// 演员-发送短信给演员付款完成
	sernd_message_for_user_pay_success: (phoneNum) => {
		if (config.send_message_flag === 2) return;
		const params = {
			RegionId,
			PhoneNumbers: phoneNum,
			SignName: config.MESSAGE_FOR_USER_PAY_SUCCESS,
			TemplateCode: config.message_signupSuccessCode,
		};
		return new Promise((resolve, reject) => {
			client.request('SendSms', params, requestOption).then(
				(result) => {
					console.log(JSON.stringify(result));
					resolve({ phoneNum });
				},
				(ex) => {
					reject('发送失败');
					console.log(ex);
				},
			);
		});
	},

	// 随机的验证码
	getMessageCode: () => {
		const numArr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
		let str = '';
		for (let i = 0; i < 6; i++) {
			const random = Math.floor(Math.random() * numArr.length);
			str += numArr[random];
		}
		return str;
	},
};
