const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class TBLUser extends Model {}

TBLUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    roleID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "TBLRole",
        key: "id",
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emailAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
  },
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: 'TBLUser',
  }
);

module.exports = TBLUser;