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
        notEmpty: true,
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlpha: true,
        notEmpty: true,
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlpha: true,
        notEmpty: true,
      },
    },
    roleID: {
      type: DataTypes.INTEGER,
      validate: {
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
        notEmpty: true,
      },
    },
  },
  {
    hooks: {
      beforeCreate: async (newUserData) => {
        newUserData.password = await bcrypt.hash(newUserData.password, 10);
        newUserData.firstName = newUserData.firstName.toLowerCase();
        newUserData.lastName = newUserData.lastName.toLowerCase();
        return newUserData;
      },
      beforeUpdate: async (updatedUserData) => {
        updatedUserData.firstName = updatedUserData.firstName.toLowerCase();
        updatedUserData.lastName = updatedUserData.lastName.toLowerCase();
        if (updatedUserData.password) {
          updatedUserData.password = await bcrypt.hash(
            updatedUserData.password,
            10
          );
        }
        return updatedUserData;
      },
    },
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: "TBLUser",
  }
);

module.exports = TBLUser;
