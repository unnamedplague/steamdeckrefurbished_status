const { JSONFilePreset } = require('lowdb/node');

async function getDb() {
    const defaultData = { stockStatus: [], lastUpdate: null };
    const db = await JSONFilePreset('db.json', defaultData);
    return db;
}

module.exports = { getDb };
