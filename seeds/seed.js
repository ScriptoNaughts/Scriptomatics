const sequelize = require("../config/connection");
const { TBLRole } = require("../models");
const { TBLScript } = require("../models");

// const userData = require('./userData.json');
const roleData = require("./roleSeedData.json");

const scriptData = require("./scriptSeedData.json");

const seedDatabase = async () => {
  await sequelize.sync({ force: true });

  await TBLRole.bulkCreate(roleData, {
    individualHooks: true,
    returning: true,
  });

  await TBLScript.bulkCreate(scriptData, {
    individualHooks: true,
    returning: true,
  });

  // await User.bulkCreate(userData, {
  //   individualHooks: true,
  //   returning: true,
  // });

  process.exit(0);
};

seedDatabase();
