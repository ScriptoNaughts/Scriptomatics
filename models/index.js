const TBLMessages = require('./TBLMessages');
const TBLRole = require('./TBLRole');
const TBLScript = require('./TBLScript');
const TBLSearchHistory = require('./TBLSearchHistory');
const TBLUser = require('./TBLUser');

TBLRole.hasMany(TBLUser, {
  foreignKey: 'roleID',
  onDelete: "SET NULL",
});

TBLUser.hasMany(TBLScript, {
  foreignKey: 'authorID',
  onDelete: "SET NULL",
});

TBLUser.hasMany(TBLScript, {
    foreignKey: 'assignedTo',
    onDelete: "SET NULL",
});

TBLUser.hasMany(TBLMessages, {
    foreignKey: 'receiverID',
    onDelete: "SET NULL",
});

TBLUser.hasMany(TBLMessages, {
    foreignKey: 'senderID',
    onDelete: "SET NULL",
});

module.exports = { TBLMessages, TBLRole, TBLScript, TBLSearchHistory, TBLUser};