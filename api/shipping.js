const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const apiKey = process.env.RAJAONGKIR_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RAJAONGKIR_API_KEY is not set in environment variables.' });
  }

  try {
    const { type } = req.query;

    // 1. Ambil DAFTAR KOTA
    if (req.method === 'GET' && type === 'cities') {
      const response = await fetch('https://api.rajaongkir.com/starter/city', {
        headers: { 'key': apiKey }
      });
      const data = await response.json();
      return res.status(200).json(data.rajaongkir.results);
    }

    // 2. Hitung ONGKOS KIRIM
    if (req.method === 'POST') {
      const { origin, destination, weight, courier } = req.body;

      if (!origin || !destination || !weight || !courier) {
        return res.status(400).json({ error: 'Missing parameters (origin, destination, weight, courier)' });
      }

      const response = await fetch('https://api.rajaongkir.com/starter/cost', {
        method: 'POST',
        headers: { 
          'key': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          origin,
          destination,
          weight,
          courier
        })
      });

      const data = await response.json();
      
      if (data.rajaongkir.status.code !== 200) {
        return res.status(400).json({ error: data.rajaongkir.status.description });
      }

      return res.status(200).json(data.rajaongkir.results[0].costs);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Shipping API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
