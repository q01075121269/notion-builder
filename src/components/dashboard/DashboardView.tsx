import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TemplateArchiveTab 
} from './TemplateArchiveTab';
import { 
  PromptSnippetTab 
} from './PromptSnippetTab';
import { 
  InspirationBoardTab 
} from './InspirationBoardTab';
import { 
  NewArchiveModal 
} from './NewArchiveModal';
import { 
  SmartLibrarianPanel 
} from './SmartLibrarianPanel';
import { 
  SettlementReportModal 
} from './SettlementReportModal';
import {
  Search, 
  Layers, 
  Code2, 
  Image as ImageIcon, 
  Download, 
  Upload, 
  Calendar, 
  Sparkles,
  Tag,
  BookOpen,
  TrendingUp,
  Brain
} from 'lucide-react';
import type { 
  ArchiveCategoryType, 
  ArchivedTemplate, 
  PromptSnippet, 
  InspirationItem 
} from '../../types/dashboard';
import { 
  getArchivedTemplates, 
  deleteArchivedTemplate, 
  saveArchivedTemplate,
  getPromptSnippets, 
  deletePromptSnippet,
  getInspirations, 
  deleteInspiration,
  exportAllArchiveData,
  importArchiveData
} from '../../services/archiveStorage';

export type DashboardTabType = ArchiveCategoryType | 'librarian';

export const DashboardView: React.FC = () => {
  const { 
    currentTemplate, 
    setCurrentTemplate, 
    setCurrentView, 
    setActiveMobileTab,
    setIsGoogleSyncModalOpen,
    setIsGuideModalOpen,
    sendMessage
  } = useApp();

  const [activeTab, setActiveTab] = useState<DashboardTabType>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('#전체');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);

  // Storage State
  const [templates, setTemplates] = useState<ArchivedTemplate[]>(() => getArchivedTemplates());
  const [snippets, setSnippets] = useState<PromptSnippet[]>(() => getPromptSnippets());
  const [inspirations, setInspirations] = useState<InspirationItem[]>(() => getInspirations());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshAll = () => {
    setTemplates(getArchivedTemplates());
    setSnippets(getPromptSnippets());
    setInspirations(getInspirations());
  };

  // 대표 태그 목록
  const filterTags = ['#전체', '#업무', '#스터디', '#라이프스타일', '#캘린더연동', '#프롬프트', '#미니멀'];

  // 1. 템플릿 필터링
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const matchQuery = 
        tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchTag = selectedTag === '#전체' || tpl.tags.includes(selectedTag);
      return matchQuery && matchTag;
    });
  }, [templates, searchQuery, selectedTag]);

  // 2. 프롬프트 스니펫 필터링
  const filteredSnippets = useMemo(() => {
    return snippets.filter((snip) => {
      const matchQuery = 
        snip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snip.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snip.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchTag = selectedTag === '#전체' || snip.tags.includes(selectedTag);
      return matchQuery && matchTag;
    });
  }, [snippets, searchQuery, selectedTag]);

  // 3. 영감 핀 필터링
  const filteredInspirations = useMemo(() => {
    return inspirations.filter((item) => {
      const matchQuery = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchTag = selectedTag === '#전체' || item.tags.includes(selectedTag);
      return matchQuery && matchTag;
    });
  }, [inspirations, searchQuery, selectedTag]);

  // 핸들러: 현재 작업 중인 템플릿 아카이빙
  const handleArchiveCurrentTemplate = () => {
    if (!currentTemplate) return;
    const newArchived: ArchivedTemplate = {
      id: `arch-${Date.now()}`,
      title: currentTemplate.title,
      description: currentTemplate.description || '노션 아키텍트 생성 템플릿',
      icon: currentTemplate.icon || '📑',
      cover_url: currentTemplate.cover_url || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80',
      tags: ['#사용자제작', '#보관함'],
      templateData: currentTemplate,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    saveArchivedTemplate(newArchived);
    refreshAll();
    alert(`"${currentTemplate.title}" 템플릿이 보관함에 안전하게 저장되었습니다!`);
  };

  // 핸들러: 보관된 템플릿을 빌더로 불러오기 (수정 모드 진입)
  const handleLoadTemplateToBuilder = (tpl: ArchivedTemplate) => {
    setCurrentTemplate(tpl.templateData);
    setCurrentView('builder');
    setActiveMobileTab('preview');
  };

  // 핸들러: 프롬프트를 빌더 대화창으로 보내기
  const handleSendToBuilderChat = (content: string) => {
    setCurrentView('builder');
    setActiveMobileTab('chat');
    sendMessage(content);
  };

  // 핸들러: 백업 파일 복원
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text && importArchiveData(text)) {
        refreshAll();
        alert('보관함 백업 데이터가 성공적으로 복원되었습니다!');
      } else {
        alert('백업 파일 형식이 올바르지 않습니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-50/50 dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Dashboard Top Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-notion-dark-border">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                내 보관함 & 외부 연동 허브
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
                Hub v4.0
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              생성한 템플릿과 노션 디자인 자산을 안전하게 보관하고, Google Workspace와 노션 캘린더를 연동하세요
            </p>
          </div>

          {/* Top Actions: Guide, Smart Librarian, Settlement Report, Google Sync, Backup Export/Import */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 6단계/확장3단계: 스마트 사서 Q&A 바로가기 */}
            <button
              onClick={() => setActiveTab('librarian')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs ${
                activeTab === 'librarian'
                  ? 'bg-indigo-600 text-white shadow-indigo-500/20'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
              }`}
              title="노션 워크스페이스 전수 검색 Q&A"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>지능형 사서 Q&A</span>
            </button>

            {/* 확장3단계: AI 결산 브리핑 버튼 */}
            <button
              onClick={() => setIsSettlementModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs"
              title="주간/월간 생산성 및 지출 AI 결산 브리핑"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>AI 결산 브리핑</span>
            </button>

            {/* 5단계: 쉬운 설명서 버튼 */}
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs"
              title="초보자 맞춤형 친절 사용 설명서 열기"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>쉬운 설명서</span>
            </button>

            {/* Google Sync Button */}
            <button
              onClick={() => setIsGoogleSyncModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Google 캘린더 연동</span>
            </button>

            {/* Export JSON */}
            <button
              onClick={exportAllArchiveData}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-medium flex items-center space-x-1 transition"
              title="보관함 전체 데이터 JSON 백업 내보내기"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">백업 내보내기</span>
            </button>

            {/* Import JSON */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-medium flex items-center space-x-1 transition"
              title="백업 JSON 파일 복원하기"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">가져오기</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />

            {/* Return / Go to Builder */}
            <button
              onClick={() => setCurrentView('builder')}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-500" />
              <span>빌더로 돌아가기</span>
            </button>
          </div>
        </div>

        {/* Quick Search & Tag Filter Bar */}
        <div className="space-y-3 bg-white dark:bg-notion-dark-card p-4 rounded-2xl border border-neutral-200/90 dark:border-notion-dark-border shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="템플릿 제목, 설명, 수식 또는 태그를 검색해 보세요 (예: 스터디, D-Day, 데스크)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-neutral-400 hover:text-neutral-600 text-xs absolute right-3.5 top-1/2 -translate-y-1/2"
              >
                지우기
              </button>
            )}
          </div>

          {/* Tag Filter Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-neutral-400 flex items-center space-x-1 pr-1 text-[11px] shrink-0">
              <Tag className="w-3 h-3" />
              <span>필터:</span>
            </span>
            {filterTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition shrink-0 ${
                  selectedTag === tag
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Sub Category Navigation Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-notion-dark-border space-x-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center space-x-2 pb-3 px-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'templates'
                ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-500" />
            <span>노션 템플릿 보관함</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {filteredTemplates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('prompts')}
            className={`flex items-center space-x-2 pb-3 px-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'prompts'
                ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-500" />
            <span>개발/프롬프트 자료실</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {filteredSnippets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('inspiration')}
            className={`flex items-center space-x-2 pb-3 px-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'inspiration'
                ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-purple-500" />
            <span>이미지 & 영감 보드</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {filteredInspirations.length}
            </span>
          </button>

          {/* 확장 3단계: 지능형 사서 & Q&A 탭 */}
          <button
            onClick={() => setActiveTab('librarian')}
            className={`flex items-center space-x-2 pb-3 px-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'librarian'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Brain className="w-4 h-4 text-indigo-500" />
            <span>지능형 사서 & Q&A</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold">
              RAG
            </span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="pt-2">
          {activeTab === 'templates' && (
            <TemplateArchiveTab
              templates={filteredTemplates}
              onDelete={(id) => {
                deleteArchivedTemplate(id);
                refreshAll();
              }}
              onSelectEdit={handleLoadTemplateToBuilder}
              onArchiveCurrent={handleArchiveCurrentTemplate}
            />
          )}

          {activeTab === 'prompts' && (
            <PromptSnippetTab
              snippets={filteredSnippets}
              onDelete={(id) => {
                deletePromptSnippet(id);
                refreshAll();
              }}
              onOpenNewModal={() => setIsNewModalOpen(true)}
              onSendToBuilderChat={handleSendToBuilderChat}
            />
          )}

          {activeTab === 'inspiration' && (
            <InspirationBoardTab
              items={filteredInspirations}
              onDelete={(id) => {
                deleteInspiration(id);
                refreshAll();
              }}
              onOpenNewModal={() => setIsNewModalOpen(true)}
            />
          )}

          {activeTab === 'librarian' && (
            <SmartLibrarianPanel 
              onOpenSettlement={() => setIsSettlementModalOpen(true)} 
            />
          )}
        </div>

      </div>

      {/* New Item Modal */}
      <NewArchiveModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        defaultCategory={activeTab === 'librarian' ? 'templates' : activeTab}
        onSuccess={refreshAll}
      />

      {/* AI Settlement Report Modal */}
      <SettlementReportModal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
      />
    </div>
  );
};
