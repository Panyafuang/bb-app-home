-- Initialize the bb_gold database for jewelry manufacturer gold bookkeeping
-- This script creates the gold_record table with the required schema

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum type for category values
CREATE TYPE category_enum AS ENUM (
    'Beauty Bijoux',
    'PV fine', 
    'PV green',
    'PV Accessories'
);

-- Create the gold_record table
CREATE TABLE IF NOT EXISTS gold_record (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp_tz TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reference_number VARCHAR(100) NOT NULL,
    details TEXT,
    gold_in_grams NUMERIC(10, 3) NOT NULL CHECK (gold_in_grams >= 0),
    remarks TEXT,
    category category_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_gold_record_timestamp ON gold_record(timestamp_tz);
CREATE INDEX idx_gold_record_reference ON gold_record(reference_number);
CREATE INDEX idx_gold_record_category ON gold_record(category);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on record modification
CREATE TRIGGER update_gold_record_updated_at 
    BEFORE UPDATE ON gold_record 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional - remove if not needed)
INSERT INTO gold_record (reference_number, details, gold_in_grams, remarks, category) VALUES
    ('REF-2024-001', 'Initial gold inventory for Beauty Bijoux line', 125.500, 'High quality 18k gold', 'Beauty Bijoux'),
    ('REF-2024-002', 'Fine jewelry production batch', 89.250, 'Pure gold for premium pieces', 'PV fine'),
    ('REF-2024-003', 'Eco-friendly jewelry materials', 156.750, 'Recycled gold for green line', 'PV green'),
    ('REF-2024-004', 'Accessory production materials', 67.125, 'Standard gold alloy for accessories', 'PV Accessories');

-- Grant permissions (adjust as needed for your security requirements)
GRANT ALL PRIVILEGES ON TABLE gold_record TO bb_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bb_user;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO bb_user;