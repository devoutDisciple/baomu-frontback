const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('price_record', {
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "演员id"
    },
    demand_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "需求id"
    },
    price: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "报价id"
    },
    type: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "1-演员报价 2-需求方报价"
    },
    state: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "1-竞标结束 2-竞标进行中被拒绝 3-竞标进行中待商议"
    },
    operation: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: "第几次谈价"
    },
    create_time: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "创建时间"
    }
  }, {
    sequelize,
    tableName: 'price_record',
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
