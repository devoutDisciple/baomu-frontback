const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('vote', {
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "标题"
    },
    type: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "1-单选 2-多选"
    },
    content: {
      type: Sequelize.STRING(800),
      allowNull: false,
      comment: "选项 [{desc: \"选项1\", num: 1}]"
    },
    total: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "总票数"
    }
  }, {
    sequelize,
    tableName: 'vote',
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
