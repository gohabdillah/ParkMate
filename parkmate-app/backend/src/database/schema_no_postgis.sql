-- Database schema without PostGIS dependency
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

-- Create carparks table (without PostGIS geography type)
CREATE TABLE IF NOT EXISTS carparks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(100) UNIQUE,  -- car_park_no from data.gov.sg
    address TEXT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,  -- WGS84 latitude
    longitude DECIMAL(10, 7) NOT NULL, -- WGS84 longitude
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

-- Create index for location-based queries (using lat/lng)
CREATE INDEX idx_carparks_location ON carparks (latitude, longitude);

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
    action VARCHAR(50) NOT NULL, -- 'viewed', 'navigated', 'parked'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'bug', 'feature', 'general'
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'system', -- 'light', 'dark', 'system'
    notifications_enabled BOOLEAN DEFAULT TRUE,
    location_sharing_enabled BOOLEAN DEFAULT TRUE,
    preferred_radius INTEGER DEFAULT 1000, -- in meters
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_carpark_id ON favorites(carpark_id);
CREATE INDEX idx_history_user_id ON history(user_id);
CREATE INDEX idx_history_carpark_id ON history(carpark_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_carparks_external_id ON carparks(external_id);
CREATE INDEX idx_carparks_type ON carparks(carpark_type);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carparks_updated_at BEFORE UPDATE ON carparks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();