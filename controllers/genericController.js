import { capitalizeFirstLetter } from '../utils/helpers.js';
import { DataTypes } from 'sequelize';

// Generic CRUD controller factory
const createGenericController = (Model) => {
  const modelName = capitalizeFirstLetter(Model.name);

  const getAll = async (req, res, next) => {
    try {
      const items = await Model.findAll();
      res.status(200).json(items);
    } catch (err) {
      console.error(`Error fetching all ${modelName}s:`, err);
      next(err);
    }
  };

  const getById = async (req, res, next) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) {
        return res.status(404).json({ message: `${modelName} not found.` });
      }
      res.status(200).json(item);
    } catch (err) {
      console.error(`Error fetching ${modelName} by ID:`, err);
      next(err);
    }
  };

  const createItem = async (req, res, next) => {
    try {
      // For models with 'creatorId' or 'userId', automatically assign from authenticated user
      const data = { ...req.body };
      if (Model.rawAttributes.creatorId && req.user && req.user.id) {
        data.creatorId = req.user.id;
      } else if (Model.rawAttributes.userId && req.user && req.user.id) {
        data.userId = req.user.id;
      }
      const newItem = await Model.create(data);
      res.status(201).json(newItem);
    } catch (err) {
      console.error(`Error creating ${modelName}:`, err);
      next(err);
    }
  };

  const updateItem = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      const item = await Model.findByPk(id);
      if (!item) {
        return res.status(404).json({ message: `${modelName} not found.` });
      }

      // Basic authorization: allow only creator or admin to update
      const isCreator = (item.userId && item.userId === userId) || (item.creatorId && item.creatorId === userId);
      if (!isCreator && userRole !== 'admin') {
        return res.status(403).json({ message: `Unauthorized to update this ${modelName}.` });
      }

      await item.update(data);
      res.status(200).json(item);
    } catch (err) {
      console.error(`Error updating ${modelName}:`, err);
      next(err);
    }
  };

  const deleteItem = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const item = await Model.findByPk(id);
      if (!item) {
        return res.status(404).json({ message: `${modelName} not found.` });
      }

      // Basic authorization: allow only creator or admin to delete
      const isCreator = (item.userId && item.userId === userId) || (item.creatorId && item.creatorId === userId);
      if (!isCreator && userRole !== 'admin') {
        return res.status(403).json({ message: `Unauthorized to delete this ${modelName}.` });
      }
      
      await item.destroy();
      res.status(200).json({ message: `${modelName} deleted successfully.` });
    } catch (err) {
      console.error(`Error deleting ${modelName}:`, err);
      next(err);
    }
  };

  return { getAll, getById, createItem, updateItem, deleteItem };
};

export { createGenericController };
