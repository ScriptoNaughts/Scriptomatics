const sequelize = require("../config/connection");
const { TBLRole , TBLScript , TBLUser } = require("../models");

const userData = require('./userData.json');
const roleData = require("./roleSeedData.json");
const scriptData = require("./scriptSeedData.json");

const seedDatabase = async () => {
  await sequelize.sync({ force: true });

  await TBLRole.bulkCreate(roleData, {
    individualHooks: true,
    returning: true,
    order: [["id", "ASC"]],
  });

  await TBLUser.bulkCreate(userData, {
    individualHooks: true,
    returning: true,
    order: [["id", "ASC"]],
  });

  await TBLScript.bulkCreate(scriptData, {
    individualHooks: true,
    returning: true,
  });

  process.exit(0);
};

seedDatabase();
