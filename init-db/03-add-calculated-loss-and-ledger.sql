-- Migration: Add calculated_loss and ledger columns to gold_record table
-- Date: 2025-10-07
-- Description: Add calculated_loss (numeric) and ledger (enum) columns

-- Add calculated_loss column (numeric, allows decimals, can be NULL)
ALTER TABLE gold_record 
ADD COLUMN calculated_loss NUMERIC(10,2);

-- Add ledger column with specific allowed values
ALTER TABLE gold_record 
ADD COLUMN ledger VARCHAR(20) CHECK (ledger IN (
    'Beauty Bijoux', 
    'Green Gold', 
    'Palladium', 
    'Platinum', 
    'PV Accessories', 
    'PV Fine Gold'
));

-- Add comment to document the columns
COMMENT ON COLUMN gold_record.calculated_loss IS 'Calculated loss in grams (numeric with 2 decimal places)';
COMMENT ON COLUMN gold_record.ledger IS 'Ledger category: Beauty Bijoux, Green Gold, Palladium, Platinum, PV Accessories, PV Fine Gold';

-- Create index on ledger column for better query performance
CREATE INDEX idx_gold_record_ledger ON gold_record(ledger);

-- Display the updated table structure
\d gold_record;