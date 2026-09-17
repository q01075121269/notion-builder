import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  Mail, 
  CreditCard, 
  CheckSquare, 
  ArrowLeft, 
  Clock, 
  Plus, 
  Bot
} from 'lucide-react';

type LifeHubTab = 'schedule' | 'email' | 'expense' | 'todo';

export const LifePage: React.FC = () => {
  const { setCurrentView, notionApiKey, createdNotionResource } = useApp();
  const [activeTab, setActiveTab] = useState<LifeHubTab>('schedule');

  // 더미 상태 및 프리뷰 데이터
  const [scheduleItems] = useState([
    { id: 's1', title: '치과 정기 검진', date: '2026-09-19 15:00', dday: 'D-1', category: '건강', icon: '🦷' },
    { id: 's2', title: 'Q3 프로젝트 최종 릴리즈 회의', date: '2026-09-22 10:30', dday: 'D-4', category: '업무', icon: '💼' },
    { id: 's3', title: '부모님 생신 저녁 식사', date: '2026-09-26 18:30', dday: 'D-8', category: '가족', icon: '🎂' }
  ]);

  const [emailSummaries] = useState([
    { id: 'e1', sender: 'GitHub', subject: '[Security] New sign-in detected', summary: '새로운 브라우저에서 로그인 감지됨. 본인 확인 권장', time: '10분 전', important: true },
    { id: 'e2', sender: 'Google Cloud Billing', subject: '2026년 8월 결제 영수증 발행 안내', summary: '총 청구금액 12,400원 정상 결제 완료', time: '2시간 전', important: false },
    { id: 'e3', sender: 'Notion Team', subject: 'Notion 3.0 신규 업데이트 및 AI 기능 발표', summary: '새로운 수식 라이브러리와 스마트 사서 기능 공개', time: '어제', important: true }
  ]);

  const [expenseItems] = useState([
    { id: 'ex1', title: '점심 식사 (구내식당)', amount: 9000, date: '2026-09-18', category: '식비', icon: '🍱' },
    { id: 'ex2', title: '지하철 정기권 충전', amount: 55000, date: '2026-09-17', category: '교통', icon: '🚇' },
    { id: 'ex3', title: '업무용 도서 구입 (클린 코드)', amount: 28000, date: '2026-09-16', category: '도서', icon: '📚' }
  ]);

  const [todoItems, setTodoItems] = useState([
    { id: 't1', title: 'v2.0 라우트 분리 작업 완료 및 배포', done: true, priority: '🔥 긴급' },
    { id: 't2', title: '주간 업무 결산 리포트 작성', done: false, priority: '⭐ 보통' },
    { id: 't3', title: '헬스장 하체 운동 40분', done: false, priority: '☕ 여유' },
    { id: 't4', title: '전기세 및 공과금 자동이체 확인', done: true, priority: '⭐ 보통' }
  ]);

  const toggleTodo = (id: string) => {
    setTodoItems(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const isNotionConnected = Boolean(notionApiKey && createdNotionResource);

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-y-auto bg-neutral-50 dark:bg-notion-dark-bg text-neutral-900 dark:text-white">
      {/* 상단 서브 헤더 네비게이션 */}
      <div className="sticky top-0 z-20 px-4 sm:px-8 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800 bg-white/90 dark:bg-notion-dark-bg/90 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>홈으로</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🌿</span>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight">라이프 허브 (Life Hub)</h1>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">일상 생활의 모든 일정, 이메일, 지출, 할 일을 노션과 동기화</p>
            </div>
          </div>
        </div>

        {/* 노션 연동 상태 */}
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            isNotionConnected
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isNotionConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isNotionConnected ? '노션 DB 동기화 활성' : '노션 연결 대기'}</span>
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full p-4 sm:p-8 space-y-6">
        {/* 4대 서브 섹션 탭 네비게이션 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-200/60 dark:bg-neutral-800/60 p-1.5 rounded-2xl border border-neutral-200 dark:border-neutral-700/60">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>스마트 일정</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">3</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'email'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4 text-purple-500" />
            <span>이메일 AI 요약</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">신규</span>
          </button>

          <button
            onClick={() => setActiveTab('expense')}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'expense'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span>가계부 & 지출</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">9.2만</span>
          </button>

          <button
            onClick={() => setActiveTab('todo')}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'todo'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-amber-500" />
            <span>스마트 할 일</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">50%</span>
          </button>
        </div>

        {/* 탭별 메인 컨텐츠 영역 */}
        <div className="bg-white dark:bg-notion-dark-card rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* 1. 스마트 일정 */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span>스마트 일정 관리</span>
                  </h2>
                  <p className="text-xs text-neutral-500">Google Calendar 및 노션 캘린더 DB와 자동 연동된 일정입니다.</p>
                </div>
                <button 
                  onClick={() => setCurrentView('quick_capture')}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>음성으로 일정 등록</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scheduleItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/50 hover:border-blue-300 dark:hover:border-blue-700 transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        {item.dday}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 mb-1">{item.title}</h3>
                    <p className="text-xs text-neutral-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.date}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. 이메일 AI 요약 */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-purple-500" />
                    <span>이메일 AI 브리핑 및 액션 추출</span>
                  </h2>
                  <p className="text-xs text-neutral-500">수신된 메일 중 핵심 요약과 즉시 처리할 태스크를 Gemini가 자동 분류합니다.</p>
                </div>
                <span className="inline-flex items-center space-x-1 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-3 py-1 rounded-full font-semibold">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Gemini 3.6 Flash 분석 중</span>
                </span>
              </div>

              <div className="space-y-3">
                {emailSummaries.map((mail) => (
                  <div key={mail.id} className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/40 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/80 transition flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{mail.sender}</span>
                        {mail.important && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                            중요
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-400">{mail.time}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{mail.subject}</h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 bg-white/60 dark:bg-neutral-950/40 p-2 rounded-xl border border-neutral-200/50 dark:border-neutral-800/60">
                        ⚡ AI 요약: {mail.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. 가계부 & 지출 */}
          {activeTab === 'expense' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-emerald-500" />
                    <span>가계부 및 소비 분석</span>
                  </h2>
                  <p className="text-xs text-neutral-500">영수증 카메라 OCR 및 1초 퀵 캡처로 등록된 지출 내역입니다.</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-neutral-400">이번 달 총 지출</span>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">92,000원</div>
                </div>
              </div>

              <div className="space-y-3">
                {expenseItems.map((ex) => (
                  <div key={ex.id} className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/40 dark:bg-neutral-900/40">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{ex.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{ex.title}</div>
                        <div className="text-[11px] text-neutral-400">{ex.date} · {ex.category}</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-white">
                      -{ex.amount.toLocaleString()}원
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. 스마트 할 일 */}
          {activeTab === 'todo' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center space-x-2">
                    <CheckSquare className="w-5 h-5 text-amber-500" />
                    <span>스마트 할 일 (Task Manager)</span>
                  </h2>
                  <p className="text-xs text-neutral-500">오늘 완료해야 할 작업과 우선순위 체크리스트</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-neutral-500">
                    완료: {todoItems.filter(t => t.done).length} / {todoItems.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {todoItems.map((todo) => (
                  <div
                    key={todo.id}
                    onClick={() => toggleTodo(todo.id)}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                      todo.done
                        ? 'bg-neutral-100/50 dark:bg-neutral-900/20 border-neutral-200/50 dark:border-neutral-800/40 opacity-70'
                        : 'bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={todo.done}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                      />
                      <span className={`text-xs font-medium ${todo.done ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                        {todo.title}
                      </span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                      {todo.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LifePage;
