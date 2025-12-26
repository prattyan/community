import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Membership = sequelize.define('Membership', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  communityId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'communities',
      key: 'id',
    },
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id',
    },
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'banned'),
    allowNull: false,
    defaultValue: 'active',
  },
}, {
  tableName: 'memberships',
  timestamps: false, // joinedAt handles creation timestamp
  indexes: [
    { unique: true, fields: ['userId', 'communityId'] } // A user can only have one membership per community
  ]
});

export default Membership;
