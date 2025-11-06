# CSV Import Guide

This document explains how to use the CSV import tools for the BB Gold system.

## Overview

Two import scripts are provided:
1. **TypeScript Script** (`import-script.ts`) - Full-featured with detailed error handling
2. **Shell Script** (`import-csv.sh`) - Lightweight, requires only psql client

## Prerequisites

### For Docker Method (Recommended)
- Docker and Docker Compose installed
- Database running via `docker-compose up -d postgres`

### For Local Method
- Node.js 18+ (for TypeScript script) OR PostgreSQL client tools (for shell script)
- Direct database connection

## Usage Methods

### Method 1: Using Docker (Recommended)

```bash
# 1. Start the database
docker-compose up -d postgres

# 2. Wait for database to be ready (check logs)
docker-compose logs -f postgres

# 3. Run the TypeScript importer
docker-compose --profile tools run --rm importer

# Alternative: Run shell script in container
docker-compose exec postgres sh -c "
  apt-get update && apt-get install -y wget
  wget -O /tmp/import.csv https://path/to/your/csv
  # Use the shell script method
"
```

### Method 2: Local TypeScript Script

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Import CSV (default: ./import.csv)
npm run import:csv

# Or specify a different file
npm run build && node dist/import-script.js /path/to/your/file.csv

# Development mode (no build required)
npm run dev:import
```

### Method 3: Local Shell Script

```bash
# 1. Ensure PostgreSQL client is installed
# macOS: brew install postgresql
# Ubuntu: apt-get install postgresql-client

# 2. Run the script
./import-csv.sh

# Or specify a different file
./import-csv.sh /path/to/your/file.csv

# With custom database connection
POSTGRES_HOST=localhost POSTGRES_PORT=5432 ./import-csv.sh
```

## Environment Variables

The scripts use these environment variables (with defaults):

```bash
POSTGRES_HOST=localhost      # Database host
POSTGRES_PORT=5432          # Database port  
POSTGRES_DB=bb_gold         # Database name
POSTGRES_USER=bb_user       # Database user
POSTGRES_PASSWORD=bb_secure_password_2024  # Database password
```

## CSV Format Expected

The CSV file should have these columns (semicolon-separated):

```
timestamp;reference;details;gold_in;gold_out;remarks
01.07.25;REF-001;Sample description;12,50;;Some remarks
```

**Format Notes:**
- **Date**: DD.MM.YY (German format)
- **Numbers**: Use comma as decimal separator (12,50 not 12.50)
- **Separator**: Semicolon (;)
- **Category**: All imports will be categorized as "Beauty Bijoux"

## Data Processing

### What Gets Imported
- Records with `gold_in` values (incoming gold)
- Date converted from DD.MM.YY to proper timestamp with timezone
- German number format (12,50) converted to decimal (12.50)
- All records assigned to "Beauty Bijoux" category

### What Gets Skipped  
- Records with empty or zero `gold_in` values
- Records with only `gold_out` values (would need separate handling)
- Invalid date or number formats

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection manually
psql -h localhost -p 5432 -U bb_user -d bb_gold -c "SELECT 1;"

# Check if database is running
docker-compose ps postgres
```

### Import Errors
- Check CSV file encoding (should be UTF-8)
- Verify semicolon separation
- Ensure German number format (comma as decimal)
- Check date format is DD.MM.YY

### View Import Results
```sql
-- Check imported records
SELECT COUNT(*) FROM gold_record WHERE category = 'Beauty Bijoux';

-- View recent imports
SELECT * FROM gold_record 
WHERE category = 'Beauty Bijoux' 
ORDER BY created_at DESC 
LIMIT 10;

-- Total gold by reference pattern
SELECT reference_number, SUM(gold_in_grams) as total_gold
FROM gold_record 
WHERE category = 'Beauty Bijoux'
GROUP BY reference_number
ORDER BY total_gold DESC;
```

## Example CSV Data

```csv
01.07.25;Proforma 20250625JWD;Received chain 18K for production;12,73;;Quality checked
02.07.25;Inv. 105325;Received accessories from Germany;17,8;;In stock
03.07.25;IV2507-015;Purchased fine gold from supplier;133,86;;Premium quality
```

This would create 3 records in the database with:
- Timestamps: 2025-07-01, 2025-07-02, 2025-07-03
- Gold amounts: 12.73g, 17.8g, 133.86g
- Category: "Beauty Bijoux" for all records