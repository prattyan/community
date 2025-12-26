import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import sequelize, { syncDatabase } from './config/db.js';

// Import all models
import User from './models/User.js';
import Community from './models/Community.js';
import Role from './models/Role.js';
import Membership from './models/Membership.js';
import Channel from './models/Channel.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';
import Reaction from './models/Reaction.js';
import Event from './models/Event.js';
import EventAttendee from './models/EventAttendee.js';
import DirectMessage from './models/DirectMessage.js';
import Notification from './models/Notification.js';

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync models - this will create tables if they don't exist
    // In a production environment, you would typically use migrations.
    await syncDatabase(); 

    const password = 'password123';
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Clear existing data (optional, useful for clean re-seeding)
    console.log('Clearing existing data...');
    await Notification.destroy({ truncate: true, cascade: true });
    await DirectMessage.destroy({ truncate: true, cascade: true });
    await EventAttendee.destroy({ truncate: true, cascade: true });
    await Event.destroy({ truncate: true, cascade: true });
    await Reaction.destroy({ truncate: true, cascade: true });
    await Comment.destroy({ truncate: true, cascade: true });
    await Post.destroy({ truncate: true, cascade: true });
    await Channel.destroy({ truncate: true, cascade: true });
    await Membership.destroy({ truncate: true, cascade: true });
    await Role.destroy({ truncate: true, cascade: true });
    await Community.destroy({ truncate: true, cascade: true });
    await User.destroy({ truncate: true, cascade: true });
    console.log('Existing data cleared.');

    // 1. Seed Users
    const adminUser = await User.create({
      id: uuidv4(),
      username: 'adminuser',
      email: 'admin@example.com',
      passwordHash,
      role: 'admin',
      bio: 'Administrator of the platform.',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Admin user created:', adminUser.username);

    const regularUser1 = await User.create({
      id: uuidv4(),
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash,
      role: 'user',
      bio: 'A regular user interested in communities.',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Regular user 1 created:', regularUser1.username);

    const regularUser2 = await User.create({
      id: uuidv4(),
      username: 'janesmith',
      email: 'jane@example.com',
      passwordHash,
      role: 'user',
      bio: 'Another user exploring communities.',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Regular user 2 created:', regularUser2.username);

    // 2. Seed Communities
    const techCommunity = await Community.create({
      id: uuidv4(),
      name: 'Tech Enthusiasts',
      description: 'A community for discussing all things technology.',
      creatorId: adminUser.id,
      visibility: 'public',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Community created:', techCommunity.name);

    const scienceCommunity = await Community.create({
      id: uuidv4(),
      name: 'Science Discoverers',
      description: 'Explore the wonders of science and research.',
      creatorId: regularUser1.id,
      visibility: 'public',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Community created:', scienceCommunity.name);

    // 3. Seed Roles
    const adminRole = await Role.create({
      id: uuidv4(),
      name: 'Community Admin',
      permissions: { can_moderate: true, can_manage_members: true },
      communityId: techCommunity.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const memberRole = await Role.create({
      id: uuidv4(),
      name: 'Member',
      permissions: { can_post: true },
      communityId: techCommunity.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Roles created for Tech Enthusiasts.');

    // 4. Seed Memberships
    await Membership.create({
      id: uuidv4(),
      userId: adminUser.id,
      communityId: techCommunity.id,
      roleId: adminRole.id,
      joinedAt: new Date(),
      status: 'active',
    });

    await Membership.create({
      id: uuidv4(),
      userId: regularUser1.id,
      communityId: techCommunity.id,
      roleId: memberRole.id,
      joinedAt: new Date(),
      status: 'active',
    });

    await Membership.create({
      id: uuidv4(),
      userId: regularUser2.id,
      communityId: scienceCommunity.id,
      roleId: memberRole.id, // Assuming same member role for now, could create new one
      joinedAt: new Date(),
      status: 'active',
    });
    console.log('Memberships created.');

    // 5. Seed Channels
    const generalChannel = await Channel.create({
      id: uuidv4(),
      name: 'general',
      description: 'General discussions',
      communityId: techCommunity.id,
      creatorId: adminUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Channel created:', generalChannel.name);

    const programmingChannel = await Channel.create({
      id: uuidv4(),
      name: 'programming',
      description: 'Discussions about programming languages and development',
      communityId: techCommunity.id,
      creatorId: regularUser1.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Channel created:', programmingChannel.name);

    // 6. Seed Posts
    const firstPost = await Post.create({
      id: uuidv4(),
      title: 'Welcome to Tech Enthusiasts!',
      content: 'Hello everyone, eager to discuss the latest in tech!',
      userId: adminUser.id,
      communityId: techCommunity.id,
      channelId: generalChannel.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Post created:', firstPost.title);

    const secondPost = await Post.create({
      id: uuidv4(),
      title: 'Best framework for web development in 2024?',
      content: 'Looking for opinions on React, Vue, Angular, or something else.',
      userId: regularUser1.id,
      communityId: techCommunity.id,
      channelId: programmingChannel.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Post created:', secondPost.title);

    // 7. Seed Comments
    const comment1 = await Comment.create({
      id: uuidv4(),
      content: 'Welcome, admin! Glad to be here.',
      userId: regularUser1.id,
      postId: firstPost.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Comment created:', comment1.content);

    const comment2 = await Comment.create({
      id: uuidv4(),
      content: 'I prefer React for its ecosystem and community support.',
      userId: adminUser.id,
      postId: secondPost.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Comment created:', comment2.content);

    await Comment.create({
      id: uuidv4(),
      content: 'Vue is also a great choice for smaller projects.',
      userId: regularUser2.id,
      postId: secondPost.id,
      parentId: comment2.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Nested comment created.');

    // 8. Seed Reactions
    await Reaction.create({
      id: uuidv4(),
      userId: regularUser1.id,
      entityType: 'Post',
      entityId: firstPost.id,
      reactionType: 'like',
      createdAt: new Date(),
    });
    await Reaction.create({
      id: uuidv4(),
      userId: adminUser.id,
      entityType: 'Comment',
      entityId: comment1.id,
      reactionType: 'heart',
      createdAt: new Date(),
    });
    console.log('Reactions created.');

    // 9. Seed Events
    const techMeetup = await Event.create({
      id: uuidv4(),
      title: 'Monthly Tech Meetup',
      description: 'Discussing AI advancements and future tech trends.',
      startTime: new Date(Date.now() + 86400000 * 7), // 7 days from now
      endTime: new Date(Date.now() + 86400000 * 7 + 3600000 * 2), // 2 hours after start
      location: 'Online via Zoom',
      communityId: techCommunity.id,
      creatorId: adminUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Event created:', techMeetup.title);

    // 10. Seed EventAttendees
    await EventAttendee.create({
      id: uuidv4(),
      eventId: techMeetup.id,
      userId: regularUser1.id,
      status: 'going',
      registeredAt: new Date(),
    });
    await EventAttendee.create({
      id: uuidv4(),
      eventId: techMeetup.id,
      userId: regularUser2.id,
      status: 'interested',
      registeredAt: new Date(),
    });
    console.log('Event attendees registered.');

    // 11. Seed DirectMessages
    await DirectMessage.create({
      id: uuidv4(),
      senderId: regularUser1.id,
      receiverId: adminUser.id,
      content: 'Hey admin, can I get some help with something?',
      sentAt: new Date(),
    });
    console.log('Direct message sent.');

    // 12. Seed Notifications
    await Notification.create({
      id: uuidv4(),
      userId: adminUser.id,
      type: 'new_comment',
      message: `User ${regularUser1.username} commented on your post.`, 
      entityType: 'Comment',
      entityId: comment1.id,
      isRead: false,
      createdAt: new Date(),
    });
    console.log('Notification created.');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

seedDatabase();
