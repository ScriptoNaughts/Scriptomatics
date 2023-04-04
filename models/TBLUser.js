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
      },
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
    modelName: "TBLUser",
  }
);

module.exports = TBLUser;
