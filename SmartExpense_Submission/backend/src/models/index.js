const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = require('./user')(sequelize, DataTypes);
const Expense = require('./expense')(sequelize, DataTypes);

// Associations
Expense.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Expense, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Expense,
};
