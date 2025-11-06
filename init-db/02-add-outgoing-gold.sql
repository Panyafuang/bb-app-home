-- Migration: Add outgoing gold tracking
-- This script adds the gold_out_grams column to track outgoing gold

-- Add the outgoing gold column
ALTER TABLE gold_record 
ADD COLUMN IF NOT EXISTS gold_out_grams NUMERIC(10, 3) DEFAULT 0 CHECK (gold_out_grams >= 0);

-- Create index for outgoing gold for performance
CREATE INDEX IF NOT EXISTS idx_gold_record_gold_out ON gold_record(gold_out_grams);

-- Add a computed column for net gold flow (incoming - outgoing)
ALTER TABLE gold_record 
ADD COLUMN IF NOT EXISTS net_gold_grams NUMERIC(10, 3) 
GENERATED ALWAYS AS (gold_in_grams - gold_out_grams) STORED;

-- Create index for net gold calculations
CREATE INDEX IF NOT EXISTS idx_gold_record_net_gold ON gold_record(net_gold_grams);

-- Update existing records to ensure gold_out_grams has a default value
UPDATE gold_record 
SET gold_out_grams = 0 
WHERE gold_out_grams IS NULL;

-- Add some sample data showing both incoming and outgoing transactions
INSERT INTO gold_record (reference_number, details, gold_in_grams, gold_out_grams, remarks, category) VALUES
    ('REF-2024-005', 'Gold received from supplier', 250.000, 0.000, 'Incoming shipment', 'Beauty Bijoux'),
    ('REF-2024-006', 'Gold used for production', 0.000, 45.750, 'Used for ring production', 'Beauty Bijoux'),
    ('REF-2024-007', 'Partial return and new stock', 15.250, 8.125, 'Returned unused + used for earrings', 'Beauty Bijoux')
ON CONFLICT (id) DO NOTHING;