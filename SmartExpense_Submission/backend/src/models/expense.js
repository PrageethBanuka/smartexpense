function defineExpense(sequelize, DataTypes) {
  const Expense = sequelize.define(
    'Expense',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      occurredOn: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'expenses',
      indexes: [
        { fields: ['userId'] },
        { fields: ['occurredOn'] },
        { fields: ['category'] },
      ],
    }
  );
  return Expense;
}

module.exports = defineExpense;
