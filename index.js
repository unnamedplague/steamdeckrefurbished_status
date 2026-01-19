const express = require('express');
const cron = require('node-cron');
const { checkStock } = require('./utils/scraper');
const { getDb } = require('./utils/database');
const { sendNotification } = require('./utils/notifier');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

async function performCheck() {
    console.log(`[${new Date().toLocaleString()}] Starter lager-tjek...`);
    try {
        const currentStock = await checkStock();
        const db = await getDb();

        const prevStock = db.data.stockStatus;
        let changeDetected = false;
        let message = 'Lagerstatus ændringer fundet på Refurbished Steam Decks:\n\n';

        // Sammenlign status
        currentStock.forEach(item => {
            const prevItem = prevStock.find(ps => ps.name === item.name);
            if (!prevItem || prevItem.status !== item.status) {
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

    } catch (error) {
        console.error('Fejl under performCheck:', error);
    }
}

// Kør hver 2. time
cron.schedule('0 */2 * * *', () => {
    performCheck();
});

// Endpoint til manuelt tjek eller dashboard
app.get('/api/status', async (req, res) => {
    const db = await getDb();
    res.json(db.data);
});

app.get('/api/check-now', async (req, res) => {
    await performCheck();
    const db = await getDb();
    res.json({ message: 'Tjek udført', data: db.data });
});

app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
    console.log('Cron job sat op til at tjekke hver 2. time.');

    // Kør et tjek med det samme ved opstart hvis databasen er tom
    getDb().then(db => {
        if (db.data.stockStatus.length === 0) {
            performCheck();
        }
    });
});
