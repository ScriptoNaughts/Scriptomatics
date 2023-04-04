const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class TBLRole extends Model {}

TBLRole.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    roleTitle: {
      type: DataTypes.ENUM("writer", "agent"),
      allowNull: false,
    },
  },
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: 'TBLRole',
  }
);

module.exports = TBLRole;