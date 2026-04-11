import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));

const updated = data.map(p => ({
  ...p,
  rating: 5,
  reviews: Math.floor(Math.random() * 150) + 40
}));

fs.writeFileSync('./src/data/products.json', JSON.stringify(updated, null, 2));
