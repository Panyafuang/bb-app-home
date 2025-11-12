# BB Gold - Jewelry Manufacturer Gold Bookkeeping System

A comprehensive gold inventory and bookkeeping system designed for jewelry manufacturers to track gold usage across different product categories.

## Features

- **Gold Record Tracking**: Track gold weights in grams with precise decimal accuracy
- **Category Management**: Support for multiple jewelry categories:
  - Beauty Bijoux
  - PV fine
  - PV green  
  - PV Accessories
- **Reference System**: Unique reference numbers for each gold transaction
- **Timestamp Tracking**: Automatic timestamp recording with timezone support
- **Audit Trail**: Created and updated timestamp tracking
- **Web Interface**: Adminer database management interface included

## Database Schema

### Gold Record Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `timestamp_tz` | TIMESTAMP WITH TIME ZONE | Transaction timestamp |
| `reference_number` | VARCHAR(100) | Unique reference number |
| `related_reference_number` | VARCHAR(100) | Unique reference number previously existing |
| `entity` | TEXT | Supplier or customer |
| `karat` | TEXT | Gold karat of the good |
| `details` | TEXT | Transaction details |
| `status` | TEXT | Purchased/Received (import) or Invoiced/Returned (export) |
| `agent` | TEXT | Shipping agent |
| `gold_in_grams` | NUMERIC(10,3) | Gold weight in grams (up to 3 decimal places) |
| `gold_out_grams` | NUMERIC(10,3) | Gold weight out in grams (default: 0) |
| `net_gold_grams` | NUMERIC(10,3) | Calculated net gold (gold_in - gold_out) |
| `calculated_loss` | NUMERIC(10,2) | **NEW**: Calculated loss in grams (optional) |
| `ledger` | VARCHAR(20) | **NEW**: Ledger category (optional) |
| `remarks` | TEXT | Additional remarks |
| `category` | ENUM | Category: 'Beauty Bijoux', 'PV fine', 'PV green', 'PV Accessories' |
| `created_at` | TIMESTAMP WITH TIME ZONE | Record creation time |
| `updated_at` | TIMESTAMP WITH TIME ZONE | Last update time |

#### Ledger Values
The `ledger` column accepts one of the following values:
- `Beauty Bijoux`
- `Green Gold`
- `Palladium`
- `Platinum`
- `PV Accessories`
- `PV Fine Gold`

## Quick Start

### Prerequisites

- Docker
- Docker Compose

### Setup

1. **Clone and navigate to the project:**
   ```bash
   cd bb-gold
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your preferred settings
   ```

3. **Start the services:**
   ```bash
   docker-compose up -d
   ```

4. **Verify the setup:**
   ```bash
   docker-compose ps
   ```

### Accessing the System

- **Database**: `localhost:5432`
- **Adminer (Web UI)**: `http://localhost:8080`
- **Grafana (Analytics)**: `http://localhost:3000`

#### Adminer Login Credentials
- **System**: PostgreSQL
- **Server**: postgres
- **Username**: bb_user (or as configured in .env)
- **Password**: bb_secure_password_2024 (or as configured in .env)
- **Database**: bb_gold

#### Grafana Login Credentials
- **Username**: admin (or as configured in .env)
- **Password**: bb_gold_admin_2024 (or as configured in .env)
- **Pre-configured**: PostgreSQL datasource and gold tracking dashboard

## Usage Examples

### Sample SQL Queries

#### Insert a new gold record (basic):
```sql
INSERT INTO gold_record (reference_number, details, gold_in_grams, remarks, category) 
VALUES ('REF-2024-005', 'New batch for ring production', 145.750, '18k gold alloy', 'Beauty Bijoux');
```

#### Insert a record with calculated loss and ledger:
```sql
INSERT INTO gold_record (
  reference_number, details, gold_in_grams, gold_out_grams, 
  calculated_loss, ledger, remarks, category
) 
VALUES (
  'REF-2024-006', 'Jewelry production batch', 100.000, 15.250, 
  2.50, 'Green Gold', 'Loss during melting process', 'Beauty Bijoux'
);
```

#### Query records by category:
```sql
SELECT * FROM gold_record WHERE category = 'PV fine' ORDER BY timestamp_tz DESC;
```

#### Get total gold by category:
```sql
SELECT category, SUM(gold_in_grams) as total_gold 
FROM gold_record 
GROUP BY category;
```

#### Search by reference number:
```sql
SELECT * FROM gold_record WHERE reference_number LIKE 'REF-2024-%';
```

### CSV Import Format

The system supports importing CSV files with the following format (semicolon-separated):

```csv
timestamp;reference;details;goldIn;goldOut;remarks;calculatedLoss;ledger
07.10.25;TEST-001;Test record;10,50;2,25;Test remarks;1,75;Beauty Bijoux
07.10.25;TEST-002;Green Gold batch;25,00;5,00;Processing notes;3,25;Green Gold
```

**Column Details:**
- `timestamp`: DD.MM.YY format (German)
- `goldIn/goldOut`: German number format (comma as decimal separator, dot as thousands)
- `calculatedLoss`: Optional, numeric with 2 decimals
- `ledger`: Optional, must be one of the valid ledger values
- Empty columns are automatically handled

**Import Commands:**
```bash
# Basic import (no ledger specified)
npx ts-node import-script.ts your-file.csv

# Import with specific ledger and rules
npx ts-node import-script.ts your-file.csv "Beauty Bijoux"
npx ts-node import-script.ts your-file.csv "Green Gold"
```

#### Ledger-Specific Rules

When importing with `"Beauty Bijoux"` ledger, the following automatic rules apply:

1. **Refining Rule**: Records with gold output containing "refining" or "umicore" (case-insensitive) in details → `calculated_loss = 0`
2. **Export Rule**: Records with gold output containing "export" (case-insensitive) in details → `calculated_loss = 0.1`
3. **Ledger Assignment**: All imported records get `ledger = "Beauty Bijoux"`

These rules only apply when:
- The ledger parameter is specified as "Beauty Bijoux"
- The record has gold output (gold_out_grams > 0)
- No calculated_loss value is provided in the CSV (CSV values take priority)

## Development

### Directory Structure
```
bb-gold/
├── docker-compose.yml          # Docker services configuration
├── .env                       # Environment variables (create from .env.example)
├── .env.example              # Environment template
├── init-db/                  # Database initialization scripts
│   └── 01-init-gold-record.sql
└── README.md                 # This file
```

### Managing the Database

#### Start all services:
```bash
docker-compose up -d
```

#### Start specific services:
```bash
# Database only
docker-compose up -d postgres

# Database + Adminer
docker-compose up -d postgres adminer

# Database + Grafana
docker-compose up -d postgres grafana

# All services
docker-compose up -d postgres adminer grafana
```

#### Stop services:
```bash
docker-compose down
```

#### View logs:
```bash
docker-compose logs -f postgres
```

#### Backup database:
```bash
docker-compose exec postgres pg_dump -U bb_user bb_gold > backup.sql
```

#### Restore database:
```bash
docker-compose exec -T postgres psql -U bb_user bb_gold < backup.sql
```

### Reset Database
To completely reset the database and start fresh:
```bash
docker-compose down -v  # This removes volumes too
docker-compose up -d
```

## 🔧 Troubleshooting

### Grafana Issues

**"Datasource bb-gold-postgres was not found" error:**
1. Restart Grafana: `docker-compose restart grafana`
2. Wait 10 seconds for full startup
3. The datasource should be automatically provisioned with the correct UID

**Dashboard not loading:**
1. Check if all services are running: `docker-compose ps`
2. Verify database connection: Check Adminer at http://localhost:8080
3. Check Grafana logs: `docker-compose logs grafana`

## Security Considerations

- Change default passwords in production
- Consider using secrets management for sensitive data
- Restrict database access to necessary services only
- Regular backups are recommended
- Use environment-specific configuration files

## Contributing

1. Follow the existing code style
2. Update documentation for any schema changes
3. Test changes thoroughly before committing

## License

[Add your license information here]