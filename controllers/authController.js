import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import User from '../models/User.js';

const generateTokens = (user) => {
  const payload = { user: { id: user.id, role: user.role } };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  const { username, email, password } = req.body;

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

    user = await User.create({
      username,
      email,
      passwordHash,
      role: 'user', // Default role for new registrations
    });

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(200).json({
      message: 'Logged in successfully',
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  // For JWTs, logout is typically client-side by discarding the tokens.
  // If using a token blacklist or revocation, that logic would go here.
  res.status(200).json({ message: 'Logout successful (tokens should be discarded by client).' });
};

const refreshToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No refresh token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = decoded.user; // Contains user ID and role

    // Check if user still exists in DB or if role has changed, optional but good practice
    User.findByPk(user.id).then(foundUser => {
      if (!foundUser) {
        return res.status(401).json({ message: 'User not found.' });
      }
      // Ensure the role in the token is up-to-date with the database
      const updatedUser = { ...foundUser.toJSON(), role: foundUser.role };
      const { accessToken } = generateTokens(updatedUser);
      res.status(200).json({ accessToken });
    }).catch(err => next(err));

  } catch (err) {
    console.error('Refresh token error:', err.message);
    res.status(403).json({ message: 'Refresh token is invalid or expired.' });
  }
};

export { register, login, logout, refreshToken };
