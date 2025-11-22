-- Migration: Consolidate category and ledger columns into single ledger enum column
-- Date: 2025-11-10
-- Description: Remove duplicate category column, convert ledger to enum type with all values

-- Step 1: Add new values to the existing category_enum type
ALTER TYPE category_enum ADD VALUE IF NOT EXISTS 'Green Gold';
ALTER TYPE category_enum ADD VALUE IF NOT EXISTS 'Palladium';
ALTER TYPE category_enum ADD VALUE IF NOT EXISTS 'Platinum';
ALTER TYPE category_enum ADD VALUE IF NOT EXISTS 'PV Fine Gold';

-- Step 2: Rename the enum type to ledger_enum for clarity
ALTER TYPE category_enum RENAME TO ledger_enum;

-- Step 3: Copy data from category to ledger if ledger is NULL
UPDATE gold_record 
SET ledger = category::text 
WHERE ledger IS NULL;

-- Step 4: Drop the old category column and its index
DROP INDEX IF EXISTS idx_gold_record_category;
ALTER TABLE gold_record DROP COLUMN category;

-- Step 5: Convert ledger from VARCHAR to ledger_enum type
-- First, remove the CHECK constraint
ALTER TABLE gold_record DROP CONSTRAINT IF EXISTS gold_record_ledger_check;

-- Convert the ledger column to use the enum type
ALTER TABLE gold_record 
ALTER COLUMN ledger TYPE ledger_enum USING ledger::ledger_enum;

-- Make ledger NOT NULL since it's required
ALTER TABLE gold_record 
ALTER COLUMN ledger SET NOT NULL;

-- Step 6: Update the comment
COMMENT ON COLUMN gold_record.ledger IS 'Ledger category: Beauty Bijoux, PV fine, PV green, PV Accessories, Green Gold, Palladium, Platinum, PV Fine Gold';

-- Display the updated table structure
\d gold_record;
\dT+ ledger_enum;
