module.exports = {
	getRandomStr: (num) => {
		num = num || 32;
		let str = '';
		// eslint-disable-next-line prettier/prettier
		const arr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
		for (let i = 1; i <= num; i++) {
			const random = Math.floor(Math.random() * arr.length);
			str += arr[random];
		}
		return str;
	},
	copy: (obj) => {
		const newObj = {};
		Object.keys(obj).forEach((item) => {
			newObj[item] = obj[item];
		});
		return newObj;
	},
	getName() {
		let str = '';
		// eslint-disable-next-line prettier/prettier
		const arr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
		for (let i = 1; i <= 16; i++) {
			const random = Math.floor(Math.random() * arr.length);
			str += arr[random];
		}
		return str;
	},
	isEmpty(obj) {
		return Object.keys(obj).length === 0;
	},
	deleteEmptyObject(obj) {
		Object.keys(obj).forEach((key) => {
			if (obj[key] === null || obj[key] === undefined) {
				delete obj[key];
			}
		});
		return obj;
	},
};
