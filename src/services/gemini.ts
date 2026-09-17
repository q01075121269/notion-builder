import type { NotionTemplate, GeminiConversationResponse } from '../types/notion';
import type { GeminiModelType, ChatMessage } from '../types/chat';
import type { AttachedFile } from '../types/fileAttachment';
import { getAuthSession, isUserAdmin } from './authStorage';

const MASTER_SYSTEM_PROMPT = `
[역할]
너는 'Notion AI Master Builder'의 총괄 전담 비서이자 시스템 컨트롤러야.
사용자가 노션이나 컴퓨터를 잘 모르더라도 언제든지 쉽고 편리하게 서비스를 활용할 수 있도록 친절하고 명확하게 안내하고 완벽한 노션 템플릿을 제작해야 해.

[숙지 아키텍처]
너는 이 웹 프로그램의 모든 핵심 기능과 파이프라인을 완전히 이해하고 있어:
1. 빌더 엔진: 노션 표준 규격(제목, 아이콘, 커버, DB 스키마, 블록) JSON 데이터 생성 및 실시간 미리보기 렌더링, Notion API 실시간 연동 배포, 대화형 부분 수정(Diff & Patch), 샘플 더미 데이터 자동 삽입, Formula 2.0 수식 자동화, 템플릿 다이어트 모드.
2. 퀵 캡처 허브: 스마트폰 모바일 최적화 1초 기록 허브, 음성(STT) 분할 라우팅, 카메라 OCR(비전 분석), 거친 메모 자동 교정 및 노션 데이터베이스 즉시 전송.
3. 사서 & 결산: 노션 전수 검색(Workspace RAG Q&A)을 통한 사실 기반 출처 링크 제공, 주간/월간 활동 집계 및 비주얼 AI 결산 리포트 노션 페이지 자동 발행.
4. 멀티 파서: 엑셀(.xlsx, .xls, .csv), 워드(.docx), PDF, 텍스트 문서 및 이미지 캡처본/스케치를 분석하여 노션 템플릿과 데이터베이스로 1:1 역설계.
5. 초보자 가이드: Mermaid.js 다이어그램, 일상 언어로 변환된 초보자 맞춤형 설명서 노션 토글 블록 자동 삽입.

[응답 규칙 - 지능형 2대 모드 분기]

▶ 모드 A (사용법 질문, 일반 대화, 조언 및 가이드):
사용자가 서비스 이용법, 조언, 추천을 구하거나 일반적인 질문(예: "노션 API 키 어떻게 발급받아?", "이 프로그램 기능이 뭐야?", "대학생용 템플릿 어떻게 구성하면 좋아?")을 할 때는:
- 절대 JSON을 출력하지 마세요!
- 컴퓨터 초보자나 어르신도 바로 따라 할 수 있는 친절하고 명확한 한국어 구어체 마크다운 텍스트로 자세하고 따뜻하게 설명하세요.
- 필요 시 글머리 기호나 단계별 안내(1단계, 2단계...)를 활용하세요.

▶ 모드 B (템플릿 제작, 수정, 파일 기반 생성 명령 수행):
사용자가 구체적인 템플릿 제작/수정 요청("~ 만들어줘", "~ 추가해줘", "다이어트해줘", "이 엑셀 표로 DB 만들어줘" 등)을 하거나 파일을 첨부하여 역설계를 요청할 때는:
- 부가적인 인사말 없이 오직 정의된 표준 JSON 규격으로만 응답하여 프론트엔드 빌더와 노션 API를 구동시키세요:

규격 1. 신규 템플릿 생성 모드 (CREATE_NEW)
{
  "mode": "CREATE_NEW",
  "explanation": "템플릿 설계 의도와 핵심 기능에 대한 친절한 설명 (2~3문장)",
  "template": {
    "title": "템플릿 제목",
    "icon": "추천 이모지 (1개)",
    "cover_query": "영문 검색 키워드 3단어",
    "description": "간결한 소개글",
    "databases": [
      {
        "name": "DB 이름",
        "description": "DB 용도",
        "view_type": "table", // table, board, calendar
        "properties": [
          {"name": "이름", "type": "title"},
          {"name": "마감 일정", "type": "date"}, // 캘린더 연동용
          {"name": "상태", "type": "status", "options": ["시작 전", "진행 중", "완료"]},
          {"name": "진행률(수식)", "type": "formula", "expression": "ifs(prop(\\"상태\\") == \\"완료\\", \\"■■■■■ 100% 🟢\\", prop(\\"상태\\") == \\"진행 중\\", \\"■■■□□ 60% 🟡\\", \\"□□□□□ 0% ⚪\\")"},
          {"name": "남은 일수(D-Day)", "type": "formula", "expression": "ifs(empty(prop(\\"마감 일정\\")), \\"일정 미정\\", dateBetween(dateStart(prop(\\"마감 일정\\")), now(), \\"days\\") < 0, \\"기한 초과 ⚠️\\", dateBetween(dateStart(prop(\\"마감 일정\\")), now(), \\"days\\") == 0, \\"D-Day 🔥\\", \\"D-\\" + dateBetween(dateStart(prop(\\"마감 일정\\")), now(), \\"days\\") + \\"일\\")"},
          {"name": "중요도", "type": "select", "options": ["🔥 긴급", "⭐ 보통", "☕ 여유"]}
        ],
        "sample_rows": [
          {
            "이름": "예시 항목 1 (구체적 실무 내용)",
            "마감 일정": "2026-09-25",
            "상태": "진행 중",
            "진행률(수식)": "■■■□□ 60% 🟡",
            "남은 일수(D-Day)": "D-8일",
            "중요도": "🔥 긴급"
          },
          {
            "이름": "예시 항목 2 (두 번째 실무 내용)",
            "마감 일정": "2026-10-02",
            "상태": "시작 전",
            "진행률(수식)": "□□□□□ 0% ⚪",
            "남은 일수(D-Day)": "D-15일",
            "중요도": "⭐ 보통"
          },
          {
            "이름": "예시 항목 3 (완료된 샘플)",
            "마감 일정": "2026-09-15",
            "상태": "완료",
            "진행률(수식)": "■■■■■ 100% 🟢",
            "남은 일수(D-Day)": "완료됨",
            "중요도": "☕ 여유"
          }
        ]
      }
    ],
    "page_layout": [
      {"type": "callout", "icon": "💡", "color": "blue", "content": "핵심 워크플로우 안내"},
      {"type": "column_list", "columns": [...]},
      {"type": "toggle", "title": "📖 빠른 사용 안내", "blocks": [...]}
    ]
  }
}

규격 2. 부분 수정 모드 (PATCH_UPDATE)
{
  "mode": "PATCH_UPDATE",
  "action": "UPDATE_DATABASE" 또는 "ADD_BLOCK" 또는 "UPDATE_PAGE" 또는 "DELETE_BLOCK",
  "target": "database" 또는 "page_layout" 또는 "page_meta",
  "target_id": "수정 대상 데이터베이스의 정확한 이름",
  "changes": {
    "new_properties": [...],
    "blocks_to_append": [...],
    "updated_title": "...",
    "updated_icon": "..."
  },
  "updated_template": {
    // 기존 템플릿의 내용에 변경사항을 병합한 전체 템플릿 객체
  },
  "explanation": "변경 내용 요약 및 친절한 안내"
}

[노션 최신 Formula 2.0 수식 라이브러리 가이드]
유료 자동화 플랜 없이도 상태와 진행률이 시각화되도록, 데이터베이스 설계 시 아래 노션 최신 Formula 2.0 패턴을 적극 활용하세요:
- 유니코드 진행률 게이지: ifs(prop("상태") == "완료", "■■■■■ 100% 🟢", prop("상태") == "진행 중", "■■■□□ 60% 🟡", "□□□□□ 0% ⚪")
- D-Day 자동 계산: ifs(empty(prop("마감 일정")), "일정 미정", dateBetween(dateStart(prop("마감 일정")), now(), "days") < 0, "기한 초과 ⚠️", dateBetween(dateStart(prop("마감 일정")), now(), "days") == 0, "D-Day 🔥", "D-" + dateBetween(dateStart(prop("마감 일정")), now(), "days") + "일")
- 중요도/상태 배지: ifs(prop("중요도") == "긴급", "🚨 긴급", prop("중요도") == "보통", "⚡ 보통", "☕ 여유")

[멀티 포맷 파일 파싱 및 비전 역설계 지침]
1. 스프레드시트(Excel, CSV) 첨부 시:
   - 함께 제공된 [참조 파일 분석 데이터]의 표 구조와 열 헤더를 100% 반영하여 Notion Database properties를 설계하세요.
   - 엑셀 수식(=SUM, =AVERAGE, =A2/B2 등)이 감지되면, 이를 Notion Formula 2.0 수식(prop("열명") 활용)으로 완벽하게 전환하세요.
   - 엑셀의 실제 행 데이터를 sample_rows에 3~5개 이상 충실하게 복원하세요.
2. 워드/PDF/텍스트 문서 첨부 시:
   - 문서의 H1/H2 제목 계층과 불릿 리스트를 Notion page_layout(heading_1, heading_2, bulleted_list_item, callout)으로 구조화하세요.
3. 이미지(캡처본, 스케치) 첨부 시 (Vision 역설계):
   - 이미지의 시각적 레이아웃(좌우 2단/3단 분할, 상단 통계 콜아웃 상자, 헤더 배치)을 식별하여 그대로 재현하세요.
   - 화면에 표시된 뷰 타입(표, 칸반 보드, 캘린더, 갤러리)을 정확히 일치시켜 데이터베이스를 구성하세요.
   - 캡처 이미지의 디자인 톤(미니멀, 모던 대시보드, 다이어리 감성)에 맞추어 적절한 이모지와 커버 키워드를 매핑하세요.

[필수 규칙]
- 모드 B로 응답할 때는 마크다운 따옴표('''json)나 부가 텍스트 없이 유효한 순수 JSON 문자열만 출력하세요.
- 모든 데이터베이스에는 반드시 3~5개의 구체적인 sample_rows(실제 예시 데이터)를 필수로 포함하세요.
- 모든 설명과 텍스트는 한국어로 작성하세요.
`;

/**
 * 대화 컨텍스트(현재 템플릿, 첨부 파일, 대화 히스토리)를 포함하여 Gemini에 요청하고
 * 신규 생성(CREATE_NEW), 부분 수정(PATCH_UPDATE) 또는 일반 대화 가이드(CONVERSATION_GUIDE) 결과를 반환합니다.
 */
export async function processConversationWithGemini(
  prompt: string,
  apiKey: string,
  currentTemplate: NotionTemplate | null,
  model: GeminiModelType = 'gemini-1.5-flash',
  attachedFiles: AttachedFile[] = [],
  chatHistory: ChatMessage[] = []
): Promise<GeminiConversationResponse> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API 키가 설정되지 않았습니다. 상단 네비게이션의 🔑 [API 키 설정] 버튼을 눌러 키를 입력해 주세요.');
  }

  const targetModel = model || 'gemini-1.5-flash';

  // 1. 첨부 파일 분석 텍스트 블록 구성
  let filesContextBlock = '';
  const parsedDocs = attachedFiles.filter(f => f.parsedContent && f.category !== 'image');
  if (parsedDocs.length > 0) {
    filesContextBlock += '\n\n[참조 파일 분석 데이터 (사용자가 업로드한 문서)]:\n';
    parsedDocs.forEach((file, idx) => {
      filesContextBlock += `\n--- 파일 #${idx + 1}: ${file.name} (${file.category}, ${file.sizeFormatted}) ---\n`;
      filesContextBlock += file.parsedContent + '\n';
    });
    filesContextBlock += '\n위 파일에 기재된 데이터 구조, 표 양식, 수식, 본문 계층을 우선적으로 템플릿에 충실히 반영하세요.\n';
  }

  // 2. 현재 사용자 프롬프트 텍스트 파트 구성
  let userContentText = `[사용자 요청]: "${prompt}"`;
  if (filesContextBlock) {
    userContentText = `${filesContextBlock}\n\n${userContentText}`;
  }

  if (currentTemplate) {
    userContentText += `\n\n[현재 활성화된 기존 노션 템플릿 구조]:\n${JSON.stringify(currentTemplate, null, 2)}`;
    userContentText += `\n\n위 사용자 요청 및 첨부 파일이 사용법 질문(모드 A)인지, 기존 템플릿 부분 수정(PATCH_UPDATE)인지, 아니면 완전히 새로운 템플릿 요청(CREATE_NEW)인지 판단하여 응답하세요.`;
  }

  // 3. 현재 턴의 Parts 구성 (텍스트 + 첨부 이미지 inlineData)
  const currentTurnParts: any[] = [{ text: userContentText }];

  const imageFiles = attachedFiles.filter(f => f.category === 'image' && f.base64);
  imageFiles.forEach(img => {
    currentTurnParts.push({
      inlineData: {
        mimeType: img.mimeType || 'image/png',
        data: img.base64
      }
    });
  });

  // 4. 멀티턴 대화 히스토리 (Context Window) 구성
  const contents: Array<{ role: 'user' | 'model'; parts: any[] }> = [];

  // 이전 대화 기록 중 최근 6개 추출 (단, 로딩 중이거나 에러 메시지는 제외)
  const validHistory = chatHistory
    .filter(m => !m.isLoading && !m.error && m.content.trim() && m.id !== 'msg-welcome')
    .slice(-6);

  // Gemini API 규칙: contents 배열은 반드시 'user' 턴으로 시작해야 함
  let firstUserFound = false;
  validHistory.forEach(msg => {
    if (msg.role === 'user') firstUserFound = true;
    if (firstUserFound) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }
  });

  // 현재 턴 추가
  contents.push({
    role: 'user',
    parts: currentTurnParts
  });

  const requestBody = {
    contents,
    systemInstruction: {
      parts: [{ text: MASTER_SYSTEM_PROMPT }]
    },
    generationConfig: {
      temperature: 0.7,
      topP: 0.95
    }
  };

  // [보안 감사 1]: 미인가 계정의 내부 API 호출 원천 차단 (Auth Session 및 Whitelist 검증)
  const sessionUser = getAuthSession();
  if (!sessionUser) {
    throw new Error('인증되지 않은 사용자입니다. 로그인 후 Gemini API를 호출할 수 있습니다.');
  }
  if (!isUserAdmin(sessionUser.email)) {
    throw new Error('접근 권한이 없습니다. 승인된 관리자 계정으로 로그인해 주세요.');
  }

  // [보안 격리]: 브라우저 네트워크 URL 쿼리에 API 키 노출 방지를 위해 /api/gemini 프록시 우선 호출
  let response: Response;
  const userEmail = sessionUser.email || '';
  try {
    response = await fetch(`/api/gemini?model=${targetModel}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-api-key': apiKey.trim(),
        'x-user-email': userEmail
      },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok && response.status === 404) {
      throw new Error('404_FALLBACK');
    }
  } catch {
    // 프록시 미지원 환경 대비 직접 호출 폴백 (URL에 키 노출 없이 x-goog-api-key 헤더 방식 사용)
    const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent`;
    response = await fetch(directUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey.trim()
      },
      body: JSON.stringify(requestBody)
    });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `API 요청 실패 (HTTP ${response.status})`;
    throw new Error(message);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini API로부터 응답을 받지 못했습니다.');
  }

  return parseGeminiConversationResponse(rawText, currentTemplate);
}

/**
 * 응답 파서: 모드 A(일반 텍스트 안내)와 모드 B(CREATE_NEW / PATCH_UPDATE JSON)를 유연하게 판별
 */
function parseGeminiConversationResponse(
  rawText: string,
  fallbackTemplate: NotionTemplate | null
): GeminiConversationResponse {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
  }

  // JSON이 아니거나 일반 대화/가이드 응답(모드 A)인 경우
  if (!cleaned.startsWith('{')) {
    return {
      mode: 'CONVERSATION_GUIDE',
      explanation: rawText.trim()
    };
  }

  try {
    const parsed = JSON.parse(cleaned);

    // 모드 A 명시적 반환
    if (parsed.mode === 'CONVERSATION_GUIDE') {
      return {
        mode: 'CONVERSATION_GUIDE',
        explanation: parsed.explanation || parsed.text || rawText.trim()
      };
    }

    // 1. PATCH_UPDATE 모드인 경우
    if (parsed.mode === 'PATCH_UPDATE') {
      const updatedTemplate: NotionTemplate = parsed.updated_template || fallbackTemplate || {
        title: '수정된 노션 템플릿',
        icon: '📑',
        cover_query: 'minimal aesthetic workspace',
        cover_url: getCoverImageUrl('workspace'),
        databases: [],
        page_layout: []
      };

      if (!updatedTemplate.cover_url) {
        updatedTemplate.cover_url = getCoverImageUrl(updatedTemplate.cover_query || 'workspace');
      }

      return {
        mode: 'PATCH_UPDATE',
        action: parsed.action || 'UPDATE_DATABASE',
        target: parsed.target || 'database',
        target_id: parsed.target_id,
        changes: parsed.changes || {},
        updated_template: updatedTemplate,
        explanation: parsed.explanation || '요청하신 변경사항을 템플릿에 반영했습니다.'
      };
    }

    // 2. CREATE_NEW 모드이거나 템플릿 직접 반환 형태인 경우
    const templateSource = parsed.template || parsed;
    const newTemplate: NotionTemplate = {
      title: templateSource.title || '새로운 노션 템플릿',
      icon: templateSource.icon || '📑',
      cover_query: templateSource.cover_query || 'minimal aesthetic workspace',
      cover_url: getCoverImageUrl(templateSource.cover_query || 'workspace'),
      description: templateSource.description || 'AI로 설계된 맞춤형 노션 템플릿입니다.',
      databases: Array.isArray(templateSource.databases) ? templateSource.databases : [],
      page_layout: Array.isArray(templateSource.page_layout) ? templateSource.page_layout : [],
      created_at: new Date().toISOString()
    };

    return {
      mode: 'CREATE_NEW',
      template: newTemplate,
      explanation: parsed.explanation || `✨ "${newTemplate.title}" 템플릿 구조를 새롭게 설계했습니다!`
    };
  } catch (err) {
    console.warn('[Gemini Parser] Fallback to conversation guide mode:', err);
    // JSON 파싱 실패 시 크래시 없이 친절한 일반 텍스트 응답으로 안전하게 전환
    return {
      mode: 'CONVERSATION_GUIDE',
      explanation: rawText.trim()
    };
  }
}

// 1단계 하위 호환용 래퍼 함수
export async function generateNotionTemplate(
  prompt: string,
  apiKey: string,
  model: GeminiModelType = 'gemini-1.5-flash'
): Promise<NotionTemplate> {
  const result = await processConversationWithGemini(prompt, apiKey, null, model);
  if (result.mode === 'CREATE_NEW') {
    return result.template;
  }
  if (result.mode === 'PATCH_UPDATE') {
    return result.updated_template;
  }
  throw new Error('템플릿을 생성하지 못했습니다.');
}

export function getCoverImageUrl(query: string = 'workspace'): string {
  const images = [
    'https://images.unsplash.com/photo-1507842229451-7f01be8860ee?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80'
  ];

  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    hash = (hash << 5) - hash + query.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % images.length;
  return images[index];
}
