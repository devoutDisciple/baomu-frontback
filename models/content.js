const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('content', {
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "发布人id"
    },
    child_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "关联的id"
    },
    type: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: "1-广场帖子 2-"
    },
    img_url: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "展示图片url"
    },
    goods_num: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "点赞"
    },
    comment_num: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "评论"
    },
    share_num: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "转发"
    },
    hot: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: "热度"
    },
    create_time: {
      type: Sequelize.DATE,
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
    tableName: 'content',
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
