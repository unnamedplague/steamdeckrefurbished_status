import { chromium } from 'playwright';

export async function checkStock() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('Besøger Steam Deck Refurbished side...');
        await page.goto('https://store.steampowered.com/sale/steamdeckrefurbished/', { waitUntil: 'networkidle' });

        // Find alle containere for modellerne
        const models = await page.evaluate(() => {
            const results = [];
            const containers = document.querySelectorAll('div[class*="SaleSectionContainer"]');

            containers.forEach(container => {
                const titleElement = container.querySelector('div[class*="_1e4No10_bpJEyqWGdzhAs9"]');
                const cartBtn = container.querySelector('div.CartBtn');

                if (titleElement) {
                    const name = titleElement.innerText.trim();
                    let status = 'Unknown';

                    if (cartBtn) {
                        const btnText = cartBtn.innerText.toLowerCase();
                        if (btnText.includes('out of stock')) {
                            status = 'Out of Stock';
                        } else if (btnText.includes('add to cart') || btnText.includes('buy now')) {
                            status = 'In Stock';
                        } else {
                            status = cartBtn.innerText.trim();
                        }
                    }

                    results.push({ name, status, lastChecked: new Date().toISOString() });
                }
            });

            return results;
        });

        return models;
    } catch (error) {
        console.error('Fejl under scraping:', error);
        throw error;
    } finally {
        await browser.close();
    }
}
