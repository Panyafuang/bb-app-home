-- Migration: Add additional tracking columns to gold_record table
-- Date: 2025-11-10
-- Description: Add related_reference_number, counterpart, fineness, good_details, status, shipping_agent, and remarks columns

-- Add related_reference_number column (for linking related transactions)
ALTER TABLE gold_record 
ADD COLUMN related_reference_number VARCHAR(100);

-- Add counterpart column (business entity/partner involved)
ALTER TABLE gold_record 
ADD COLUMN counterpart VARCHAR(100);

-- Add fineness column (gold purity/fineness)
ALTER TABLE gold_record 
ADD COLUMN fineness NUMERIC;

-- Add good_details column (detailed description of goods)
ALTER TABLE gold_record 
ADD COLUMN good_details TEXT;

-- Add status column (transaction status)
ALTER TABLE gold_record 
ADD COLUMN status TEXT;

-- Add shipping_agent column (shipping/logistics provider)
ALTER TABLE gold_record 
ADD COLUMN shipping_agent VARCHAR(100);

-- Note: remarks column already exists in the table, skipping

-- Add comments to document the new columns
COMMENT ON COLUMN gold_record.related_reference_number IS 'Reference number of related transaction (for linking)';
COMMENT ON COLUMN gold_record.counterpart IS 'Business entity or partner involved in the transaction';
COMMENT ON COLUMN gold_record.fineness IS 'Gold fineness/purity (e.g., 0.999 for 24k, 0.750 for 18k)';
COMMENT ON COLUMN gold_record.good_details IS 'Detailed description of the goods/items';
COMMENT ON COLUMN gold_record.status IS 'Transaction status (e.g., pending, completed, cancelled)';
COMMENT ON COLUMN gold_record.shipping_agent IS 'Shipping or logistics provider';

-- Create indexes for commonly queried columns
CREATE INDEX idx_gold_record_related_reference ON gold_record(related_reference_number);
CREATE INDEX idx_gold_record_counterpart ON gold_record(counterpart);
CREATE INDEX idx_gold_record_status ON gold_record(status);

-- Display the updated table structure
\d gold_record;
