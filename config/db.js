import { Sequelize, DataTypes } from 'sequelize';
import 'dotenv/config';

// Database configuration
const dbUri = process.env.SQL_URI || 'postgresql://user:password@localhost:5432/community_db';

const sequelize = new Sequelize(dbUri, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// Import models
import User from '../models/User.js';
import Community from '../models/Community.js';
import Role from '../models/Role.js';
import Membership from '../models/Membership.js';
import Channel from '../models/Channel.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Reaction from '../models/Reaction.js';
import Event from '../models/Event.js';
import EventAttendee from '../models/EventAttendee.js';
import DirectMessage from '../models/DirectMessage.js';
import Notification from '../models/Notification.js';

// Define Associations
const defineAssociations = () => {
  // User Associations
  User.hasMany(Community, { foreignKey: 'creatorId', as: 'CreatedCommunities' });
  User.hasMany(Membership, { foreignKey: 'userId', as: 'Memberships' });
  User.hasMany(Channel, { foreignKey: 'creatorId', as: 'CreatedChannels' });
  User.hasMany(Post, { foreignKey: 'userId', as: 'Posts' });
  User.hasMany(Comment, { foreignKey: 'userId', as: 'Comments' });
  User.hasMany(Reaction, { foreignKey: 'userId', as: 'Reactions' });
  User.hasMany(Event, { foreignKey: 'creatorId', as: 'CreatedEvents' });
  User.hasMany(EventAttendee, { foreignKey: 'userId', as: 'EventAttendances' });
  User.hasMany(DirectMessage, { foreignKey: 'senderId', as: 'SentMessages' });
  User.hasMany(DirectMessage, { foreignKey: 'receiverId', as: 'ReceivedMessages' });
  User.hasMany(Notification, { foreignKey: 'userId', as: 'Notifications' });

  // Community Associations
  Community.belongsTo(User, { foreignKey: 'creatorId', as: 'Creator' });
  Community.hasMany(Channel, { foreignKey: 'communityId', as: 'Channels' });
  Community.hasMany(Membership, { foreignKey: 'communityId', as: 'Memberships' });
  Community.hasMany(Post, { foreignKey: 'communityId', as: 'Posts' });
  Community.hasMany(Role, { foreignKey: 'communityId', as: 'Roles' });
  Community.hasMany(Event, { foreignKey: 'communityId', as: 'Events' });

  // Role Associations
  Role.belongsTo(Community, { foreignKey: 'communityId', as: 'Community' });
  Role.hasMany(Membership, { foreignKey: 'roleId', as: 'Memberships' });

  // Membership Associations
  Membership.belongsTo(User, { foreignKey: 'userId', as: 'User' });
  Membership.belongsTo(Community, { foreignKey: 'communityId', as: 'Community' });
  Membership.belongsTo(Role, { foreignKey: 'roleId', as: 'Role' });

  // Channel Associations
  Channel.belongsTo(Community, { foreignKey: 'communityId', as: 'Community' });
  Channel.belongsTo(User, { foreignKey: 'creatorId', as: 'Creator' });
  Channel.hasMany(Post, { foreignKey: 'channelId', as: 'Posts' });

  // Post Associations
  Post.belongsTo(User, { foreignKey: 'userId', as: 'Author' });
  Post.belongsTo(Community, { foreignKey: 'communityId', as: 'Community' });
  Post.belongsTo(Channel, { foreignKey: 'channelId', as: 'Channel' });
  Post.hasMany(Comment, { foreignKey: 'postId', as: 'Comments' });
  // Reaction: entityId references Post or Comment (polymorphic, handled at application level)

  // Comment Associations
  Comment.belongsTo(User, { foreignKey: 'userId', as: 'Author' });
  Comment.belongsTo(Post, { foreignKey: 'postId', as: 'Post' });
  Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'ParentComment' }); // Self-referencing
  Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'Replies' }); // Self-referencing
  // Reaction: entityId references Post or Comment (polymorphic, handled at application level)

  // Reaction Associations
  Reaction.belongsTo(User, { foreignKey: 'userId', as: 'User' });
  // For polymorphic association (entityType, entityId), it's typically handled programmatically.
  // We don't define a direct FK here for entityId due to its polymorphic nature.

  // Event Associations
  Event.belongsTo(Community, { foreignKey: 'communityId', as: 'Community' });
  Event.belongsTo(User, { foreignKey: 'creatorId', as: 'Creator' });
  Event.hasMany(EventAttendee, { foreignKey: 'eventId', as: 'Attendees' });

  // EventAttendee Associations
  EventAttendee.belongsTo(Event, { foreignKey: 'eventId', as: 'Event' });
  EventAttendee.belongsTo(User, { foreignKey: 'userId', as: 'User' });

  // DirectMessage Associations
  DirectMessage.belongsTo(User, { foreignKey: 'senderId', as: 'Sender' });
  DirectMessage.belongsTo(User, { foreignKey: 'receiverId', as: 'Receiver' });

  // Notification Associations
  Notification.belongsTo(User, { foreignKey: 'userId', as: 'User' });
  // For polymorphic association (entityType, entityId), it's typically handled programmatically.
};

// Function to sync database
const syncDatabase = async () => {
  try {
    defineAssociations(); // Define associations before syncing
    await sequelize.sync({ alter: true }); // `alter: true` checks the current state of the table in the database
                                          // and makes the necessary changes to make it match the model.
                                          // In production, consider using migrations.
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Failed to sync database:', error);
    throw error;
  }
};

export { sequelize as default, DataTypes, syncDatabase };
