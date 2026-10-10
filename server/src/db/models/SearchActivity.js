import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import User from './User.js';

const SearchActivity = sequelize.define('SearchActivity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  query: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  engine: {
    type: DataTypes.STRING,
    defaultValue: 'Google',
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    field: 'ip_address',
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.TEXT,
    field: 'user_agent',
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
}, {
  tableName: 'search_activities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['domain'],
    },
    {
      fields: ['timestamp'],
    },
  ],
});

// Associations
User.hasMany(SearchActivity, { foreignKey: 'userId', as: 'searchActivities' });
SearchActivity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default SearchActivity;
