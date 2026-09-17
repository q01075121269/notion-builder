import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Key, 
  Moon, 
  Sun, 
  Sparkles, 
  Code2, 
  Share2, 
  RotateCcw,
  Bot,
  Layers,
  Calendar,
  BookOpen,
  Zap,
  Menu,
  X,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { UserProfileDropdown } from '../auth/UserProfileDropdown';
import type { GeminiModelType } from '../../types/chat';

export const Navbar: React.FC = () => {
  const {
    authUser,
    logout,
    isDark,
    toggleDarkMode,
    selectedModel,
    setSelectedModel,
    apiKey,
    setIsApiKeyModalOpen,
    notionApiKey,
    notionParentPageId,
    setIsNotionSettingsModalOpen,
    setIsRawJsonModalOpen,
    setIsExportModalOpen,
    resetToDefault,
    currentView,
    setCurrentView,
    setIsGoogleSyncModalOpen,
    setIsGuideModalOpen
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);

  const isNotionConnected = Boolean(notionApiKey && notionParentPageId);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-notion-dark-bg/95 backdrop-blur border-b border-neutral-200 dark:border-notion-dark-border transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
          
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <button 
              onClick={() => setCurrentView('builder')}
              className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 font-bold text-lg shadow-sm hover:scale-105 transition"
            >
              <span>N</span>
            </button>
            <div className="flex flex-col text-left">
              <div className="flex items-center space-x-1.5">
                <span 
                  className="font-bold text-sm sm:text-base tracking-tight text-neutral-900 dark:text-white cursor-pointer select-none"
                  onClick={() => setCurrentView('builder')}
                >
                  Notion Architect
                </span>
                <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                  Gemini AI
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 hidden xl:block leading-none">
                AI 노션 템플릿 설계 & 아카이빙 허브
              </span>
            </div>
          </div>

          {/* Center (PC Only): 3 Core Views Segment Tabs */}
          <div className="hidden md:flex items-center bg-neutral-100 dark:bg-neutral-800/90 p-1 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80">
            <button
              onClick={() => setCurrentView('builder')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                currentView === 'builder'
                  ? 'bg-white dark:bg-notion-dark-card text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>템플릿 빌더</span>
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                currentView === 'dashboard'
                  ? 'bg-white dark:bg-notion-dark-card text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>내 보관함</span>
            </button>
            <button
              onClick={() => setCurrentView('quick_capture')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                currentView === 'quick_capture'
                  ? 'bg-white dark:bg-notion-dark-card text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-rose-500" />
              <span>1초 퀵 캡처</span>
            </button>
          </div>

          {/* Right Actions (PC View) */}
          <div className="hidden md:flex items-center space-x-1.5 shrink-0">
            
            {/* Beginner Visual Guide */}
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xs transition active:scale-95"
              title="초보자 맞춤형 친절 사용 설명서"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>쉬운 설명서</span>
            </button>

            {/* Notion Workspace Connection */}
            <button
              onClick={() => setIsNotionSettingsModalOpen(true)}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition ${
                isNotionConnected
                  ? 'bg-neutral-50 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                  : 'bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
              }`}
              title="노션 워크스페이스 연동 설정"
            >
              <span className="font-bold font-serif text-[11px] px-1 bg-white/20 dark:bg-neutral-900/10 rounded">N</span>
              <span>{isNotionConnected ? '노션 연동됨' : '노션 연결'}</span>
              {isNotionConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            </button>

            {/* Gemini API Key */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className={`flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition ${
                apiKey
                  ? 'bg-neutral-50 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                  : 'bg-amber-500 hover:bg-amber-600 text-white border-transparent'
              }`}
              title="Gemini AI API 키 설정"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{apiKey ? 'AI 키' : 'AI 키 등록'}</span>
            </button>

            {/* Google Calendar Sync */}
            <button
              onClick={() => setIsGoogleSyncModalOpen(true)}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition"
              title="Google Workspace & 캘린더 싱크"
            >
              <Calendar className="w-4 h-4 text-blue-500" />
            </button>

            {/* More Utilities Dropdown (JSON, Share, Reset) */}
            <div className="relative">
              <button
                onClick={() => setIsMoreDropdownOpen(prev => !prev)}
                className="flex items-center space-x-1 px-2 py-1.5 text-xs font-medium rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition"
                title="추가 도구 (JSON, 공유, 리셋)"
              >
                <span>도구</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {isMoreDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsMoreDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-notion-dark-card rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-1.5 z-50 animate-fadeIn">
                    <button
                      onClick={() => { setIsRawJsonModalOpen(true); setIsMoreDropdownOpen(false); }}
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition text-left"
                    >
                      <Code2 className="w-3.5 h-3.5 text-neutral-500" />
                      <span>원시 JSON 코드</span>
                    </button>
                    <button
                      onClick={() => { setIsExportModalOpen(true); setIsMoreDropdownOpen(false); }}
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition text-left"
                    >
                      <Share2 className="w-3.5 h-3.5 text-neutral-500" />
                      <span>템플릿 공유·내보내기</span>
                    </button>
                    <div className="my-1 border-t border-neutral-200/60 dark:border-neutral-800" />
                    <button
                      onClick={() => { resetToDefault(); setIsMoreDropdownOpen(false); }}
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition text-left"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>기본값으로 리셋</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title={isDark ? '라이트 모드' : '다크 모드'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile */}
            {authUser && (
              <div className="pl-1 border-l border-neutral-200 dark:border-neutral-800">
                <UserProfileDropdown user={authUser} onLogout={logout} />
              </div>
            )}
          </div>

          {/* Right Actions (Mobile View): Minimal Header */}
          <div className="flex md:hidden items-center space-x-1.5">
            {/* Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              aria-label="다크 모드 토글"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-10 h-10 min-w-[40px] flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition active:scale-95"
              aria-label="전체 메뉴 열기"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Slide-Over Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end animate-fadeIn">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={closeMobileMenu}
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-xs bg-white dark:bg-notion-dark-card h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-slideLeft">
            
            {/* Drawer Header */}
            <div>
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 font-bold text-sm">
                    N
                  </div>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">
                    설정 및 부가 메뉴
                  </span>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Card */}
              {authUser && (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 flex items-center space-x-3">
                  <img
                    src={authUser.picture}
                    alt={authUser.name}
                    className="w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-700 object-cover"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                        {authUser.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {authUser.role === 'admin' ? '관리자' : '일반'}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 truncate">
                      {authUser.email}
                    </span>
                  </div>
                </div>
              )}

              {/* Menu Items List */}
              <div className="p-3 space-y-1.5">
                <div className="px-2 pt-2 pb-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  핵심 연동 및 가이드
                </div>

                {/* Notion Workspace */}
                <button
                  onClick={() => { setIsNotionSettingsModalOpen(true); closeMobileMenu(); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-100 transition text-left"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-serif text-xs font-bold">
                      N
                    </span>
                    <span>노션 워크스페이스 연동</span>
                  </div>
                  {isNotionConnected ? (
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      연동됨
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                      연결 필요
                    </span>
                  )}
                </button>

                {/* Gemini AI Key */}
                <button
                  onClick={() => { setIsApiKeyModalOpen(true); closeMobileMenu(); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-100 transition text-left"
                >
                  <div className="flex items-center space-x-2.5">
                    <Key className="w-4 h-4 text-amber-500" />
                    <span>Gemini AI API 키</span>
                  </div>
                  {apiKey ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      등록됨
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                      미등록
                    </span>
                  )}
                </button>

                {/* Beginner Guide */}
                <button
                  onClick={() => { setIsGuideModalOpen(true); closeMobileMenu(); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-xs font-semibold text-amber-900 dark:text-amber-200 transition text-left"
                >
                  <div className="flex items-center space-x-2.5">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>초보자 친절 사용 설명서</span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </button>

                {/* Google Calendar Sync */}
                <button
                  onClick={() => { setIsGoogleSyncModalOpen(true); closeMobileMenu(); }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-100 transition text-left"
                >
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Google 캘린더 싱크</span>
                </button>

                <div className="pt-3 px-2 pb-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  도구 및 관리
                </div>

                {/* Raw JSON */}
                <button
                  onClick={() => { setIsRawJsonModalOpen(true); closeMobileMenu(); }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-200 transition text-left"
                >
                  <Code2 className="w-4 h-4 text-neutral-500" />
                  <span>원시 JSON 템플릿 코드</span>
                </button>

                {/* Share / Export */}
                <button
                  onClick={() => { setIsExportModalOpen(true); closeMobileMenu(); }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-200 transition text-left"
                >
                  <Share2 className="w-4 h-4 text-neutral-500" />
                  <span>템플릿 공유 및 내보내기</span>
                </button>

                {/* Model Selector in Drawer */}
                <div className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    <Bot className="w-4 h-4 text-neutral-500" />
                    <span>AI 모델</span>
                  </div>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value as GeminiModelType)}
                    className="bg-transparent text-xs text-neutral-800 dark:text-neutral-100 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="gemini-1.5-flash" className="dark:bg-neutral-800">1.5 Flash</option>
                    <option value="gemini-1.5-pro" className="dark:bg-neutral-800">1.5 Pro</option>
                    <option value="gemini-2.0-flash" className="dark:bg-neutral-800">2.0 Flash</option>
                  </select>
                </div>

                {/* Reset to Default */}
                <button
                  onClick={() => { resetToDefault(); closeMobileMenu(); }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 transition text-left"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>기본 템플릿으로 리셋</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => { logout(); closeMobileMenu(); }}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                로그아웃
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
