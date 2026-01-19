import dotenv from 'dotenv';
dotenv.config();

export async function sendNotification(title, message) {
    const topic = process.env.NTFY_TOPIC;

    if (!topic) {
        console.warn('NTFY_TOPIC er ikke sat i .env. Springer notifikation over.');
        console.log('Besked der ville have været sendt:', title, '-', message);
        return;
    }

    try {
        const response = await fetch(`https://ntfy.sh/${topic}`, {
            method: 'POST',
            body: JSON.stringify({
                topic: topic,
                message: message,
                title: title,
                priority: 4,
                tags: ['steam', 'shopping_cart']
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('NTFY notifikation sendt!');
        } else {
            console.error('Fejl ved afsendelse til NTFY:', response.statusText);
        }
    } catch (error) {
        console.error('Netværksfejl ved afsendelse til NTFY:', error);
    }
}
