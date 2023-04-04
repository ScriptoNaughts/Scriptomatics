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
      unique: true,
      validate: {
        isInt: true,
        notNull: true,
        notEmpty: true,
      },
    },
    roleTitle: {
      type: DataTypes.ENUM("writer", "agent"),
      allowNull: false,
      validate: {
        isAlpha: true,
        isIn: [["writer", "agent"]],
        notNull: true,
        notEmpty: true,
      },
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