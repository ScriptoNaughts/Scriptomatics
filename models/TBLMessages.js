const { Model, DataTypes, NOW } = require('sequelize');
const sequelize = require('../config/connection');

class TBLMessages extends Model {}

TBLMessages.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    senderID: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: true,
      },
      references: {
        model: "TBLUser",
        key: "id",
      }
    },
    receiverID: {
        type: DataTypes.INTEGER,
        validate: {
          notEmpty: true,
        },
        references: {
          model: "TBLUser",
          key: "id",
        },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    timeStamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: NOW,
      validate: {
        isDate: true,
        notEmpty: true,
      },
    },
  },
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: 'TBLMessages',
  }
);

module.exports = TBLMessages;