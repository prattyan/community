import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const EventAttendee = sequelize.define('EventAttendee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'events',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('going', 'interested', 'not_going'),
    allowNull: false,
    defaultValue: 'going',
  },
  registeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'event_attendees',
  timestamps: false, // registeredAt handles creation timestamp
  indexes: [
    { unique: true, fields: ['eventId', 'userId'] } // A user can only register once per event
  ]
});

export default EventAttendee;
