-- Migration: Add EPS pricing columns
-- Date: 2025-11-06
-- Description: Add per-half-hour pricing and daily cap pricing based on Central/Non-Central Area

ALTER TABLE carparks
ADD COLUMN IF NOT EXISTS price_per_half_hour DECIMAL(10, 2) DEFAULT 0.60,  -- $0.60 for non-central, $1.20 for central
ADD COLUMN IF NOT EXISTS is_central_area BOOLEAN DEFAULT FALSE,  -- TRUE if carpark is in Central Area
ADD COLUMN IF NOT EXISTS day_parking_cap DECIMAL(10, 2),  -- $12 for non-central, $20 for central (7am-10:30pm)
ADD COLUMN IF NOT EXISTS night_parking_cap DECIMAL(10, 2) DEFAULT 5.00,  -- $5 cap for night parking (10:30pm-7am)
ADD COLUMN IF NOT EXISTS whole_day_parking_cap DECIMAL(10, 2),  -- $12 for non-central, $20 for central (whole day)
ADD COLUMN IF NOT EXISTS grace_period_minutes INTEGER DEFAULT 15,  -- Grace period before charging starts
ADD COLUMN IF NOT EXISTS per_minute_rate DECIMAL(10, 4);  -- Calculated from price_per_half_hour / 30

-- Add comment to explain pricing structure
COMMENT ON COLUMN carparks.price_per_half_hour IS 'Parking charge per 0.5 hour: $0.60 (non-central), $1.20 (central)';
COMMENT ON COLUMN carparks.is_central_area IS 'TRUE if carpark is located in Singapore Central Area';
COMMENT ON COLUMN carparks.day_parking_cap IS 'Maximum charge for day parking (7am-10:30pm): $12 (non-central), $20 (central)';
COMMENT ON COLUMN carparks.night_parking_cap IS 'Maximum charge for night parking (10:30pm-7am): $5';
COMMENT ON COLUMN carparks.whole_day_parking_cap IS 'Maximum charge for whole-day parking: $12 (non-central), $20 (central)';
COMMENT ON COLUMN carparks.grace_period_minutes IS 'Grace period in minutes before parking charges apply (default: 15 minutes)';
COMMENT ON COLUMN carparks.per_minute_rate IS 'Per-minute parking rate calculated from price_per_half_hour / 30';

-- Create function to automatically set pricing based on central area status
CREATE OR REPLACE FUNCTION set_carpark_pricing()
RETURNS TRIGGER AS $$
BEGIN
    -- Set pricing based on is_central_area flag
    IF NEW.is_central_area = TRUE THEN
        -- Central Area pricing
        NEW.price_per_half_hour := COALESCE(NEW.price_per_half_hour, 1.20);
        NEW.day_parking_cap := COALESCE(NEW.day_parking_cap, 20.00);
        NEW.whole_day_parking_cap := COALESCE(NEW.whole_day_parking_cap, 20.00);
    ELSE
        -- Non-Central Area pricing
        NEW.price_per_half_hour := COALESCE(NEW.price_per_half_hour, 0.60);
        NEW.day_parking_cap := COALESCE(NEW.day_parking_cap, 12.00);
        NEW.whole_day_parking_cap := COALESCE(NEW.whole_day_parking_cap, 12.00);
    END IF;
    
    -- Calculate per-minute rate
    NEW.per_minute_rate := NEW.price_per_half_hour / 30.0;
    
    -- Set night parking cap (same for both areas)
    NEW.night_parking_cap := COALESCE(NEW.night_parking_cap, 5.00);
    
    -- Set grace period (same for both areas)
    NEW.grace_period_minutes := COALESCE(NEW.grace_period_minutes, 15);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set pricing when inserting or updating
DROP TRIGGER IF EXISTS trigger_set_carpark_pricing ON carparks;
CREATE TRIGGER trigger_set_carpark_pricing
    BEFORE INSERT OR UPDATE OF is_central_area, price_per_half_hour
    ON carparks
    FOR EACH ROW
    EXECUTE FUNCTION set_carpark_pricing();

-- Update existing records with default pricing (non-central area)
UPDATE carparks
SET 
    is_central_area = FALSE,
    price_per_half_hour = 0.60,
    day_parking_cap = 12.00,
    night_parking_cap = 5.00,
    whole_day_parking_cap = 12.00,
    grace_period_minutes = 15,
    per_minute_rate = 0.02  -- 0.60 / 30
WHERE is_central_area IS NULL;

-- Create index for querying by central area
CREATE INDEX IF NOT EXISTS idx_carparks_central_area ON carparks(is_central_area);
