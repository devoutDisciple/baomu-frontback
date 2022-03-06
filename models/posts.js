const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('posts', {
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
    desc: {
      type: Sequelize.STRING(3000),
      allowNull: true,
      comment: "内容"
    },
    img_urls: {
      type: Sequelize.STRING(3000),
      allowNull: true,
      comment: "图片链接"
    }
  }, {
    sequelize,
    tableName: 'posts',
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
