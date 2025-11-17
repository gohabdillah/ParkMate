-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create carparks table
CREATE TABLE IF NOT EXISTS carparks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(100) UNIQUE,  -- car_park_no from data.gov.sg
    address TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    carpark_type VARCHAR(100),  -- SURFACE, MULTI-STOREY, BASEMENT CAR PARK, etc.
    parking_system VARCHAR(100),  -- COUPON PARKING, ELECTRONIC PARKING, etc.
    short_term_parking VARCHAR(100),  -- WHOLE DAY, 7AM-10.30PM, etc.
    free_parking VARCHAR(255),  -- Free parking conditions (NO, YES, SUN & PH FR 7AM-10.30PM, etc.)
    night_parking BOOLEAN DEFAULT FALSE,
    car_park_decks INTEGER,  -- Number of decks
    gantry_height DECIMAL(5, 2),  -- Height limit in meters
    car_park_basement BOOLEAN DEFAULT FALSE,  -- Y/N from API
    
    -- Additional fields for future enhancements
    total_lots INTEGER DEFAULT 0,
    available_lots INTEGER DEFAULT 0,
    lot_type VARCHAR(50),  -- For future: C (Car), M (Motorcycle), H (Heavy Vehicle)
    price_per_hour DECIMAL(10, 2),
    price_weekday_rate_1 DECIMAL(10, 2),
    price_weekday_rate_2 DECIMAL(10, 2),
    price_saturday_rate DECIMAL(10, 2),
    price_sunday_rate DECIMAL(10, 2),
    
    -- EPS (Electronic Parking System) Pricing
    price_per_half_hour DECIMAL(10, 2) DEFAULT 0.60,  -- $0.60 for non-central, $1.20 for central
    is_central_area BOOLEAN DEFAULT FALSE,  -- TRUE if carpark is in Central Area
    day_parking_cap DECIMAL(10, 2),  -- $12 for non-central, $20 for central (7am-10:30pm)
    night_parking_cap DECIMAL(10, 2) DEFAULT 5.00,  -- $5 cap for night parking (10:30pm-7am)
    whole_day_parking_cap DECIMAL(10, 2),  -- $12 for non-central, $20 for central (whole day)
    grace_period_minutes INTEGER DEFAULT 15,  -- Grace period before charging starts
    per_minute_rate DECIMAL(10, 4),  -- Calculated from price_per_half_hour / 30
    
    has_ev_charger BOOLEAN DEFAULT FALSE,
    operating_hours JSONB,
    pricing_details JSONB,
    amenities JSONB,
    
    -- Metadata
    data_source VARCHAR(50) DEFAULT 'data.gov.sg',
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index for location-based queries
CREATE INDEX idx_carparks_location ON carparks USING GIST(location);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    carpark_id UUID NOT NULL REFERENCES carparks(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, carpark_id)
);

-- Create history table
CREATE TABLE IF NOT EXISTS history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    carpark_id UUID NOT NULL REFERENCES carparks(id) ON DELETE CASCADE,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action_type VARCHAR(50) NOT NULL
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    category VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    default_search_radius INTEGER DEFAULT 5000,
    preferred_payment_method VARCHAR(50),
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_carpark_id ON favorites(carpark_id);
CREATE INDEX idx_history_user_id ON history(user_id);
CREATE INDEX idx_history_searched_at ON history(searched_at DESC);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_carparks_available_lots ON carparks(available_lots);
CREATE INDEX idx_carparks_price ON carparks(price_per_hour);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carparks_updated_at BEFORE UPDATE ON carparks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
