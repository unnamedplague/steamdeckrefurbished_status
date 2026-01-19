import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

export async function getDb() {
    const adapter = new JSONFile('db.json');
    const defaultData = { stockStatus: [], lastUpdate: null };
    const db = new Low(adapter, defaultData);

    await db.read();

    // Hvis filen er tom eller ikke findes, brug defaultData
    db.data ||= defaultData;

    return db;
}
