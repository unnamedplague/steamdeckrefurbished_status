const { checkStock } = require('./utils/scraper');
const { getDb } = require('./utils/database');
const { sendNotification } = require('./utils/notifier');
require('dotenv').config();

async function runCron() {
    console.log(`[${new Date().toLocaleString()}] GitHub Action: Starter lager-tjek...`);
    try {
        const currentStock = await checkStock();
        const db = await getDb();

        // lowdb/node i version 5+ loader data ved JSONFilePreset, 
        // men vi skal sikre os vi har de nyeste data hvis vi committer db.json
        const prevStock = db.data.stockStatus || [];
        let changeDetected = false;
        let message = 'Lagerstatus ændringer fundet på Refurbished Steam Decks:\n\n';

        currentStock.forEach(item => {
            const prevItem = prevStock.find(ps => ps.name === item.name);
            // Vi sender kun besked hvis den går FRA "Out of Stock" TIL "In Stock" 
            // eller hvis det er en helt ny model vi ser for første gang
            if ((!prevItem && item.status === 'In Stock') || (prevItem && prevItem.status !== item.status)) {
                changeDetected = true;
                message += `${item.name}: ${prevItem ? prevItem.status : 'Ukendt'} -> ${item.status}\n`;
            }
        });

        if (changeDetected) {
            console.log('Ændring fundet! Sender notifikation...');
            await sendNotification('Steam Deck Lager Update!', message);
        } else {
            console.log('Ingen ændringer i lagerstatus.');
        }

        // Opdater database
        db.data.stockStatus = currentStock;
        db.data.lastUpdate = new Date().toISOString();
        await db.write();

        console.log('Database opdateret.');

    } catch (error) {
        console.error('Fejl under runCron:', error);
        process.exit(1);
    }
}

runCron();
