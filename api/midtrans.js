export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { order_id, gross_amount, customer_details, item_details } = req.body;

  // WARNING: Set MIDTRANS_SERVER_KEY di Environment Variables Vercel!
  const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-XXXXXXXXXXXXXXXXX';

  const authString = Buffer.from(serverKey + ':').toString('base64');

  try {
    const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
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
        throw new Error(data.error_messages ? data.error_messages.join(', ') : 'Kesalahan integrasi Midtrans Server');
    }

    res.status(200).json({ token: data.token, redirect_url: data.redirect_url });

  } catch (error) {
    console.error('Midtrans Error:', error);
    res.status(500).json({ error: error.message });
  }
}
