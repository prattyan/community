import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Notification = sequelize.define('Notification', {
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
  type: {
    type: DataTypes.STRING(100),
    allowNull: false, // e.g., 'new_post', 'new_comment', 'event_reminder'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: true, // e.g., 'Post', 'Comment', 'Event'
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: true, // ID of the related entity
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  updatedAt: false, // Notifications usually only have a creation timestamp
});

export default Notification;
