const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('notice', {
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    circle_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: "圈子id"
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "标题"
    },
    desc: {
      type: Sequelize.STRING(8000),
      allowNull: true,
      comment: "内容"
    },
    type: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: "1-公告 2-置顶"
    },
    create_time: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "创建时间"
    },
    is_delete: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: "1-存在 2-删除"
    }
  }, {
    sequelize,
    tableName: 'notice',
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
