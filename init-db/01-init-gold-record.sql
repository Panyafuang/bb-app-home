-- ============================================================
-- BB Gold Database Initialization (Consolidated Script)
-- ============================================================

BEGIN;

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- 2. Create Enum Type (Updated from 07-fix-ledger-enum.sql)
CREATE TYPE public.ledger_enum AS ENUM (
    'Beauty Bijoux',
    'Green Gold',
    'Palladium',
    'Platinum',
    'PV Accessories',
    'PV Fine Gold'
);

-- 3. Create Update Timestamp Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 4. Create Table (Final Structure with all columns)
CREATE TABLE public.gold_record (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    timestamp_tz timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reference_number character varying(100) NOT NULL,
    
    -- Weight Tracking
    gold_in_grams numeric(10,3) NOT NULL CHECK (gold_in_grams >= 0),
    gold_out_grams numeric(10,3) DEFAULT 0 CHECK (gold_out_grams >= 0),
    net_gold_grams numeric(10,3) GENERATED ALWAYS AS ((gold_in_grams - gold_out_grams)) STORED,
    calculated_loss numeric(10,2),
    
    -- Categorization
    ledger public.ledger_enum NOT NULL,
    fineness numeric,
    
    -- Details
    good_details text,
    remarks text,
    status text,
    
    -- Counterparties
    counterpart character varying(100),
    shipping_agent character varying(100),
    related_reference_number character varying(100),
    
    -- Audit
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT gold_record_pkey PRIMARY KEY (id)
);

-- 5. Create Indexes for Performance
CREATE INDEX idx_gold_record_timestamp ON public.gold_record USING btree (timestamp_tz);
CREATE INDEX idx_gold_record_reference ON public.gold_record USING btree (reference_number);
CREATE INDEX idx_gold_record_ledger ON public.gold_record USING btree (ledger);
CREATE INDEX idx_gold_record_counterpart ON public.gold_record USING btree (counterpart);
CREATE INDEX idx_gold_record_status ON public.gold_record USING btree (status);
CREATE INDEX idx_gold_record_related_reference ON public.gold_record USING btree (related_reference_number);
CREATE INDEX idx_gold_record_gold_out ON public.gold_record USING btree (gold_out_grams);
CREATE INDEX idx_gold_record_net_gold ON public.gold_record USING btree (net_gold_grams);

-- 6. Create Trigger for auto-updating updated_at
CREATE TRIGGER update_gold_record_updated_at 
    BEFORE UPDATE ON public.gold_record 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Add Comments (Documentation)
COMMENT ON COLUMN public.gold_record.calculated_loss IS 'Calculated loss in grams (numeric with 2 decimal places)';
COMMENT ON COLUMN public.gold_record.ledger IS 'Ledger category: Beauty Bijoux, Green Gold, Palladium, Platinum, PV Accessories, PV Fine Gold';
COMMENT ON COLUMN public.gold_record.related_reference_number IS 'Reference number of related transaction (for linking)';
COMMENT ON COLUMN public.gold_record.counterpart IS 'Business entity or partner involved in the transaction';
COMMENT ON COLUMN public.gold_record.fineness IS 'Gold fineness/purity (e.g., 0.999 for 24k, 0.750 for 18k)';
COMMENT ON COLUMN public.gold_record.good_details IS 'Detailed description of the goods/items';
COMMENT ON COLUMN public.gold_record.status IS 'Transaction status (e.g., pending, completed, cancelled)';
COMMENT ON COLUMN public.gold_record.shipping_agent IS 'Shipping or logistics provider';

-- 8. Grant Permissions (Crucial for App Access)
GRANT ALL PRIVILEGES ON TABLE public.gold_record TO bb_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bb_user;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO bb_user;

COMMIT;