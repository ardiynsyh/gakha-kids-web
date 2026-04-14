/**
 * Vercel Serverless Function: Midtrans Payment Token Generator
 *
 * Required Environment Variables (set in Vercel → Settings → Environment Variables):
 *   MIDTRANS_SERVER_KEY         → Your Server Key (Sandbox OR Production)
 *   MIDTRANS_IS_PRODUCTION      → Set to "true" for Production, omit/false for Sandbox
 */
export default async function handler(req, res) {
  // CORS headers for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

  // Guard: key belum diset
  if (!serverKey || serverKey.includes('XXXXXXXXX')) {
    console.error('[Midtrans] MIDTRANS_SERVER_KEY not configured');
    return res.status(500).json({ 
      error: 'MIDTRANS_SERVER_KEY belum diatur di Environment Variables Vercel.',
      help: 'Vercel → Settings → Environment Variables → Tambah MIDTRANS_SERVER_KEY'
    });
  }

  const { order_id, gross_amount, customer_details, item_details } = req.body;
  
  if (!order_id || !gross_amount) {
    return res.status(400).json({ error: 'order_id dan gross_amount wajib diisi' });
  }

  const authString = Buffer.from(serverKey + ':').toString('base64');
  const apiUrl = isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

  console.log('[Midtrans] Using API:', apiUrl);
  console.log('[Midtrans] Order ID:', order_id, '| Amount:', gross_amount);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: order_id.toString(),
          gross_amount: Math.round(gross_amount)
        },
        customer_details: customer_details || {},
        item_details: (item_details || []).map(item => ({
          id: item.id.toString(),
          price: Math.round(item.price),
          quantity: item.quantity,
          name: item.name.substring(0, 50)
        }))
      })
    });

    const data = await response.json();
    console.log('[Midtrans] Response status:', response.status);
    console.log('[Midtrans] Response body:', JSON.stringify(data));

    if (!response.ok) {
      const errMsg = data.error_messages 
        ? data.error_messages.join(', ') 
        : (data.message || 'Midtrans API error');
      console.error('[Midtrans] API Error:', errMsg);
      return res.status(500).json({ 
        error: errMsg,
        midtrans_status: response.status,
        raw: data
      });
    }

    return res.status(200).json({ 
      token: data.token, 
      redirect_url: data.redirect_url 
    });

  } catch (error) {
    console.error('[Midtrans] Exception:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
