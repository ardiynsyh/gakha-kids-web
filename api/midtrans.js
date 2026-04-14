/**
 * Vercel Serverless Function: Midtrans Payment Token Generator
 *
 * Required Environment Variables (set in Vercel → Settings → Environment Variables):
 *   MIDTRANS_SERVER_KEY         → Your Server Key (Sandbox OR Production)
 *   MIDTRANS_IS_PRODUCTION      → Set to "true" for Production, omit/false for Sandbox
 *
 * To upgrade from Sandbox → Production:
 *   1. Go to Vercel → Settings → Environment Variables
 *   2. Change MIDTRANS_SERVER_KEY to your Production Server Key (Mid-server-xxx)
 *   3. Add MIDTRANS_IS_PRODUCTION = "true"
 *   4. Redeploy → Done! No code changes needed.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

  if (!serverKey || serverKey.includes('XXXXXXXXX')) {
    return res.status(500).json({ 
      error: 'MIDTRANS_SERVER_KEY belum diatur di Environment Variables Vercel.',
      help: 'Masuk ke Vercel → Settings → Environment Variables → Tambah MIDTRANS_SERVER_KEY'
    });
  }

  const { order_id, gross_amount, customer_details, item_details } = req.body;
  const authString = Buffer.from(serverKey + ':').toString('base64');

  const apiUrl = isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

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
        customer_details,
        item_details: item_details.map(item => ({
          id: item.id.toString(),
          price: Math.round(item.price),
          quantity: item.quantity,
          name: item.name.substring(0, 50)
        }))
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_messages ? data.error_messages.join(', ') : 'Midtrans API error');
    }

    res.status(200).json({ token: data.token, redirect_url: data.redirect_url });

  } catch (error) {
    console.error('Midtrans Error:', error);
    res.status(500).json({ error: error.message });
  }
}
