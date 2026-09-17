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

  const rawModel = typeof req.query.model === 'string' ? req.query.model : 'gemini-2.0-flash';
  const requestedModel = rawModel.replace(/^models\//, '').trim() || 'gemini-2.0-flash';
  const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY || '';

  if (!apiKey) {
    return res.status(401).json({ error: 'Gemini API Key가 설정되지 않았습니다.' });
  }

  // 404 및 모델 지원 종료 대비 서버측 다단계 안전 Fallback 후보군
  const candidateModels = Array.from(
    new Set([
      requestedModel,
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash'
    ])
  );

  let lastStatus = 500;
  let lastData: any = null;

  for (const model of candidateModels) {
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
      if (geminiRes.ok) {
        return res.status(200).json(data);
      }

      lastStatus = geminiRes.status;
      lastData = data;

      // 404 NOT_FOUND (모델 지원 종료 또는 미존재) 감지 시 서버 내부에서 다음 최신 모델로 즉시 Fallback
      const errMsg = JSON.stringify(data || '');
      const isNotFound =
        geminiRes.status === 404 ||
        errMsg.includes('not found') ||
        errMsg.includes('is not found for API version') ||
        errMsg.includes('NOT_FOUND');

      if (isNotFound) {
        console.warn(`[Gemini Proxy] Model '${model}' 404 감지. 다음 대체 모델로 자동 재시도합니다.`);
        continue;
      }

      // 401(인증 실패), 400(요청 형식 불일치) 등 모델 변경으로 해결 불가능한 오류는 즉시 반환
      return res.status(geminiRes.status).json(data);
    } catch (err: any) {
      console.error(`[Gemini Proxy] Error calling model '${model}':`, err);
      lastData = { error: 'Gemini 서버 통신 실패: ' + err.message };
    }
  }

  return res.status(lastStatus).json(lastData || { error: '모든 Gemini 모델 Fallback 호출에 실패했습니다.' });
}
