const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('demand', {
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: "需求名称"
    },
    instrument: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "乐器"
    },
    create_time: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "创建时间"
    }
  }, {
    sequelize,
    tableName: 'demand',
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
