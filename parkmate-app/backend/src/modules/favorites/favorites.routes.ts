import { Router } from 'express';
import { favoritesController } from './favorites.controller';
import { authenticate } from '@shared/middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/favorites
 * @desc    Get all user favorites
 * @access  Private
 */
router.get('/', authenticate, (req, res) => favoritesController.getUserFavorites(req, res));

/**
 * @route   POST /api/v1/favorites
 * @desc    Add a carpark to favorites
 * @access  Private
 */
router.post('/', authenticate, (req, res) => favoritesController.addFavorite(req, res));

/**
 * @route   DELETE /api/v1/favorites/:carparkId
 * @desc    Remove a carpark from favorites
 * @access  Private
 */
router.delete('/:carparkId', authenticate, (req, res) => favoritesController.removeFavorite(req, res));

/**
 * @route   GET /api/v1/favorites/check/:carparkId
 * @desc    Check if a carpark is favorited
 * @access  Private
 */
router.get('/check/:carparkId', authenticate, (req, res) => favoritesController.checkFavorite(req, res));

export default router;
