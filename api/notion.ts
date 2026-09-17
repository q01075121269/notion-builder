export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Notion-Version');
    return res.status(200).end();
  }

  const rawPath = req.query.path || '';
  const path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;
  const notionUrl = `https://api.notion.com/${path}`;

  const headers: Record<string, string> = {
    'Notion-Version': '2022-06-28'
  };

  if (req.headers['authorization']) {
    headers['Authorization'] = req.headers['authorization'];
  }
  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type'];
  }

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const notionRes = await fetch(notionUrl, fetchOptions);
    const contentType = notionRes.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await notionRes.json();
      return res.status(notionRes.status).json(data);
    } else {
      const text = await notionRes.text();
      return res.status(notionRes.status).send(text);
    }
  } catch (err: any) {
    console.error('Notion proxy error:', err);
    return res.status(502).json({ error: 'Notion 서버 통신 실패: ' + err.message });
  }
}
