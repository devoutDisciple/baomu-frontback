// const images = require("images");
const fs = require('fs');
const gm = require('gm');

let num = 1;

module.exports = {
	async dealImages(filePath) {
		try {
			const self = this;
			fs.stat(filePath, (err, status) => {
				const size = Number.parseInt(Number(status.size) / 1024, 10);
				if (size <= 120) {
					num = 1;
					return;
				}
				if (size >= 120) {
					num++;
					if (num > 15) {
						num = 1;
						return clearTimeout(global.timer_myself);
					}
					if (num < 5) {
						try {
							gm(filePath).size((error) => {
								if (error) return console.log(error);
								gm(filePath)
									.resize(1350, 1000)
									.noProfile()
									.write(filePath, (werr) => {
										if (werr) return console.log(werr);
										self.dealImages(filePath);
									});
							});
						} catch (error) {
							if (error) return console.log(error);
							fs.exists(filePath, () => {
								fs.unlinkSync(filePath);
							});
						}
					}
					if (num >= 5 && num < 10) {
						try {
							gm(filePath).size((error, value) => {
								if (error) return console.log(error);
								gm(filePath)
									.resize(value.width - 200, value.height - 200)
									.noProfile()
									.write(filePath, (werr) => {
										if (werr) return console.log(werr);
										self.dealImages(filePath);
									});
							});
						} catch (error) {
							console.log(error);
							fs.exists(filePath, () => {
								fs.unlinkSync(filePath);
							});
						}
					}
					if (num >= 10) {
						try {
							gm(filePath).size((error, value) => {
								if (error) return console.log(error);
								gm(filePath)
									.resize(value.width - 500, value.height - 500)
									.noProfile()
									.write(filePath, (werr) => {
										if (werr) return console.log(werr);
										self.dealImages(filePath);
									});
							});
						} catch (error) {
							fs.exists(filePath, () => {
								fs.unlinkSync(filePath);
							});
							console.log(error);
						}
					}
				}
			});
		} catch (error) {
			console.log(error);
		}
	},
};
