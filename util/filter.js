const team_state = [
	{
		state: 1,
		label: '未开始',
	},
	{
		state: 2,
		label: '进行中',
	},
	{
		state: 3,
		label: '组团成功',
	},
	{
		state: 4,
		label: '组团失败',
	},
	{
		state: 5,
		label: '组团失败',
	},
	{
		state: 6,
		label: '组团已退款',
	},
];

const filterTeamState = (state) => {
	if (!state) return '';
	return team_state.filter((item) => Number(item.state) === Number(state))[0].label;
};

module.exports = {
	filterTeamState,
};
