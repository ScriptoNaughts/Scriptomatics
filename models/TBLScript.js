const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class TBLScript extends Model {}

TBLScript.init(
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
    authorID: {
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
      },
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
      },
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "purchased"),
      allowNull: false,
      defaultValue: "draft",
      validate: {
        isAlpha: true,
        isIn: [["draft", "published", "purchased"]],
        notNull: true,
        notEmpty: true,
      },
    },
    assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate:{
          isInt: true,
          notNull: true,
          notEmpty: true,
        },
        references: {
            model: "TBLUser",
            key: "id",
        }
    },
  },
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: 'TBLScript',
  }
);

module.exports = TBLScript;