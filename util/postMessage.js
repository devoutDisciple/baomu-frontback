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
	// 发送参与组团
	postJoinTeamMsg: (phoneNum, name) => {
		if (config.send_message_flag === 2) return;
		const params = {
			RegionId,
			PhoneNumbers: phoneNum,
			SignName: config.notify_message_sign,
			TemplateCode: config.message_joinTeamCode,
			TemplateParam: JSON.stringify({ name }),
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

	// 退款通知
	postRefundsMsg: (phoneNum, name) => {
		if (config.send_message_flag === 2) return;
		const params = {
			RegionId,
			PhoneNumbers: phoneNum,
			SignName: config.notify_message_sign,
			TemplateCode: config.message_refundsCode,
			TemplateParam: JSON.stringify({ name }),
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

	// 发送拼团成功
	postTeamSuccessMsg: (phoneNum, name) => {
		if (config.send_message_flag === 2) return;
		const params = {
			RegionId,
			PhoneNumbers: phoneNum,
			SignName: config.notify_message_sign,
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

	// 报名成功
	postSignupSuccessMsg: (phoneNum, name) => {
		if (config.send_message_flag === 2) return;
		const params = {
			RegionId,
			PhoneNumbers: phoneNum,
			SignName: config.notify_message_sign,
			TemplateCode: config.message_signupSuccessCode,
			TemplateParam: JSON.stringify({ name }),
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
