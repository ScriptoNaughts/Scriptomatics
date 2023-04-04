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
        isInt: true,
        notNull: true,
        notEmpty: true,
      },
    },
    senderID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        notNull: true,
        notEmpty: true,
      },
      references: {
        model: "TBLUser",
        key: "id",
      }
    },
    receiverID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          notNull: true,
          notEmpty: true,
        },
        references: {
          model: "TBLUser",
          key: "id",
        },
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
      },
    },
    timeStamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: NOW,
      validate: {
        isDate: true,
        notNull: true,
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