const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('vote_record', {
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    content_id: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    select_items: {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: "[]",
      comment: "选择的第几项"
    },
    create_time: {
      type: Sequelize.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'vote_record',
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
