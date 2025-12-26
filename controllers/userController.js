import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['passwordHash'] }
    });
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  const { username, email, password, role, bio, profilePictureUrl } = req.body;

  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    user = await User.findOne({ where: { username } });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this username.' });
    }

    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10));
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      passwordHash,
      role: role || 'user', // Allow admin to set role, default to 'user'
      bio,
      profilePictureUrl
    });

    const userResponse = newUser.toJSON();
    delete userResponse.passwordHash;
    res.status(201).json(userResponse);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, password, role, bio, profilePictureUrl } = req.body;
    const userIdFromToken = req.user.id;
    const userRoleFromToken = req.user.role;

    let user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Users can only update their own profile, unless they are an admin
    if (user.id !== userIdFromToken && userRoleFromToken !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this user.' });
    }

    // Prevent non-admins from changing roles
    if (role && role !== user.role && userRoleFromToken !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to change user role.' });
    }

    // Handle password update
    let passwordHash = user.passwordHash;
    if (password) {
      const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10));
      passwordHash = await bcrypt.hash(password, salt);
    }

    await user.update({
      username: username || user.username,
      email: email || user.email,
      passwordHash,
      role: role || user.role,
      bio: bio || user.bio,
      profilePictureUrl: profilePictureUrl || user.profilePictureUrl
    });

    const userResponse = user.toJSON();
    delete userResponse.passwordHash;
    res.status(200).json(userResponse);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userIdFromToken = req.user.id;
    const userRoleFromToken = req.user.role;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Users can only delete their own profile, unless they are an admin
    if (user.id !== userIdFromToken && userRoleFromToken !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this user.' });
    }

    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

export { getUsers, getUserById, createUser, updateUser, deleteUser };
