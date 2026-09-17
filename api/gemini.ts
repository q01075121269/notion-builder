export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-api-key, x-user-email');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const model = req.query.model || 'gemini-1.5-flash';
  const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY || '';

  if (!apiKey) {
    return res.status(401).json({ error: 'Gemini API Key가 설정되지 않았습니다.' });
  }

  try {
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const geminiRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    });

    const data = await geminiRes.json();
    return res.status(geminiRes.status).json(data);
  } catch (err: any) {
    console.error('Gemini proxy error:', err);
    return res.status(502).json({ error: 'Gemini 서버 통신 실패: ' + err.message });
  }
}
