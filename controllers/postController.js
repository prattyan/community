import Post from '../models/Post.js';
import User from '../models/User.js';
import Community from '../models/Community.js';
import Channel from '../models/Channel.js';

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, as: 'Author', attributes: ['id', 'username'] },
        { model: Community, as: 'Community', attributes: ['id', 'name'] },
        { model: Channel, as: 'Channel', attributes: ['id', 'name'], required: false }, // Channel is optional
      ],
    });
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Author', attributes: ['id', 'username'] },
        { model: Community, as: 'Community', attributes: ['id', 'name'] },
        { model: Channel, as: 'Channel', attributes: ['id', 'name'], required: false },
      ],
    });
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { title, content, mediaUrl, communityId, channelId } = req.body;
    const userId = req.user.id; // Author is the authenticated user

    const newPost = await Post.create({
      title,
      content,
      mediaUrl,
      userId,
      communityId,
      channelId,
    });

    res.status(201).json(newPost);
  } catch (err) {
    next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, mediaUrl, communityId, channelId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Only the author or an admin can update the post
    if (post.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this post.' });
    }

    await post.update({
      title: title || post.title,
      content: content || post.content,
      mediaUrl: mediaUrl || post.mediaUrl,
      communityId: communityId || post.communityId,
      channelId: channelId === null ? null : (channelId || post.channelId), // Allow setting channelId to null
    });

    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Only the author or an admin can delete the post
    if (post.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this post.' });
    }

    await post.destroy();
    res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

export { getPosts, getPostById, createPost, updatePost, deletePost };
