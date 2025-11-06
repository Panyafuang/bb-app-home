import { pool } from './pool';
import debugFactory from 'debug';

const log = debugFactory('app:tx');


export async function withTx<T>(fn: (client: any) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    log('BEGIN');

    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        log('COMMIT');
        return result;
    } catch (err) {
        log('ROLLBACK %O', err);
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release(); // คืน connection กลับ pool
    }
}