const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class TBLSearchHistory extends Model {}

TBLSearchHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "TBLUser",
        key: "id",
      }
    },
    searchText: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    searchMode: {
        type: DataTypes.ENUM("genre", "keyword", "author"),
        defaultValue: "keyword",
        allowNull: false,
    },
  },
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: 'TBLSearchHistory',
  }
);

module.exports = TBLSearchHistory;