import fs from 'fs';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify/sync';
import { Pool, PoolClient } from 'pg';

// --- Configuration ---
const DB_CONFIG = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'bb_gold',
  user: process.env.POSTGRES_USER || 'bb_user',
  password: process.env.POSTGRES_PASSWORD || 'bb_secure_password_2024',
};

interface GoldRecord {
  timestampTz: Date;
  referenceNumber: string;
  ledger: string;
  goldInGrams: number;
  goldOutGrams: number;
  calculatedLoss: number | null;
  remarks: string | null;
  relatedReferenceNumber: string | null;
  counterpart: string | null;
  fineness: number | null;
  goodDetails: string | null;
  status: string | null;
  shippingAgent: string | null;
}

class GoldImporter {
  private pool: Pool;
  private defaultLedger: string;

  constructor(defaultLedger: string = 'Beauty Bijoux') {
    this.pool = new Pool(DB_CONFIG);
    this.defaultLedger = defaultLedger;
  }

  private parseNumber(value: any): number {
    if (!value) return 0;
    const str = String(value).trim();
    if (str === '') return 0;
    if (str.includes('.') && !str.includes(',')) return parseFloat(str) || 0;
    let normalized = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }

  private parseDate(dateStr: any): Date {
    if (!dateStr) return new Date();
    let str = String(dateStr).trim();
    // รองรับ ISO (YYYY-MM-DD)
    if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
      const d = new Date(str);
      if (!isNaN(d.getTime())) return d;
    }
    // รองรับ DD.MM.YY (German)
    const parts = str.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; 
      let year = parseInt(parts[2]);
      if (year < 100) year += 2000;
      return new Date(Date.UTC(year, month, day));
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  private normalizeLedger(rawLedger: string | undefined): string {
    if (!rawLedger || rawLedger.trim() === '') {
      return this.defaultLedger;
    }
    const lower = rawLedger.trim().toLowerCase();
    if (lower === 'pv fine gold') return 'PV Fine Gold';
    if (lower === 'pv accessories') return 'PV Accessories';
    if (lower === 'beauty bijoux') return 'Beauty Bijoux';
    if (lower === 'green gold') return 'Green Gold';
    if (lower === 'palladium') return 'Palladium';
    if (lower === 'platinum') return 'Platinum';
    return rawLedger.trim();
  }

  private transformRow(row: any): GoldRecord {
    const findVal = (keys: string[]) => {
      for (const k of keys) {
        if (row[k] !== undefined) return row[k];
        const lowerKey = Object.keys(row).find(rk => rk.toLowerCase() === k.toLowerCase());
        if (lowerKey) return row[lowerKey];
      }
      return undefined;
    };

    const goldIn = this.parseNumber(findVal(['gold_in_grams', 'goldIn', 'Gold In']) || '0');
    const goldOut = this.parseNumber(findVal(['gold_out_grams', 'goldOut', 'Gold Out']) || '0');
    
    let calcLoss = null;
    const rawLoss = findVal(['calculated_loss', 'calculatedLoss']);
    if (rawLoss && String(rawLoss).trim() !== '') {
        calcLoss = this.parseNumber(rawLoss);
    } 

    let rawLedgerVal = findVal(['ledger']);
    const ledger = this.normalizeLedger(rawLedgerVal);

    return {
      timestampTz: this.parseDate(findVal(['timestamp_tz', 'timestamp', 'Date'])),
      referenceNumber: (findVal(['reference_number', 'reference']) || '').trim() || 'UNKNOWN',
      ledger: ledger,
      goldInGrams: goldIn,
      goldOutGrams: goldOut,
      calculatedLoss: calcLoss,
      remarks: (findVal(['remarks']) || '').trim() || null,
      relatedReferenceNumber: (findVal(['related_reference_number']) || '').trim() || null,
      counterpart: (findVal(['counterpart']) || '').trim() || null,
      fineness: this.parseNumber(findVal(['fineness'])) || null,
      goodDetails: (findVal(['good_details', 'details', 'goodDetails']) || '').trim() || null,
      status: (findVal(['status']) || '').trim() || null,
      shippingAgent: (findVal(['shipping_agent', 'shippingAgent']) || '').trim() || null,
    };
  }

  private async insertRecord(client: PoolClient, r: GoldRecord) {
    const query = `
      INSERT INTO gold_record (
        timestamp_tz, 
        reference_number, 
        ledger, 
        gold_in_grams, 
        gold_out_grams, 
        calculated_loss, 
        remarks,
        related_reference_number,
        counterpart,
        fineness,
        good_details,
        status,
        shipping_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;

    const values = [
      r.timestampTz,
      r.referenceNumber,
      r.ledger,
      r.goldInGrams,
      r.goldOutGrams,
      r.calculatedLoss,
      r.remarks,
      r.relatedReferenceNumber,
      r.counterpart,
      r.fineness,
      r.goodDetails,
      r.status,
      r.shippingAgent
    ];

    await client.query(query, values);
  }

  private writeErrorFile(failedRows: any[]) {
    if (failedRows.length === 0) return;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `import_errors_${timestamp}.csv`;
      
      const csvContent = stringify(failedRows, {
        header: true,
        bom: true 
      });

      fs.writeFileSync(filename, csvContent);
      console.log(`\n📄 Error log saved to: ${filename}`);
      console.log(`💡 Tip: You can fix the errors in this file and import it again.`);
    } catch (err) {
      console.error('❌ Failed to write error file:', err);
    }
  }

  public async import(filePath: string) {
    console.log(`🚀 Starting import from: ${filePath}`);
    
    const client = await this.pool.connect(); 
    
    // ✅ ตัวแปรเก็บรายการที่ Fail
    const failedRows: any[] = [];

    try {
      console.log('📡 Connected to database');
      await client.query("SET LC_NUMERIC = 'C'");

      const parser = fs.createReadStream(filePath).pipe(parse({
        delimiter: ',', 
        columns: true,
        trim: true,
        skip_empty_lines: true,
        bom: true 
      }));

      let count = 0;
      let rowIndex = 0;

      await client.query('BEGIN'); 

      for await (const row of parser) {
        rowIndex++;
        try {
          const record = this.transformRow(row);
          
          if (record.referenceNumber === 'UNKNOWN' && record.goldInGrams === 0 && record.goldOutGrams === 0) {
            continue;
          }

          // 🔥 เพิ่ม Validation: เช็ควันที่ห้ามเกินปัจจุบัน (Future Date Check)
          const now = new Date();
          if (record.timestampTz > now) {
            // แปลงวันที่เป็น String เพื่อแสดงใน Error ให้ดูง่าย
            const dateStr = record.timestampTz.toISOString().split('T')[0];
            throw new Error(`Date cannot be in the future (${dateStr})`);
          }

          // Savepoint logic
          await client.query('SAVEPOINT row_insert');
          await this.insertRecord(client, record);
          await client.query('RELEASE SAVEPOINT row_insert');

          count++;
          if (count % 100 === 0) process.stdout.write(`.`);
        } catch (err: any) {
          // ถ้า Error (รวมถึง Future Date) จะเข้าตรงนี้
          await client.query('ROLLBACK TO SAVEPOINT row_insert');
          
          console.error(`\n❌ Error Row ${rowIndex + 1} (Ref: ${row.reference || row.reference_number || 'N/A'}): ${err.message}`);
          
          // ✅ เก็บลงไฟล์ Error CSV
          failedRows.push({
            ...row,
            error_message: err.message 
          });
        }
      }

      await client.query('COMMIT'); 
      console.log(`\n\n✅ Import Finished!`);
      console.log(`📊 Success: ${count}`);
      console.log(`⚠️  Failed: ${failedRows.length}`);
      console.log(`📈 Total Rows: ${rowIndex}`);

      // ✅ สั่งสร้างไฟล์ CSV ถ้ามี error
      if (failedRows.length > 0) {
        this.writeErrorFile(failedRows);
      }

    } catch (err) {
      await client.query('ROLLBACK');
      console.error('\n💥 Fatal System Error:', err);
    } finally {
      client.release();
      await this.pool.end();
    }
  }
}

async function main() {
  const filePath = process.argv[2] || './import.csv';
  const category = process.argv[3] || 'Beauty Bijoux';

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const importer = new GoldImporter(category);
  await importer.import(filePath);
}

main();