import { Router } from 'express';
import { getCommunities, getCommunityById, createCommunity, updateCommunity, deleteCommunity } from '../controllers/communityController.js';
import { isAuthenticated, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', isAuthenticated, getCommunities);
router.get('/:id', isAuthenticated, getCommunityById);
router.post('/', isAuthenticated, createCommunity); // Any authenticated user can create a community
router.put('/:id', isAuthenticated, updateCommunity); // Creator or admin can update
router.delete('/:id', isAuthenticated, deleteCommunity); // Creator or admin can delete

export default router;
