const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");
const bcrypt = require("bcrypt");

class TBLUser extends Model {
  /**
   * Compare the user-provided password to the stored encrypted password
   * @param {string} userPassword - The password entered by the user
   * @returns {boolean} - Returns true if the user-provided password matches the stored encrypted password and false otherwise
   */
  async checkPassword(userPassword) {
    const validPassword = await bcrypt.compare(userPassword, this.password);

    if (!validPassword) {
      return false;
    }

    return true;
  }
}

TBLUser.init(
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
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlpha: true,
        notNull: true,
        notEmpty: true,
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlpha: true,
        notNull: true,
        notEmpty: true,
      },
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate:{
        notNull: true,
        notEmpty: true,
      },
      references: {
        model: "TBLRole",
        key: "id",
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
        len: [8],
      },
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notNull: true,
        notEmpty: true,
      },
    },
  },
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: "TBLUser",
  }
);

module.exports = TBLUser;
