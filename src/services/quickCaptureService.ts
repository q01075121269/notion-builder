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
 * 1. 텍스트/음성 멀티 인텐트 분석 (Gemini 프록시 호출)
 */
export async function analyzeAndRouteQuickText(
  text: string,
  apiKey: string
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

  const res = await fetch('/api/gemini?model=gemini-1.5-flash', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gemini-api-key': apiKey || ''
    },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini AI 분석 실패 (${res.status}): ${errText || '네트워크 오류'}`);
  }

  const data = await res.json();
  const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawJson) {
    throw new Error('Gemini로부터 분석 결과를 수신하지 못했습니다.');
  }

  try {
    return JSON.parse(rawJson);
  } catch {
    const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
}

/**
 * 2. 이미지 멀티모달 Vision OCR 분석 (Gemini 프록시 호출)
 */
export async function analyzeImageWithGeminiVision(
  base64DataUrl: string,
  apiKey: string
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

  const res = await fetch('/api/gemini?model=gemini-1.5-flash', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gemini-api-key': apiKey || ''
    },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini Vision 분석 실패 (${res.status}): ${errText || '네트워크 오류'}`);
  }

  const data = await res.json();
  const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawJson) {
    throw new Error('Gemini Vision으로부터 분석 결과를 수신하지 못했습니다.');
  }

  try {
    return JSON.parse(rawJson);
  } catch {
    const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
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
      const res = await fetch('/api/notion/v1/pages', {
        method: 'POST',
        headers,
        body: JSON.stringify(pagePayload)
      });

      if (res.ok) {
        const pageData = await res.json();
        successCount++;
        if (pageData.url) pageUrls.push(pageData.url);
      } else {
        const errJson = await res.json().catch(() => ({}));
        errors.push(`[${task.title}] 전송 실패: ${errJson.message || 'API 거절'}`);
      }
    } catch (e: any) {
      errors.push(`[${task.title}] 네트워크 에러: ${e.message}`);
    }
  }

  return { successCount, pageUrls, errors };
}
