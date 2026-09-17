import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Database
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setCurrentView, selectedModel, notionApiKey, createdNotionResource } = useApp();

  const isNotionConnected = Boolean(notionApiKey && createdNotionResource);

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-y-auto bg-neutral-50 dark:bg-notion-dark-bg text-neutral-900 dark:text-white select-none">
      
      {/* 1. 히어로 헤더 섹션 */}
      <div className="relative overflow-hidden border-b border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-notion-dark-card py-10 sm:py-14 px-4 sm:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-emerald-500/5 to-blue-500/5 dark:from-amber-500/10 dark:via-emerald-500/10 dark:to-blue-500/10 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto space-y-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>v2.0 Architecture Hub</span>
            </span>

            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              <Cpu className="w-3.5 h-3.5" />
              <span>엔진: {selectedModel}</span>
            </span>

            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              <Database className="w-3.5 h-3.5" />
              <span>{isNotionConnected ? '노션 워크스페이스 연결됨' : '노션 연결 대기'}</span>
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Notion AI Master Workspace <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-emerald-500 to-blue-600">v2.0</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
              기존 v1 템플릿 빌더를 온전히 보존하고, <strong className="text-neutral-900 dark:text-white">3대 독립 작업실</strong>과 통합 허브로 새롭게 진화했습니다. 원하는 작업실을 선택해 즉시 작업을 시작하세요.
            </p>
          </div>
        </div>
      </div>

      {/* 2. 3대 독립 작업실 대형 대시보드 카드 그리드 */}
      <div className="max-w-6xl mx-auto w-full p-4 sm:p-8 space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight flex items-center space-x-2">
                <span>🎯 3대 독립 작업실 바로가기</span>
              </h2>
              <p className="text-xs text-neutral-500">목적에 맞게 분리된 특화 작업 공간으로 즉시 입장합니다.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            
            {/* 카드 1: ✨ 노션 템플릿 빌더 (v1 격리 보존) */}
            <div 
              onClick={() => setCurrentView('builder')}
              className="group relative bg-white dark:bg-notion-dark-card rounded-3xl p-6 sm:p-7 border border-neutral-200/80 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden hover:-translate-y-1"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-2xl">
                    ✨
                  </div>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <ShieldCheck className="w-3 h-3" />
                    <span>v1 핵심 보존</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                    노션 템플릿 빌더
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    AI 대화형 프롬프트로 맞춤형 노션 템플릿을 제작하고, 실시간 반응형 프리뷰와 Formula 2.0 수식을 연동합니다.
                  </p>
                </div>

                <ul className="space-y-1 text-[11px] text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>SplitLayout 2분할 실시간 렌더링</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>엑셀/PDF/이미지 멀티포맷 역설계</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>노션 API 원클릭 원격 워크스페이스 배포</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 relative z-10">
                <div className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center justify-between group-hover:bg-amber-600 dark:group-hover:bg-amber-400 dark:group-hover:text-neutral-900 transition">
                  <span>빌더 작업실 입장</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>

            {/* 카드 2: 🌿 라이프 허브 */}
            <div 
              onClick={() => setCurrentView('life')}
              className="group relative bg-white dark:bg-notion-dark-card rounded-3xl p-6 sm:p-7 border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden hover:-translate-y-1"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl">
                    🌿
                  </div>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span>일상 & 생산성</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    라이프 허브
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    스마트 일정, 이메일 AI 브리핑, 가계부 지출 내역, 데일리 우선순위 할 일을 한곳에서 체계적으로 관리합니다.
                  </p>
                </div>

                <ul className="space-y-1 text-[11px] text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Google Calendar / 노션 캘린더 동기화</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>이메일 핵심 요약 및 긴급 액션 자동 추출</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>소비 지출 카테고리 시각화 통계</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 relative z-10">
                <div className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center justify-between group-hover:bg-emerald-600 dark:group-hover:bg-emerald-400 dark:group-hover:text-neutral-900 transition">
                  <span>라이프 허브 입장</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>

            {/* 카드 3: 💻 개발 랩 */}
            <div 
              onClick={() => setCurrentView('devlab')}
              className="group relative bg-white dark:bg-notion-dark-card rounded-3xl p-6 sm:p-7 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden hover:-translate-y-1"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-2xl">
                    💻
                  </div>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <span>엔지니어링 Studio</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    개발 랩
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    새로운 기술 아이디어 기획, 버그 트러블슈팅 일지, 그리고 Gemini 시스템 프롬프트 라이브러리를 보관합니다.
                  </p>
                </div>

                <ul className="space-y-1 text-[11px] text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>개발 백로그 및 기술 스택 아카이브</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>API 및 인프라 장애 원인/해결책 기록</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>원클릭 AI 시스템 프롬프트 복사 엔진</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 relative z-10">
                <div className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center justify-between group-hover:bg-blue-600 dark:group-hover:bg-blue-400 dark:group-hover:text-neutral-900 transition">
                  <span>개발 랩 입장</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3. 하단 퀵 유틸리티 바 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-200/80 dark:border-neutral-800">
          
          <div 
            onClick={() => setCurrentView('quick_capture')}
            className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-notion-dark-card hover:border-rose-300 dark:hover:border-rose-700 transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">⚡ 1초 퀵 캡처 허브</h4>
                <p className="text-[11px] text-neutral-500">모바일 음성 말하기 또는 영수증 사진 한 장으로 1초 노션 전송</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400" />
          </div>

          <div 
            onClick={() => setCurrentView('dashboard')}
            className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-notion-dark-card hover:border-blue-300 dark:hover:border-blue-700 transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">📑 템플릿 보관함 & 스마트 사서</h4>
                <p className="text-[11px] text-neutral-500">월간 TOP 50 프리셋 둘러보기 및 노션 전수 검색 AI 사서 Q&A</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomePage;
