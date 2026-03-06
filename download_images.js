const https = require('https');
const fs = require('fs');
const path = require('path');

const products = {
    'potato.png': 'https://www.themealdb.com/images/ingredients/Potato.png',
    'onion.png': 'https://www.themealdb.com/images/ingredients/Onion.png',
    'cabbage.png': 'https://www.themealdb.com/images/ingredients/Cabbage.png',
    'tomato.png': 'https://www.themealdb.com/images/ingredients/Tomato.png',
    'carrot.png': 'https://www.themealdb.com/images/ingredients/Carrot.png',
    'sugarcane.png': 'https://images.pexels.com/photos/2890606/pexels-photo-2890606.jpeg?auto=compress&cs=tinysrgb&w=400'
};

const dir = path.join(__dirname, 'frontend', 'public', 'product-images');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function download(name, url) {
    const options = { headers: { 'User-Agent': 'Mozilla/5.0' } };
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(dir, name));
        https.get(url, options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                download(name, res.headers.location).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) return reject(new Error(`${name}: ${res.statusCode}`));
            res.pipe(file).on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
    });
}
(async () => {
    console.log('Downloading...');
    for (const [n, u] of Object.entries(products)) {
        try { await download(n, u); console.log(`Saved ${n}`); }
        catch (e) { console.error(`Failed ${n}: ${e.message}`); }
    }
})();
