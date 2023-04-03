const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class TBLMessages extends Model {}

TBLMessages.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    senderID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "TBLUser",
        key: "id",
      }
    },
    receiverID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timeStamp: {
      type: DataTypes.DATE,
      allowNull: false,
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