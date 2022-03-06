const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('user', {
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    wx_openid: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "微信标识"
    },
    nickname: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    photo: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "头像"
    },
    phone: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "手机号"
    },
    sex: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: "1-男 2-女"
    },
    age: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "年龄"
    },
    grade: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "评分"
    },
    comment_num: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "评论数量"
    },
    attention_num: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "关注数量"
    },
    fans_num: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "粉丝数量"
    },
    goods_num: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "点赞数量"
    },
    is_name: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 2,
      comment: "是否实名认证 1-是 2-否"
    },
    is_scholl: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 2,
      comment: "是否学校认证 1-是 2-否"
    },
    is_award: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 2,
      comment: "是否获奖认证 1-是 2-否"
    },
    is_level: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 2,
      comment: "是否考级认证 1-是 2-否"
    },
    longitude: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "经度"
    },
    latitude: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "纬度"
    },
    desc: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "个人签名"
    },
    create_time: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "创建时间"
    }
  }, {
    sequelize,
    tableName: 'user',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
