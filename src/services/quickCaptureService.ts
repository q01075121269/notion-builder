import type { 
  QuickCaptureAnalysisResult, 
  RoutedNotionTask
} from '../types/quickCapture';
import type { CreatedNotionResource } from '../types/notion';

const ROUTING_SYSTEM_PROMPT = `
당신은 모바일 생산성 및 노션(Notion) 데이터베이스 자동 분류 라우팅 전문가입니다.
사용자가 음성이나 휘갈겨 쓴 메모로 전달한 자연어 텍스트를 정밀 분석하여, 맞춤법을 교정하고 맥락에 맞추어 1개 이상의 독립적인 노션 작업 항목(Multi-intent Tasks)으로 분할하세요.

[분류 가능한 6대 인텐트(Intent)]
1. schedule: 약속, 미팅, 진료, 마감일 등 특정 시간/날짜가 포함된 일정
2. expense: 식비, 쇼핑, 결제, 지출 등 금액과 소비 내역이 포함된 가계부
3. todo: 오늘 할 일, 체크리스트, 완료해야 할 행동
4. contact: 사람 이름, 회사, 전화번호, 이메일 등 인맥 정보
5. idea: 영감, 독서 인용구, 번뜩이는 생각, 기획 메모
6. general: 위 분류에 명확히 속하지 않는 일반 메모

[핵심 분할 규칙]
- 사용자가 "내일 오후 3시 치과 가고, 점심 식비 12,000원 썼어"라고 복합적으로 말하면:
  반드시 [일정] 작업 1개와 [가계부] 작업 1개로 명확히 분리하여 2개의 작업 배열로 반환하세요.
- 오늘 날짜 기준(2026-09-17)으로 "내일", "모레", "다음 주 화요일", "오후 3시" 등을 정확한 날짜/시간(YYYY-MM-DD 또는 YYYY-MM-DD HH:mm) 문자열로 변환하세요.

[응답 JSON 규격]
반드시 마크다운 따옴표 없이 순수한 유효 JSON 객체만 반환하세요:
{
  "rawInput": "사용자 원문",
  "correctedText": "맞춤법 및 문장이 매끄럽게 교정된 텍스트",
  "detectedType": "general_text",
  "tasks": [
    {
      "id": "task-1",
      "intent": "schedule", // schedule, expense, todo, contact, idea, general 중 하나
      "targetDbHint": "일정/캘린더 DB",
      "title": "치과 진료 방문",
      "summary": "내일 오후 3시 치과 예약",
      "suggestedIcon": "🦷",
      "tags": ["건강", "예약"],
      "properties": {
        "이름": "치과 진료 방문",
        "일정": "2026-09-18 15:00",
        "상태": "시작 전",
        "카테고리": "건강"
      }
    },
    {
      "id": "task-2",
      "intent": "expense",
      "targetDbHint": "가계부/지출 DB",
      "title": "점심 식사",
      "summary": "점심 식비 12,000원 결제",
      "suggestedIcon": "🍱",
      "tags": ["식비", "지출"],
      "properties": {
        "항목": "점심 식사",
        "금액": 12000,
        "날짜": "2026-09-17",
        "분류": "식비",
        "상태": "결제 완료"
      }
    }
  ]
}
`;

const VISION_SYSTEM_PROMPT = `
당신은 이미지 분석 및 OCR 정보 추출 전문가입니다.
사용자가 촬영하거나 업로드한 영수증, 명함, 도서/손글씨 메모 사진을 분석하여 알맞은 노션 데이터베이스 항목으로 변환하세요.

[이미지 유형별 추출 규칙]
1. 영수증 (receipt):
   - 상호명, 결제일시(YYYY-MM-DD), 결제 총금액(숫자), 품목 목록
   - intent: "expense", targetDbHint: "가계부/지출 DB", suggestedIcon: "🧾"
2. 명함 (business_card):
   - 이름, 회사명, 부서/직함, 전화번호/휴대폰, 이메일, 주소
   - intent: "contact", targetDbHint: "인맥/연락처 DB", suggestedIcon: "📇"
3. 도서 또는 손글씨 메모 (book_memo):
   - 핵심 인용 문장 또는 메모 본문, 도서명(추정 가능 시), 저자, 핵심 키워드
   - intent: "idea", targetDbHint: "독서/아이디어 DB", suggestedIcon: "📖"

[응답 JSON 규격]
순수 JSON 형식으로 응답하세요:
{
  "rawInput": "이미지 자동 인식 결과 요약",
  "correctedText": "정돈된 요약문",
  "detectedType": "receipt" | "business_card" | "book_memo",
  "tasks": [
    {
      "id": "task-1",
      "intent": "expense",
      "targetDbHint": "가계부/지출 DB",
      "title": "상호명 또는 핵심 제목",
      "summary": "핵심 요약 한 줄",
      "suggestedIcon": "🧾",
      "tags": ["태그1", "태그2"],
      "properties": {
        "이름": "상호명 또는 제목",
        "금액": 15000,
        "날짜": "2026-09-17",
        "분류": "식비/도서/인맥"
      }
    }
  ]
}
`;

/**
 * Gemini 모델 식별자 정규화:
 * 'models/gemini-1.5-flash' 처럼 접두사가 포함된 경우 'gemini-1.5-flash'로 정규화
 */
export function normalizeGeminiModel(model?: string): string {
  if (!model || typeof model !== 'string') return 'gemini-2.0-flash';
  const cleaned = model.replace(/^models\//, '').trim();
  return cleaned || 'gemini-2.0-flash';
}

// 2026년 기준 공식 권장 최신 모델 우선 배치 및 다단계 대체 모델 목록
const FALLBACK_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash'
];

/**
 * 프록시 및 Google API 직접 호출, 그리고 모델 404 발생 시 안전한 다단계 Fallback 실행 엔진
 */
async function callGeminiGenerateContentWithFallback(
  requestBody: any,
  apiKey: string,
  preferredModel?: string
): Promise<QuickCaptureAnalysisResult> {
  const normalizedPreferred = normalizeGeminiModel(preferredModel);
  // 중복 없는 모델 후보 배열 생성 (사용자 선호 모델 -> 2.0-flash -> 2.5-flash -> 1.5-flash-latest -> 1.5-flash)
  const candidateModels = Array.from(
    new Set([normalizedPreferred, ...FALLBACK_MODELS])
  );

  let lastError: any = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const currentModel = candidateModels[i];
    try {
      let res: Response | null = null;
      let usedDirect = false;

      // 1단계: /api/gemini 프록시 우선 호출
      try {
        const proxyRes = await fetch(`/api/gemini?model=${currentModel}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gemini-api-key': (apiKey || '').trim()
          },
          body: JSON.stringify(requestBody)
        });

        // 프록시 호출 성공 시
        if (proxyRes.ok) {
          res = proxyRes;
        } else {
          // 프록시가 응답을 반환했으나 404인 경우:
          // 내용물이 JSON이고 'not found' 에러이면 구글 API의 404 응답이므로 다음 모델로 즉각 Fallback
          const errBodyText = await proxyRes.text().catch(() => '');
          const isModelNotFound =
            proxyRes.status === 404 &&
            (errBodyText.includes('not found') ||
             errBodyText.includes('NOT_FOUND') ||
             errBodyText.includes('is not found for API version'));

          if (isModelNotFound && i < candidateModels.length - 1) {
            console.warn(
              `[QuickCapture] 프록시에서 모델 '${currentModel}' 404 NOT_FOUND 확인. 다음 대체 모델 '${candidateModels[i + 1]}'로 즉각 Fallback 합니다.`
            );
            continue;
          }

          // 프록시 라우트 미배포(정적 서빙 404 등)인 경우에만 다이렉트 호출 시도
          throw new Error(`PROXY_FAILED_${proxyRes.status}_${errBodyText}`);
        }
      } catch (proxyErr: any) {
        // 401 인증 실패는 모델 교체로 해결되지 않으므로 즉시 에러 발생
        if (proxyErr.message?.includes('401') || proxyErr.message?.includes('API Key')) {
          throw proxyErr;
        }

        // 2단계: 프록시 미지원 환경 대비 Google Gemini API 직접 호출 (URL에 ?key= 및 x-goog-api-key 동시 지원)
        usedDirect = true;
        const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey.trim()}`;
        try {
          res = await fetch(directUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey.trim()
            },
            body: JSON.stringify(requestBody)
          });
        } catch (directNetErr: any) {
          console.warn(`[QuickCapture] Direct API 네트워크 실패 (${currentModel}):`, directNetErr);
          // 네트워크 실패/CORS 시 다음 모델로 전환
          if (i < candidateModels.length - 1) {
            continue;
          }
          throw directNetErr;
        }
      }

      if (!res || !res.ok) {
        const errText = res ? await res.text().catch(() => '') : '응답 없음';
        const status = res ? res.status : 0;
        const isNotFound =
          status === 404 ||
          errText.includes('not found') ||
          errText.includes('is not found for API version') ||
          errText.includes('NOT_FOUND');

        if (isNotFound && i < candidateModels.length - 1) {
          const nextModel = candidateModels[i + 1];
          console.warn(
            `[QuickCapture] 모델 '${currentModel}' 404 미지원 (${usedDirect ? '직접호출' : '프록시'}). 대체 모델 '${nextModel}'로 Fallback 재시도합니다.`
          );
          lastError = new Error(`모델 '${currentModel}' 404 미지원: ${errText}`);
          continue;
        }

        throw new Error(`Gemini AI 분석 실패 (${status}): ${errText || '네트워크 오류'}`);
      }

      const data = await res.json();
      const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawJson) {
        throw new Error(`Gemini 모델(${currentModel})로부터 분석 결과를 수신하지 못했습니다.`);
      }

      try {
        return JSON.parse(rawJson);
      } catch {
        const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (err: any) {
      lastError = err;

      // API Key가 유효하지 않은 경우 즉시 에러 발생
      if (
        err.message?.includes('401') ||
        err.message?.includes('403') ||
        err.message?.includes('API_KEY_INVALID') ||
        err.message?.includes('API Key')
      ) {
        throw err;
      }

      // 그 외의 어떤 오류(404, Failed to fetch 등)라도 다음 후보 모델이 남아 있다면 포기하지 않고 다음 모델 시도
      if (i < candidateModels.length - 1) {
        const nextModel = candidateModels[i + 1];
        console.warn(
          `[QuickCapture] 모델 '${currentModel}' 처리 중 오류(${err.message}). 다음 모델 '${nextModel}'로 자동 Fallback 시도합니다.`
        );
        continue;
      }
    }
  }

  throw lastError || new Error('모든 Gemini 모델 Fallback 시도에 실패했습니다.');
}

/**
 * 1. 텍스트/음성 멀티 인텐트 분석 (Gemini 프록시 & Fallback 호출)
 */
export async function analyzeAndRouteQuickText(
  text: string,
  apiKey: string,
  preferredModel?: string
): Promise<QuickCaptureAnalysisResult> {
  if (!text || !text.trim()) {
    throw new Error('분석할 텍스트 내용이 비어 있습니다.');
  }

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `다음 음성/메모 내용을 분석하고 다중 작업으로 분할하세요:\n"${text}"` }]
      }
    ],
    systemInstruction: {
      parts: [{ text: ROUTING_SYSTEM_PROMPT }]
    },
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  };

  return await callGeminiGenerateContentWithFallback(requestBody, apiKey, preferredModel);
}

/**
 * 2. 이미지 멀티모달 Vision OCR 분석 (Gemini 프록시 & Fallback 호출)
 */
export async function analyzeImageWithGeminiVision(
  base64DataUrl: string,
  apiKey: string,
  preferredModel?: string
): Promise<QuickCaptureAnalysisResult> {
  const [header, base64Data] = base64DataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data
            }
          },
          {
            text: '이 이미지(영수증, 명함, 도서/메모 등)의 내용을 정확히 인식하고 규격화된 JSON 노션 속성으로 추출하세요.'
          }
        ]
      }
    ],
    systemInstruction: {
      parts: [{ text: VISION_SYSTEM_PROMPT }]
    },
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  };

  return await callGeminiGenerateContentWithFallback(requestBody, apiKey, preferredModel);
}

/**
 * 3. 분할된 각 작업을 사용자의 노션 워크스페이스에 즉시 생성
 */
export async function dispatchRoutedTasksToNotion(
  tasks: RoutedNotionTask[],
  notionApiKey: string,
  resource: CreatedNotionResource | null
): Promise<{ successCount: number; pageUrls: string[]; errors: string[] }> {
  // 모바일 Haptic 진동 피드백
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([40, 50, 70]);
    } catch {
      // ignore
    }
  }

  if (!notionApiKey || !resource || !resource.databases || resource.databases.length === 0) {
    // 노션 연동 전이거나 DB가 아직 없는 경우
    return {
      successCount: 0,
      pageUrls: [],
      errors: ['노션 워크스페이스 연동 정보가 없습니다. 상단에서 노션을 먼저 연동해 주세요.']
    };
  }

  const headers = {
    'Authorization': `Bearer ${notionApiKey.trim()}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  };

  const pageUrls: string[] = [];
  const errors: string[] = [];
  let successCount = 0;

  for (const task of tasks) {
    // 적합한 DB 매칭 탐색 (인텐트 기반 또는 키워드 매칭)
    let targetDb = resource.databases.find(d => {
      const name = d.name.toLowerCase();
      if (task.intent === 'schedule') return name.includes('일정') || name.includes('달력') || name.includes('시험') || name.includes('캘린더');
      if (task.intent === 'expense') return name.includes('가계부') || name.includes('지출') || name.includes('비용') || name.includes('소비');
      if (task.intent === 'todo') return name.includes('할 일') || name.includes('과제') || name.includes('태스크') || name.includes('스프린트');
      if (task.intent === 'contact') return name.includes('인맥') || name.includes('연락처') || name.includes('명함');
      if (task.intent === 'idea') return name.includes('아이디어') || name.includes('독서') || name.includes('메모') || name.includes('습관');
      return false;
    });

    // 매칭 실패 시 첫 번째 데이터베이스로 폴백
    if (!targetDb) {
      targetDb = resource.databases[0];
    }

    const payloadProperties: Record<string, any> = {
      title: {
        title: [{ type: 'text', text: { content: task.title } }]
      }
    };

    // 속성 매핑 (날짜, 상태, 태그, 메모 등)
    if (task.properties) {
      Object.entries(task.properties).forEach(([key, val]) => {
        if (key === '이름' || key === 'title') return;
        const strVal = String(val);

        if (key.includes('일정') || key.includes('날짜') || key.includes('date')) {
          payloadProperties[key] = {
            date: { start: strVal.split(' ')[0] }
          };
        } else if (key.includes('금액') || typeof val === 'number') {
          const num = Number(strVal.replace(/[^0-9.-]+/g, ''));
          if (!isNaN(num)) {
            payloadProperties[key] = { number: num };
          }
        } else if (key.includes('상태') || key.includes('status')) {
          payloadProperties[key] = {
            status: { name: strVal }
          };
        } else {
          payloadProperties[key] = {
            rich_text: [{ type: 'text', text: { content: strVal } }]
          };
        }
      });
    }

    const pagePayload: Record<string, any> = {
      parent: { database_id: targetDb.id },
      icon: {
        type: 'emoji',
        emoji: task.suggestedIcon || '⚡'
      },
      properties: payloadProperties,
      children: [
        {
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: [
              {
                type: 'text',
                text: { content: `⚡ 1초 퀵 캡처 자동 등록: ${task.summary || task.title}` }
              }
            ],
            icon: { type: 'emoji', emoji: task.suggestedIcon || '⚡' },
            color: 'gray_background'
          }
        }
      ]
    };

    try {
      let res = await fetch('/api/notion/v1/pages', {
        method: 'POST',
        headers,
        body: JSON.stringify(pagePayload)
      });

      // 404 NOT_FOUND 감지 시 Next.js / Vercel 쿼리 엔드포인트로 즉시 2차 재시도
      if (!res.ok && res.status === 404) {
        res = await fetch('/api/notion?path=v1/pages', {
          method: 'POST',
          headers,
          body: JSON.stringify(pagePayload)
        });
      }

      if (res.ok) {
        const pageData = await res.json();
        successCount++;
        if (pageData.url) pageUrls.push(pageData.url);
      } else {
        const errJson = await res.json().catch(() => ({}));
        errors.push(`[${task.title}] 노션 전송 실패 (${res.status}): ${errJson.message || '데이터베이스 속성 규격 불일치'}`);
      }
    } catch (e: any) {
      errors.push(`[${task.title}] 통신 에러: ${e.message || '네트워크 연결 실패'}`);
    }
  }

  return { successCount, pageUrls, errors };
}
