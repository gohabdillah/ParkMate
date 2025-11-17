import { Router } from 'express';
import { carparkController } from './carpark.controller';
import { authenticate } from '@shared/middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/carparks/nearby
 * @desc    Get carparks near a specific location
 * @access  Private
 * @query   lat, lng, radius, limit, minAvailableLots, maxPrice, carparkType, hasEvCharger, nightParking
 */
router.get('/nearby', (req, res) => carparkController.getNearbyCarparks(req, res));

/**
 * @route   GET /api/v1/carparks/search
 * @desc    Search carparks with filters
 * @access  Private
 * @query   query, lat, lng, radius, limit, offset, sortBy, sortOrder
 */
router.get('/search', authenticate, (req, res) => carparkController.searchCarparks(req, res));

/**
 * @route   GET /api/v1/carparks/autocomplete
 * @desc    Autocomplete search for carparks
 * @access  Public
 * @query   q (query string), limit
 */
router.get('/autocomplete', (req, res) => carparkController.autocompleteCarparks(req, res));

/**
 * @route   GET /api/v1/carparks/stats
 * @desc    Get carpark statistics
 * @access  Private
 */
router.get('/stats', authenticate, (req, res) => carparkController.getStats(req, res));

/**
 * @route   GET /api/v1/carparks/:id
 * @desc    Get carpark by ID
 * @access  Private
 */
router.get('/:id', authenticate, (req, res) => carparkController.getCarparkById(req, res));

export default router;
