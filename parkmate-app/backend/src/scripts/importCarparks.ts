/**
 * Import Carpark Data from Singapore Data.gov.sg
 * This script fetches carpark data from the public API and imports it into our database
 * Run: npm run import-carparks
 */

import axios from 'axios';
import { pool } from '../config/database';
import logger from '../shared/utils/logger';

// Singapore Data.gov.sg API endpoint
const CARPARK_API_URL = 'https://data.gov.sg/api/action/datastore_search';
const DATASET_ID = 'd_23f946fa557947f93a8043bbef41dd09';

interface CarparkRecord {
  car_park_no: string;
  address: string;
  x_coord: string;
  y_coord: string;
  car_park_type: string;
  type_of_parking_system: string;
  short_term_parking: string;
  free_parking: string;
  night_parking: string;
  car_park_decks: string;
  gantry_height: string;
  car_park_basement: string;
}

interface DataGovResponse {
  result: {
    records: CarparkRecord[];
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Convert SVY21 coordinates to WGS84 (lat/lng)
 * Using proper Transverse Mercator projection conversion (equivalent to pyproj)
 * Based on Singapore's SVY21 coordinate system parameters
 */
function svy21ToWgs84(x: number, y: number): { lat: number; lng: number } {
  // SVY21 parameters (Singapore coordinate system)
  const a = 6378137.0; // WGS84 semi-major axis (meters)
  const f = 1 / 298.257223563; // WGS84 flattening
  const lat0 = 1.366666 * Math.PI / 180; // Origin latitude (radians)
  const lon0 = 103.833333 * Math.PI / 180; // Origin longitude (radians)
  const k0 = 1.0; // Scale factor
  const x0 = 28001.642; // False easting
  const y0 = 38744.572; // False northing

  // Derived constants
  const b = a * (1 - f); // Semi-minor axis
  const e2 = 2 * f - f * f; // First eccentricity squared
  const e = Math.sqrt(e2); // First eccentricity
  const ep2 = e2 / (1 - e2); // Second eccentricity squared

  // Remove false origin
  const xRel = x - x0;
  const yRel = y - y0;

  // Calculate meridional arc
  const e4 = e2 * e2;
  const e6 = e4 * e2;
  const A0 = 1 - e2 / 4 - 3 * e4 / 64 - 5 * e6 / 256;
  const A2 = 3 / 8 * (e2 + e4 / 4 + 15 * e6 / 128);
  const A4 = 15 / 256 * (e4 + 3 * e6 / 4);
  const A6 = 35 * e6 / 3072;

  const M0 = a * (A0 * lat0 - A2 * Math.sin(2 * lat0) + A4 * Math.sin(4 * lat0) - A6 * Math.sin(6 * lat0));
  const M = M0 + yRel / k0;

  // Calculate footprint latitude
  const mu = M / (a * A0);
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const J1 = 3 * e1 / 2 - 27 * Math.pow(e1, 3) / 32;
  const J2 = 21 * e1 * e1 / 16 - 55 * Math.pow(e1, 4) / 32;
  const J3 = 151 * Math.pow(e1, 3) / 96;
  const J4 = 1097 * Math.pow(e1, 4) / 512;

  const fp = mu + J1 * Math.sin(2 * mu) + J2 * Math.sin(4 * mu) + J3 * Math.sin(6 * mu) + J4 * Math.sin(8 * mu);

  // Calculate latitude and longitude
  const C1 = ep2 * Math.pow(Math.cos(fp), 2);
  const T1 = Math.pow(Math.tan(fp), 2);
  const R1 = a * (1 - e2) / Math.pow(1 - e2 * Math.pow(Math.sin(fp), 2), 1.5);
  const N1 = a / Math.sqrt(1 - e2 * Math.pow(Math.sin(fp), 2));
  const D = xRel / (N1 * k0);

  // Latitude calculation
  const Q1 = N1 * Math.tan(fp) / R1;
  const Q2 = D * D / 2;
  const Q3 = (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ep2) * Math.pow(D, 4) / 24;
  const Q4 = (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 1.6 * ep2 - 37 * ep2 * C1) * Math.pow(D, 6) / 720;
  const lat = fp - Q1 * (Q2 - Q3 + Q4);

  // Longitude calculation
  const Q5 = D;
  const Q6 = (1 + 2 * T1 + C1) * Math.pow(D, 3) / 6;
  const Q7 = (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ep2 + 24 * T1 * T1) * Math.pow(D, 5) / 120;
  const lon = lon0 + (Q5 - Q6 + Q7) / Math.cos(fp);

  // Convert radians to degrees
  return {
    lat: lat * 180 / Math.PI,
    lng: lon * 180 / Math.PI
  };
}

/**
 * Fetch all carpark records from data.gov.sg with pagination
 */
async function fetchAllCarparks(): Promise<CarparkRecord[]> {
  const limit = 1000;
  let offset = 0;
  let allRecords: CarparkRecord[] = [];
  let hasMore = true;

  logger.info('Starting to fetch carpark data from data.gov.sg...');

  while (hasMore) {
    try {
      const response = await axios.get<DataGovResponse>(CARPARK_API_URL, {
        params: {
          resource_id: DATASET_ID,
          limit,
          offset
        }
      });

      const { records, total } = response.data.result;
      allRecords = allRecords.concat(records);
      
      logger.info(`Fetched ${records.length} records (offset: ${offset}, total so far: ${allRecords.length}/${total})`);

      offset += limit;
      hasMore = offset < total;

      // Add a small delay to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      logger.error('Error fetching carpark data:', error);
      throw error;
    }
  }

  logger.info(`Successfully fetched ${allRecords.length} carpark records`);
  return allRecords;
}

/**
 * Import carpark records into the database
 * Using individual transactions for each record to avoid one failure aborting everything
 */
async function importCarparks(records: CarparkRecord[]): Promise<void> {
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  const errors: { carpark: string; error: string }[] = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const x = parseFloat(record.x_coord);
      const y = parseFloat(record.y_coord);

      // Skip invalid coordinates
      if (isNaN(x) || isNaN(y) || x === 0 || y === 0) {
        logger.warn(`Skipping ${record.car_park_no} (${i + 1}/${records.length}): Invalid coordinates`);
        skipped++;
        await client.query('ROLLBACK');
        client.release();
        continue;
      }

      // Convert SVY21 to WGS84
      const { lat, lng } = svy21ToWgs84(x, y);

      // Validate converted coordinates
      if (isNaN(lat) || isNaN(lng)) {
        logger.warn(`Skipping ${record.car_park_no} (${i + 1}/${records.length}): Coordinate conversion failed`);
        skipped++;
        await client.query('ROLLBACK');
        client.release();
        continue;
      }

      const query = `
        INSERT INTO carparks (
          external_id,
          address,
          latitude,
          longitude,
          carpark_type,
          parking_system,
          short_term_parking,
          free_parking,
          night_parking,
          car_park_decks,
          gantry_height,
          car_park_basement,
          data_source,
          last_synced_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()
        )
        ON CONFLICT (external_id) 
        DO UPDATE SET
          address = EXCLUDED.address,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          carpark_type = EXCLUDED.carpark_type,
          parking_system = EXCLUDED.parking_system,
          short_term_parking = EXCLUDED.short_term_parking,
          free_parking = EXCLUDED.free_parking,
          night_parking = EXCLUDED.night_parking,
          car_park_decks = EXCLUDED.car_park_decks,
          gantry_height = EXCLUDED.gantry_height,
          car_park_basement = EXCLUDED.car_park_basement,
          last_synced_at = NOW(),
          updated_at = NOW()
      `;

      const gantryHeight = record.gantry_height && record.gantry_height !== '' 
        ? parseFloat(record.gantry_height) 
        : null;
      const carParkDecks = record.car_park_decks && record.car_park_decks !== ''
        ? parseInt(record.car_park_decks)
        : null;

      // Log progress every 100 records
      if (i % 100 === 0) {
        logger.info(`Progress: ${i}/${records.length} (${Math.round((i/records.length)*100)}%)`);
      }

      await client.query(query, [
        record.car_park_no,
        record.address,
        lat, // Latitude
        lng, // Longitude
        record.car_park_type,
        record.type_of_parking_system,
        record.short_term_parking,
        record.free_parking,
        record.night_parking === 'YES',
        carParkDecks,
        gantryHeight,
        record.car_park_basement === 'Y',
        'data.gov.sg'
      ]);

      // Check if it was an insert or update
      const checkQuery = 'SELECT created_at, updated_at FROM carparks WHERE external_id = $1';
      const checkResult = await client.query(checkQuery, [record.car_park_no]);
      
      if (checkResult.rows[0] && checkResult.rows[0].created_at.getTime() === checkResult.rows[0].updated_at.getTime()) {
        imported++;
      } else {
        updated++;
      }

      await client.query('COMMIT');
      client.release();

    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Error importing carpark ${record.car_park_no} (${i + 1}/${records.length}): ${errorMsg}`);
      errors.push({ carpark: record.car_park_no, error: errorMsg });
      skipped++;
    }
  }

  logger.info(`Import completed:`);
  logger.info(`  - New records imported: ${imported}`);
  logger.info(`  - Existing records updated: ${updated}`);
  logger.info(`  - Records skipped: ${skipped}`);
  logger.info(`  - Total processed: ${records.length}`);
  
  if (errors.length > 0) {
    logger.warn(`Encountered ${errors.length} errors. First 10:`);
    errors.slice(0, 10).forEach(({ carpark, error }) => {
      logger.warn(`  - ${carpark}: ${error}`);
    });
  }
}/**
 * Main execution
 */
async function main() {
  try {
    logger.info('=== Carpark Import Script Started ===');
    
    // Fetch data from data.gov.sg
    const records = await fetchAllCarparks();
    
    // Import into database
    await importCarparks(records);
    
    logger.info('=== Carpark Import Script Completed Successfully ===');
    process.exit(0);
  } catch (error) {
    logger.error('Fatal error in import script:', error);
    process.exit(1);
  }
}

// Run the script
main();
