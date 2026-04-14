// Menggunakan native fetch (Node.js 18+)

export default async function handler(req, res) {
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
    return res.status(500).json({ error: 'RAJAONGKIR_API_KEY is not set.' });
  }

  try {
    const { type } = req.query;

    if (req.method === 'GET' && type === 'cities') {
      const resp = await fetch('https://api.rajaongkir.com/starter/city', {
        headers: { 'key': apiKey }
      });
      const data = await resp.json();
      
      if (data.rajaongkir?.status?.code !== 200) {
        return res.status(data.rajaongkir?.status?.code || 500).json(data.rajaongkir?.status || { description: 'Unknown Error' });
      }
      
      return res.status(200).json(data.rajaongkir.results);
    }

    if (req.method === 'POST') {
      const { origin, destination, weight } = req.body;

      if (!origin || !destination || !weight) {
        return res.status(400).json({ error: 'Missing parameters' });
      }

      // Ambil harga dari 3 kurir sekaligus (Starter Plan: JNE, POS, TIKI)
      const couriers = ['jne', 'pos', 'tiki'];
      
      const fetchCosts = couriers.map(async (courier) => {
        const response = await fetch('https://api.rajaongkir.com/starter/cost', {
          method: 'POST',
          headers: { 
            'key': apiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({ origin, destination, weight, courier })
        });
        const data = await response.json();
        
        if (data.rajaongkir.status.code === 200) {
          // Gabungkan nama kurir ke setiap hasil biaya
          return data.rajaongkir.results[0].costs.map(c => ({
            ...c,
            courier_name: data.rajaongkir.results[0].name,
            courier_code: data.rajaongkir.results[0].code
          }));
        }
        return [];
      });

      const allResults = await Promise.all(fetchCosts);
      const combinedCosts = allResults.flat();

      return res.status(200).json(combinedCosts);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
