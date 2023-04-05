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
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "TBLUser",
        key: "id",
        validate: {
          notEmpty: true,
        },
      }
    },
    searchText: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlphanumeric: true,
        notEmpty: true,
      },
    },
    searchMode: {
      type: DataTypes.ENUM("genre", "keyword", "author"),
      defaultValue: "keyword",
      allowNull: false,
      validate: {
        isAlpha: true,
        isIn: [["genre", "keyword", "author"]],
        notEmpty: true,
      },
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