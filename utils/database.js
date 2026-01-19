import { JSONFilePreset } from 'lowdb/node';

export async function getDb() {
    const defaultData = { stockStatus: [], lastUpdate: null };
    const db = await JSONFilePreset('db.json', defaultData);
    return db;
}
