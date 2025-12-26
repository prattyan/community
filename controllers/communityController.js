import Community from '../models/Community.js';
import User from '../models/User.js';

const getCommunities = async (req, res, next) => {
  try {
    const communities = await Community.findAll({ include: [{ model: User, as: 'Creator', attributes: ['id', 'username', 'email'] }] });
    res.status(200).json(communities);
  } catch (err) {
    next(err);
  }
};

const getCommunityById = async (req, res, next) => {
  try {
    const community = await Community.findByPk(req.params.id, { include: [{ model: User, as: 'Creator', attributes: ['id', 'username', 'email'] }] });
    if (!community) {
      return res.status(404).json({ message: 'Community not found.' });
    }
    res.status(200).json(community);
  } catch (err) {
    next(err);
  }
};

const createCommunity = async (req, res, next) => {
  try {
    const { name, description, visibility } = req.body;
    const creatorId = req.user.id; // Creator is the authenticated user

    const newCommunity = await Community.create({
      name,
      description,
      creatorId,
      visibility: visibility || 'public',
    });

    res.status(201).json(newCommunity);
  } catch (err) {
    next(err);
  }
};

const updateCommunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, visibility } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const community = await Community.findByPk(id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found.' });
    }

    // Only the creator or an admin can update the community
    if (community.creatorId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this community.' });
    }

    await community.update({
      name: name || community.name,
      description: description || community.description,
      visibility: visibility || community.visibility,
    });

    res.status(200).json(community);
  } catch (err) {
    next(err);
  }
};

const deleteCommunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const community = await Community.findByPk(id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found.' });
    }

    // Only the creator or an admin can delete the community
    if (community.creatorId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this community.' });
    }

    await community.destroy();
    res.status(200).json({ message: 'Community deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

export { getCommunities, getCommunityById, createCommunity, updateCommunity, deleteCommunity };
