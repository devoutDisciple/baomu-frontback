const moment = require('moment');

module.exports = {
	// 返回 [{}, {}]
	renderFieldsAll: (data, fieldsArr = []) => {
		const result = [];
		if (!Array.isArray(data) || data.length === 0) return result;
		data.forEach((item) => {
			const obj = {};
			fieldsArr.forEach((key) => {
				obj[key] = item[key];
				if (key === 'start_time' || key === 'end_time' || key === 'update_time' || key === 'create_time') {
					obj[key] = moment(item[key]).format('YYYY-MM-DD HH:mm:ss');
				}
			});
			result.push(obj);
		});
		return result;
	},

	// 返回 {}
	renderFieldsObj: (data, fieldsArr = []) => {
		const result = {};
		if (!data || Object.keys(data) === 0) return result;
		fieldsArr.forEach((key) => {
			result[key] = data[key];
			if (key === 'start_time' || key === 'end_time' || key === 'update_time' || key === 'create_time') {
				result[key] = moment(result[key]).format('YYYY-MM-DD HH:mm:ss');
			}
		});
		return result;
	},
};
