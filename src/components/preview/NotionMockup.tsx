import React from 'react';
import { useApp } from '../../context/AppContext';
import { NotionCover } from './NotionCover';
import { NotionHeader } from './NotionHeader';
import { NotionBlocks } from './NotionBlocks';
import { NotionDatabaseView } from './NotionDatabaseView';
import { StructureTreeView } from './StructureTreeView';
import { 
  FileText, 
  GitBranch, 
  Code2, 
  Share2, 
  Sparkles, 
  Loader2,
  Zap
} from 'lucide-react';

export const NotionMockup: React.FC = () => {
  const { 
    currentTemplate, 
    previewMode, 
    setPreviewMode, 
    setIsRawJsonModalOpen, 
    setIsExportModalOpen,
    publishToNotion,
    isPublishing
  } = useApp();

  if (!currentTemplate) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-neutral-400">
        <Sparkles className="w-12 h-12 mb-3 text-amber-500 animate-pulse" />
        <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-200">
          생성된 템플릿이 없습니다
        </h3>
        <p className="text-xs text-neutral-500 max-w-xs mt-1">
          좌측 대화창에서 원하는 노션 템플릿을 요청하시거나 추천 프롬프트를 클릭해 보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-notion-dark-bg overflow-y-auto">
      
      {/* Notion Preview Top Toolbar (정돈된 액션 바) */}
      <div className="sticky top-0 z-20 h-12 flex items-center justify-between gap-2 px-3 sm:px-6 bg-white/95 dark:bg-notion-dark-bg/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-notion-dark-border flex-nowrap shrink-0 select-none">
        
        {/* [노션 페이지 뷰 | 구조 트리 뷰] 토글 */}
        <div className="flex items-center p-0.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs shrink-0">
          <button
            onClick={() => setPreviewMode('notion')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
              previewMode === 'notion'
                ? 'bg-white dark:bg-notion-dark-card text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">노션 페이지 뷰</span>
            <span className="sm:hidden">페이지</span>
          </button>
          <button
            onClick={() => setPreviewMode('tree')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
              previewMode === 'tree'
                ? 'bg-white dark:bg-notion-dark-card text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">구조 트리 뷰</span>
            <span className="sm:hidden">트리</span>
          </button>
        </div>

        {/* 액션 버튼: [공유], [</> JSON], [⚡ 내 노션에 템플릿 생성하기(Primary)] */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs shrink-0 flex-nowrap">
          {/* 1. 공유 */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition whitespace-nowrap cursor-pointer shadow-2xs"
            title="템플릿 공유 및 마크다운 내보내기"
          >
            <Share2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span className="hidden md:inline">공유</span>
          </button>

          {/* 2. </> JSON */}
          <button
            onClick={() => setIsRawJsonModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition whitespace-nowrap cursor-pointer shadow-2xs"
            title="원시 JSON 데이터 확인 및 다운로드"
          >
            <Code2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span className="hidden md:inline">&lt;/&gt; JSON</span>
            <span className="md:hidden">&lt;/&gt;</span>
          </button>

          {/* 3. Primary: [⚡ 내 노션에 템플릿 생성하기] */}
          <button
            onClick={publishToNotion}
            disabled={isPublishing}
            className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600 shadow-sm transition disabled:opacity-50 whitespace-nowrap cursor-pointer shrink-0 active:scale-95"
            title="현재 설계된 템플릿을 내 노션 워크스페이스에 실제로 생성합니다"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>노션에 생성 중...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0 fill-amber-300" />
                <span className="hidden sm:inline">내 노션에 템플릿 생성하기</span>
                <span className="sm:hidden">노션 생성</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Rendering based on previewMode */}
      {previewMode === 'tree' ? (
        <StructureTreeView template={currentTemplate} />
      ) : (
        <div className="pb-16">
          {/* 1. Cover Image */}
          <NotionCover coverUrl={currentTemplate.cover_url} />

          {/* 2. Header (Emoji Icon, Title, Description, Meta) */}
          <NotionHeader
            title={currentTemplate.title}
            icon={currentTemplate.icon}
            description={currentTemplate.description}
          />

          {/* 3. Page Layout Blocks (Callout, Columns, Toggles) */}
          <div className="px-6 sm:px-12 md:px-16">
            <NotionBlocks blocks={currentTemplate.page_layout} />
          </div>

          {/* 4. Notion Databases Section (Tables, Boards, Calendars) */}
          <div className="px-6 sm:px-12 md:px-16 mt-6 space-y-6">
            {currentTemplate.databases.map((db, idx) => (
              <NotionDatabaseView key={idx} database={db} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
