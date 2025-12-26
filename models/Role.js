import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  permissions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  }, // e.g., { can_post: true, can_moderate: false }
  communityId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'communities',
      key: 'id',
    },
  },
}, {
  tableName: 'roles',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['name', 'communityId'] } // Role name must be unique within a community
  ]
});

export default Role;
