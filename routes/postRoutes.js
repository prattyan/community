import { Router } from 'express';
import { getPosts, getPostById, createPost, updatePost, deletePost } from '../controllers/postController.js';
import { isAuthenticated, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', isAuthenticated, getPosts);
router.get('/:id', isAuthenticated, getPostById);
router.post('/', isAuthenticated, createPost); // Any authenticated user can create a post
router.put('/:id', isAuthenticated, updatePost); // Author or admin can update
router.delete('/:id', isAuthenticated, deletePost); // Author or admin can delete

export default router;
