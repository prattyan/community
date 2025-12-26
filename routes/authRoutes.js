import { Router } from 'express';
import { register, login, logout, refreshToken } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout); // Client-side token invalidation assumed
router.post('/refresh-token', refreshToken); // Placeholder for refresh token logic

export default router;
