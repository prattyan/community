import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Community = sequelize.define('Community', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users', // Use string for models not yet defined at this point if they are defined later
      key: 'id',
    },
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private', 'secret'),
    allowNull: false,
    defaultValue: 'public',
  },
}, {
  tableName: 'communities',
  timestamps: true,
});

export default Community;
