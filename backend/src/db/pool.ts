import { Pool } from 'pg';
import debugFactory from 'debug';

const log = debugFactory('app:db');

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on('connect', () => log('pool connect'));
pool.on('acquire', () => log('pool acquire'));
pool.on('remove', () => log('pool remove'));