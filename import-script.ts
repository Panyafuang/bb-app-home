#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
import { parse } from 'csv-parse';

interface CsvRow {
  timestamp: string;
  reference: string;
  details: string;
  goldIn: string;
  goldOut: string;
  remarks: string;
  calculatedLoss?: string;
  ledger?: string;
}

interface GoldRecord {
  timestampTz: Date;
  referenceNumber: string;
  details: string;
  goldInGrams: number;
  goldOutGrams: number;
  remarks: string;
  category: string;
  calculatedLoss?: number;
  ledger?: string;
}

class GoldImporter {
  private client: Client;
  private targetLedger: string;
  
  constructor(ledger?: string) {
    this.client = new Client({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'bb_gold',
      user: process.env.POSTGRES_USER || 'bb_user',
      password: process.env.POSTGRES_PASSWORD || 'bb_secure_password_2024',
    });
    
    // Validate and set target ledger
    const validLedgers = ['Beauty Bijoux', 'Green Gold', 'Palladium', 'Platinum', 'PV Accessories', 'PV Fine Gold'];
    if (ledger && !validLedgers.includes(ledger)) {
      throw new Error(`Invalid ledger "${ledger}". Valid options: ${validLedgers.join(', ')}`);
    }
    this.targetLedger = ledger || '';
  }

  /**
   * Converts German number format (comma as decimal separator, dot as thousands separator) to JavaScript number
   */
  private parseGermanNumber(value: string): number {
    if (!value || value.trim() === '') {
      return 0;
    }
    
    // Remove any spaces
    let normalizedValue = value.trim().replace(/\s/g, '');
    
    // Handle German number format: 3.000,50 -> 3000.50
    // Remove thousands separators (dots) but keep decimal comma
    const parts = normalizedValue.split(',');
    if (parts.length === 2) {
      // Has decimal part: remove dots from integer part, convert comma to dot
      const integerPart = parts[0].replace(/\./g, '');
      normalizedValue = integerPart + '.' + parts[1];
    } else {
      // No decimal part: remove all dots (they are thousands separators)
      normalizedValue = normalizedValue.replace(/\./g, '');
    }
    
    const parsed = parseFloat(normalizedValue);
    
    if (isNaN(parsed)) {
      console.warn(`Warning: Could not parse number "${value}", defaulting to 0`);
      return 0;
    }
    
    return parsed;
  }

  /**
   * Parses German date format (DD.MM.YY) to JavaScript Date
   */
  private parseGermanDate(dateStr: string): Date {
    // Remove UTF-8 BOM if present
    const cleanDateStr = dateStr.replace(/^\uFEFF/, '');
    
    const parts = cleanDateStr.split('.');
    if (parts.length !== 3) {
      throw new Error(`Invalid date format: ${dateStr} (expected DD.MM.YY)`);
    }
    
    const [dayStr, monthStr, yearStr] = parts;
    
    // Parse day and month as integers to handle leading zeros properly
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    
    // Convert 2-digit year to 4-digit year (assuming 20XX)
    const fullYear = yearStr.length === 2 ? `20${yearStr}` : yearStr;
    const year = parseInt(fullYear, 10);
    
    // Validate ranges
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2000 || year > 2100) {
      throw new Error(`Invalid date values: ${dateStr} (day: ${day}, month: ${month}, year: ${year})`);
    }
    
    // Create date with European timezone (adjust as needed)
    const paddedMonth = month.toString().padStart(2, '0');
    const paddedDay = day.toString().padStart(2, '0');
    const date = new Date(`${year}-${paddedMonth}-${paddedDay}T12:00:00+02:00`);
    
    if (isNaN(date.getTime())) {
      throw new Error(`Failed to create date object from: ${dateStr}`);
    }
    
    return date;
  }

  /**
   * Applies ledger-specific business rules for calculated_loss
   */
  private applyLedgerRules(record: GoldRecord, goldOutValue: number): number | undefined {
    if (this.targetLedger === 'Beauty Bijoux' && goldOutValue > 0) {
      const detailsLower = record.details.toLowerCase();
      
      // Rule 1: Refining or Umicore entries with gold output get 0 calculated_loss
      if (detailsLower.includes('refining') || detailsLower.includes('umicore')) {
        console.log(`Applied refining/umicore rule: calculated_loss = 0 for ${record.referenceNumber}`);
        return 0;
      }
      
      // Rule 2: Export entries with gold output get 0.1 calculated_loss  
      if (detailsLower.includes('export')) {
        console.log(`Applied export rule: calculated_loss = 0.1 for ${record.referenceNumber}`);
        return 0.1;
      }
    }
    
    // No rule applied, return undefined (will not set calculated_loss)
    return undefined;
  }

  /**
   * Transforms CSV row to database record format
   */
  private transformRow(row: CsvRow): GoldRecord | null {
    // Skip completely empty rows
    if (!row.timestamp && !row.reference && !row.details && !row.goldIn && !row.goldOut && !row.remarks) {
      return null;
    }
    
    // Skip rows with empty timestamp or reference (required fields)
    if (!row.timestamp || !row.reference) {
      console.warn(`Skipping row with missing timestamp or reference: ${JSON.stringify(row)}`);
      return null;
    }
    
    const goldInValue = this.parseGermanNumber(row.goldIn);
    const goldOutValue = this.parseGermanNumber(row.goldOut);
    
    const record: GoldRecord = {
      timestampTz: this.parseGermanDate(row.timestamp),
      referenceNumber: row.reference,
      details: row.details,
      goldInGrams: goldInValue, // Will be 0 if empty or invalid
      goldOutGrams: goldOutValue, // Will be 0 if empty or invalid
      remarks: row.remarks || '', // Handle empty remarks
      category: 'Beauty Bijoux' // As specified in requirements
    };

    // Handle ledger assignment
    if (this.targetLedger) {
      record.ledger = this.targetLedger;
      console.log(`Assigned ledger "${this.targetLedger}" to ${record.referenceNumber}`);
    } else if (row.ledger) {
      // Use CSV ledger value if no target ledger specified
      const validLedgers = ['Beauty Bijoux', 'Green Gold', 'Palladium', 'Platinum', 'PV Accessories', 'PV Fine Gold'];
      if (validLedgers.includes(row.ledger)) {
        record.ledger = row.ledger;
      } else {
        console.warn(`Invalid ledger value "${row.ledger}" for reference ${row.reference}. Skipping ledger assignment.`);
      }
    }

    // Handle calculated_loss: prioritize CSV value, then apply ledger rules
    if (row.calculatedLoss) {
      // Use CSV value if provided
      record.calculatedLoss = this.parseGermanNumber(row.calculatedLoss);
    } else {
      // Apply ledger-specific rules if no CSV value
      const ruleCalculatedLoss = this.applyLedgerRules(record, goldOutValue);
      if (ruleCalculatedLoss !== undefined) {
        record.calculatedLoss = ruleCalculatedLoss;
      }
    }
    
    return record;
  }

  /**
   * Reads and parses the CSV file
   */
  private async readCsvFile(filePath: string): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
      const rows: CsvRow[] = [];
      
      fs.createReadStream(filePath)
        .pipe(parse({
          delimiter: ';',
          columns: false, // We'll handle column mapping manually
          skip_empty_lines: true,
          trim: true,
          relax_column_count: true, // Allow rows with different column counts
          relax_quotes: true // Handle quotes more flexibly
        }))
        .on('data', (row: string[]) => {
          // Handle rows with variable column counts
          // Expected CSV format: timestamp;reference;details;goldIn;goldOut;remarks;calculatedLoss;ledger
          rows.push({
            timestamp: row[0] || '',
            reference: row[1] || '',
            details: row[2] || '',
            goldIn: row[3] || '',
            goldOut: row[4] || '',
            remarks: row[5] || '',
            calculatedLoss: row[6] || undefined,
            ledger: row[7] || undefined
          });
        })
        .on('end', () => {
          console.log(`✅ Parsed ${rows.length} rows from CSV`);
          resolve(rows);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * Inserts a gold record into the database
   */
  private async insertGoldRecord(record: GoldRecord): Promise<void> {
    // Build dynamic query based on available fields
    const fields = ['timestamp_tz', 'reference_number', 'details', 'gold_in_grams', 'gold_out_grams', 'remarks', 'category'];
    const values = [record.timestampTz, record.referenceNumber, record.details, record.goldInGrams, record.goldOutGrams, record.remarks, record.category];
    let paramIndex = 8;
    
    if (record.calculatedLoss !== undefined) {
      fields.push('calculated_loss');
      values.push(record.calculatedLoss);
    }
    
    if (record.ledger) {
      fields.push('ledger');
      values.push(record.ledger);
    }
    
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO gold_record (
        ${fields.join(', ')}
      ) VALUES (${placeholders})
    `;
    
    await this.client.query(query, values);
  }

  /**
   * Main import function
   */
  async import(csvFilePath: string): Promise<void> {
    try {
      console.log('🚀 Starting gold import process...');
      
      // Check if file exists
      if (!fs.existsSync(csvFilePath)) {
        throw new Error(`CSV file not found: ${csvFilePath}`);
      }

      // Connect to database
      console.log('📡 Connecting to database...');
      await this.client.connect();
      console.log('✅ Database connected');

      // Read and parse CSV
      console.log('📄 Reading CSV file...');
      const csvRows = await this.readCsvFile(csvFilePath);

      // Transform and insert records
      console.log('🔄 Processing records...');
      let importedCount = 0;
      let skippedCount = 0;

      for (const [index, row] of csvRows.entries()) {
        try {
          const record = this.transformRow(row);
          
          if (record) {
            await this.insertGoldRecord(record);
            importedCount++;
            const netGold = record.goldInGrams - record.goldOutGrams;
            const flowDescription = record.goldInGrams > 0 && record.goldOutGrams > 0 
              ? `+${record.goldInGrams}g/-${record.goldOutGrams}g (net: ${netGold > 0 ? '+' : ''}${netGold}g)`
              : record.goldInGrams > 0 
                ? `+${record.goldInGrams}g`
                : record.goldOutGrams > 0
                  ? `-${record.goldOutGrams}g`
                  : '0g';
            console.log(`✅ [${index + 1}/${csvRows.length}] Imported: ${record.referenceNumber} (${flowDescription})`);
          } else {
            skippedCount++;
            console.log(`⏭️  [${index + 1}/${csvRows.length}] Skipped: ${row.reference}`);
          }
        } catch (error) {
          console.error(`❌ Error processing row ${index + 1}:`, error);
          console.error(`   Row data:`, row);
          throw error; // Stop on error, or comment this line to continue with other rows
        }
      }

      console.log('\\n📊 Import Summary:');
      console.log(`   Total rows processed: ${csvRows.length}`);
      console.log(`   Successfully imported: ${importedCount}`);
      console.log(`   Skipped: ${skippedCount}`);
      console.log('\\n🎉 Import completed successfully!');

    } catch (error) {
      console.error('❌ Import failed:', error);
      throw error;
    } finally {
      await this.client.end();
      console.log('📡 Database connection closed');
    }
  }
}

// CLI execution
async function main() {
  // Parse command line arguments
  const csvFilePath = process.argv[2];
  const ledgerName = process.argv[3];
  
  if (!csvFilePath) {
    console.error('Usage: npx ts-node import-script.ts <csv-file> [ledger]');
    console.error('');
    console.error('Available ledgers:');
    console.error('  - "Beauty Bijoux"');
    console.error('  - "Green Gold"');
    console.error('  - "Palladium"');
    console.error('  - "Platinum"');
    console.error('  - "PV Accessories"');
    console.error('  - "PV Fine Gold"');
    console.error('');
    console.error('Example: npx ts-node import-script.ts data.csv "Beauty Bijoux"');
    process.exit(1);
  }
  
  console.log('🏆 BB Gold Import Tool');
  console.log('====================');
  console.log(`📂 CSV file: ${csvFilePath}`);
  console.log(`🏷️  Category: Beauty Bijoux`);
  if (ledgerName) {
    console.log(`📋 Target Ledger: ${ledgerName}`);
  }
  console.log('');

  const importer = new GoldImporter(ledgerName);
  
  try {
    await importer.import(csvFilePath);
    process.exit(0);
  } catch (error) {
    console.error('\\n💥 Import process failed!');
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

export { GoldImporter };