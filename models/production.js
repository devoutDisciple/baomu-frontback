const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('production', {
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "作品标题"
    },
    instr_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "乐器id"
    },
    desc: {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: "作品描述"
    },
    img_url: {
      type: Sequelize.STRING(1000),
      allowNull: true,
      defaultValue: "[]",
      comment: "图片列表"
    },
    video: {
      type: Sequelize.STRING(1000),
      allowNull: true,
      defaultValue: "{}",
      comment: "视频详情"
    },
    create_time: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    is_delete: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: "1-存在 2-删除"
    }
  }, {
    sequelize,
    tableName: 'production',
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
