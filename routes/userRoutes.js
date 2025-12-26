import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { isAuthenticated, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Admin-only routes for user management
router.post('/', isAuthenticated, authorizeRoles('admin'), createUser);
router.get('/', isAuthenticated, authorizeRoles('admin'), getUsers);

// User-specific routes (users can view/update their own profile, admin can manage all)
router.get('/:id', isAuthenticated, getUserById);
router.put('/:id', isAuthenticated, updateUser);
router.delete('/:id', isAuthenticated, authorizeRoles('admin'), deleteUser); // Only admin can delete other users

export default router;
