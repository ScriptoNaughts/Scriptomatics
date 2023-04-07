const TBLMessages = require("./TBLMessages");
const TBLRole = require("./TBLRole");
const TBLScript = require("./TBLScript");
const TBLSearchHistory = require("./TBLSearchHistory");
const TBLUser = require("./TBLUser");

TBLUser.belongsTo(TBLRole, {
  foreignKey: "roleID",
  onDelete: "SET NULL",
});

TBLScript.belongsTo(TBLUser, {
  foreignKey: "writerID",
  as: "Writer",
  onDelete: "SET NULL",
});

TBLScript.belongsTo(TBLUser, {
  foreignKey: "assignedTo",
  as: "Assignee",
  onDelete: "SET NULL",
});

TBLMessages.belongsTo(TBLUser, {
  foreignKey: "receiverID",
  as: "receiver",
  onDelete: "SET NULL",
});

TBLMessages.belongsTo(TBLUser, {
  foreignKey: "senderID",
  as: "sender",
  onDelete: "SET NULL",
});

TBLRole.hasMany(TBLUser, {
  foreignKey: "roleID",
});

TBLUser.hasMany(TBLScript, {
  foreignKey: "writerID",
  as: "WriterScripts",
});

TBLUser.hasMany(TBLScript, {
  foreignKey: "assignedTo",
  as: "AssignedScripts",
});

TBLUser.hasMany(TBLMessages, {
  foreignKey: "receiverID",
});

TBLUser.hasMany(TBLMessages, {
  foreignKey: "senderID",
});

module.exports = { TBLMessages, TBLRole, TBLScript, TBLSearchHistory, TBLUser };
