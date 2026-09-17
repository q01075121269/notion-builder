import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Key, 
  Moon, 
  Sun, 
  Sparkles, 
  MessageSquare, 
  FileCheck, 
  Code2, 
  Share2, 
  RotateCcw,
  Bot,
  Layers,
  Calendar,
  BookOpen,
  Zap
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
    activeMobileTab,
    setActiveMobileTab,
    resetToDefault,
    currentView,
    setCurrentView,
    setIsGoogleSyncModalOpen,
    setIsGuideModalOpen
  } = useApp();

  const isNotionConnected = Boolean(notionApiKey && notionParentPageId);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-notion-dark-bg/90 backdrop-blur border-b border-neutral-200 dark:border-notion-dark-border transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Left: Brand Logo & Title & View Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div 
            onClick={() => setCurrentView('builder')}
            className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 font-bold text-lg shadow-sm cursor-pointer"
          >
            <span>N</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white cursor-pointer" onClick={() => setCurrentView('builder')}>
                Notion Architect
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                <Sparkles className="w-2.5 h-2.5 mr-1" />
                Gemini AI
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 hidden lg:block">
              자연어 맞춤형 노션 템플릿 빌더 & 아카이빙 허브
            </span>
          </div>

          {/* View Mode Switcher (빌더 화면 vs 내 보관함 vs 퀵 캡처) */}
          <div className="flex items-center ml-2 sm:ml-4 bg-neutral-100 dark:bg-neutral-800/90 p-1 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80">
            <button
              onClick={() => setCurrentView('builder')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 text-xs font-semibold rounded-lg transition ${
                currentView === 'builder'
                  ? 'bg-white dark:bg-notion-dark-card text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>빌더</span>
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 text-xs font-semibold rounded-lg transition ${
                currentView === 'dashboard'
                  ? 'bg-white dark:bg-notion-dark-card text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>보관함</span>
            </button>
            <button
              onClick={() => setCurrentView('quick_capture')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 text-xs font-semibold rounded-lg transition ${
                currentView === 'quick_capture'
                  ? 'bg-white dark:bg-notion-dark-card text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>퀵 캡처</span>
            </button>
          </div>
        </div>

        {/* Center: Mobile Segment Tabs (Only in Builder view) */}
        {currentView === 'builder' && (
          <div className="flex md:hidden items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg border border-neutral-200/80 dark:border-neutral-700/80">
            <button
              onClick={() => setActiveMobileTab('chat')}
              className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-md transition ${
                activeMobileTab === 'chat'
                  ? 'bg-white dark:bg-notion-dark-card text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>채팅</span>
            </button>
            <button
              onClick={() => setActiveMobileTab('preview')}
              className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-md transition ${
                activeMobileTab === 'preview'
                  ? 'bg-white dark:bg-notion-dark-card text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>미리보기</span>
            </button>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          
          {/* Beginner Guide Modal Button (5단계 핵심 UI) */}
          <button
            onClick={() => setIsGuideModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xs transition"
            title="초보자 맞춤형 친절 사용 설명서 열기"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">쉬운 설명서</span>
          </button>

          {/* Google Workspace Sync Modal Button */}
          <button
            onClick={() => setIsGoogleSyncModalOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition flex items-center space-x-1 text-xs font-medium"
            title="Google Workspace & 노션 캘린더 싱크"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden xl:inline">캘린더 연동</span>
          </button>

          {/* Gemini Model Selector */}
          <div className="hidden lg:flex items-center space-x-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg text-xs border border-neutral-200 dark:border-neutral-700">
            <Bot className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as GeminiModelType)}
              className="bg-transparent text-neutral-700 dark:text-neutral-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="gemini-1.5-flash" className="dark:bg-neutral-800">Gemini 1.5 Flash (빠름)</option>
              <option value="gemini-1.5-pro" className="dark:bg-neutral-800">Gemini 1.5 Pro (고지능)</option>
              <option value="gemini-2.0-flash" className="dark:bg-neutral-800">Gemini 2.0 Flash</option>
            </select>
          </div>

          {/* Notion Workspace Settings Button (2단계 핵심 UI) */}
          <button
            onClick={() => setIsNotionSettingsModalOpen(true)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              isNotionConnected
                ? 'bg-neutral-50 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                : 'bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-black hover:to-neutral-900 text-white border-transparent shadow-xs dark:from-white dark:to-neutral-100 dark:text-neutral-900'
            }`}
            title="노션 워크스페이스 연동 설정"
          >
            <span className="font-bold font-serif text-[11px] px-1 bg-white/20 rounded">N</span>
            <span className="hidden sm:inline">
              {isNotionConnected ? '노션 연동됨' : '노션 연결하기'}
            </span>
            {isNotionConnected && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            )}
          </button>

          {/* Gemini API Key Modal Button */}
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className={`flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition ${
              apiKey
                ? 'bg-neutral-50 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                : 'bg-amber-500 hover:bg-amber-600 text-white border-transparent shadow-xs'
            }`}
            title="Gemini AI API 키 설정"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{apiKey ? 'Gemini 키' : 'AI 키 등록'}</span>
          </button>

          {/* Raw JSON View Button */}
          <button
            onClick={() => setIsRawJsonModalOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 transition"
            title="원시 JSON 데이터 확인"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          {/* Export Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 transition"
            title="내보내기 & 공유"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">공유</span>
          </button>

          {/* Reset Template Button */}
          <button
            onClick={resetToDefault}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            title="초기 템플릿으로 리셋"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile & Auth Dropdown */}
          {authUser && (
            <div className="pl-1 sm:pl-2 border-l border-neutral-200 dark:border-neutral-800">
              <UserProfileDropdown user={authUser} onLogout={logout} />
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
