const { body, query } = require('express-validator');

export const getCarparkByIdValidation = [];

export const getNearbyCarparkValidation = [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('Radius must be between 100 and 50000 meters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('minAvailableLots')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum available lots must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  query('hasEvCharger')
    .optional()
    .isBoolean()
    .withMessage('hasEvCharger must be a boolean'),
  query('nightParking')
    .optional()
    .isBoolean()
    .withMessage('nightParking must be a boolean')
];

export const searchCarparksValidation = [
  query('query')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Query must be between 1 and 200 characters'),
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('Radius must be between 100 and 50000 meters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive number'),
  query('sortBy')
    .optional()
    .isIn(['distance', 'price', 'availability'])
    .withMessage('sortBy must be one of: distance, price, availability'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be asc or desc')
];
