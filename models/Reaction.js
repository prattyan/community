import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Reaction = sequelize.define('Reaction', {
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
  entityType: {
    type: DataTypes.ENUM('Post', 'Comment'),
    allowNull: false,
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  reactionType: {
    type: DataTypes.STRING(50),
    allowNull: false, // e.g., 'like', 'heart', 'upvote'
  },
}, {
  tableName: 'reactions',
  timestamps: true,
  updatedAt: false, // Reactions usually don't have an 'updatedAt'
  indexes: [
    { unique: true, fields: ['userId', 'entityType', 'entityId'] } // A user can only have one reaction per entity
  ]
});

export default Reaction;
