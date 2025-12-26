import { Router } from 'express';
import { createGenericController } from '../controllers/genericController.js';
import { isAuthenticated, authorizeRoles } from '../middleware/auth.js';

const genericRoutes = (Model) => {
  const router = Router();
  const controller = createGenericController(Model);

  // All authenticated users can read (list and get by ID)
  router.get('/', isAuthenticated, controller.getAll);
  router.get('/:id', isAuthenticated, controller.getById);

  // Only authenticated users can create
  router.post('/', isAuthenticated, controller.createItem);

  // Only creator or admin can update/delete
  router.put('/:id', isAuthenticated, controller.updateItem);
  router.delete('/:id', isAuthenticated, controller.deleteItem);

  return router;
};

export { genericRoutes };
