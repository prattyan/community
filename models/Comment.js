import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id',
    },
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true, // For nested comments (replies to other comments)
    references: {
      model: 'comments', // Self-referencing
      key: 'id',
    },
  },
}, {
  tableName: 'comments',
  timestamps: true,
});

export default Comment;
