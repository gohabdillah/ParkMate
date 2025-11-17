import { Pool } from 'pg';
import { isCentralArea, getPricingByLocation } from '../shared/utils/centralAreaDetection';

// Simple logger replacement
const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string, err?: any) => console.error(`[ERROR] ${msg}`, err || ''),
};

// Create a simple database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'parkmate_db',
  user: process.env.DB_USER || 'abdi',
  password: process.env.DB_PASSWORD || '',
});

/**
 * Script to update all carparks with Central Area detection and pricing
 * 
 * This script:
 * 1. Fetches all carparks from the database
 * 2. Determines if each carpark is in the Central Area based on coordinates
 * 3. Updates the database with appropriate pricing information
 */

async function updateCarparksPricing() {
  try {
    logger.info('Starting carpark pricing update...');

    // Fetch all carparks
    const result = await pool.query(`
      SELECT id, external_id, address, latitude, longitude
      FROM carparks
      ORDER BY external_id
    `);

    const carparks = result.rows;
    logger.info(`Found ${carparks.length} carparks to update`);

    let centralCount = 0;
    let nonCentralCount = 0;
    let updatedCount = 0;

    // Process each carpark
    for (const carpark of carparks) {
      const { id, external_id, address, latitude, longitude } = carpark;

      // Determine if in Central Area
      const isCentral = isCentralArea(latitude, longitude);
      const pricing = getPricingByLocation(isCentral);

      // Update database
      await pool.query(
        `
        UPDATE carparks
        SET 
          is_central_area = $1,
          price_per_half_hour = $2,
          day_parking_cap = $3,
          night_parking_cap = $4,
          whole_day_parking_cap = $5,
          grace_period_minutes = $6,
          per_minute_rate = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        `,
        [
          isCentral,
          pricing.pricePerHalfHour,
          pricing.dayParkingCap,
          pricing.nightParkingCap,
          pricing.wholeDayParkingCap,
          pricing.gracePeriodMinutes,
          pricing.perMinuteRate,
          id,
        ]
      );

      if (isCentral) {
        centralCount++;
        logger.info(`✓ ${external_id} (${address}) - CENTRAL AREA - $${pricing.pricePerHalfHour}/0.5hr`);
      } else {
        nonCentralCount++;
        logger.info(`✓ ${external_id} (${address}) - Non-Central - $${pricing.pricePerHalfHour}/0.5hr`);
      }

      updatedCount++;

      // Progress update every 100 carparks
      if (updatedCount % 100 === 0) {
        logger.info(`Progress: ${updatedCount}/${carparks.length} carparks updated`);
      }
    }

    logger.info('='.repeat(60));
    logger.info('Carpark pricing update completed!');
    logger.info(`Total carparks updated: ${updatedCount}`);
    logger.info(`Central Area carparks: ${centralCount} ($1.20/0.5hr, $20 day cap)`);
    logger.info(`Non-Central Area carparks: ${nonCentralCount} ($0.60/0.5hr, $12 day cap)`);
    logger.info('='.repeat(60));

  } catch (error) {
    logger.error('Error updating carpark pricing:', error);
    throw error;
  }
}

// Run the script
updateCarparksPricing()
  .then(() => {
    logger.info('Script completed successfully');
    pool.end();
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Script failed:', error);
    pool.end();
    process.exit(1);
  });
