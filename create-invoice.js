export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { amount, currency, description, callback_url, metadata } = req.body;

    const SECRET_KEY = process.env.MOYASAR_SECRET_KEY;

    const response = await fetch('https://api.moyasar.com/v1/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(SECRET_KEY + ':').toString('base64')
      },
      body: JSON.stringify({
        amount,
        currency: currency || 'SAR',
        description,
        callback_url,
        metadata
      })
    });

    const data = await response.json();
    console.log('Moyasar response:', data);

    if (data.url) {
      return res.status(200).json({ url: data.url, id: data.id });
    } else {
      return res.status(400).json({ error: data.message || 'Failed to create invoice', details: data });
    }
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
