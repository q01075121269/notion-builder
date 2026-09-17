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
  UploadCloud, 
  Loader2,
  BookOpen
} from 'lucide-react';

export const NotionMockup: React.FC = () => {
  const { 
    currentTemplate, 
    previewMode, 
    setPreviewMode, 
    setIsRawJsonModalOpen, 
    setIsExportModalOpen,
    publishToNotion,
    isPublishing,
    setIsGuideModalOpen
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
      
      {/* Notion Preview Top Toolbar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 px-4 sm:px-8 py-2.5 bg-white/90 dark:bg-notion-dark-bg/90 backdrop-blur border-b border-neutral-200/70 dark:border-neutral-800">
        
        {/* View Mode Switcher: Notion Mockup vs Structure Tree */}
        <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs">
          <button
            onClick={() => setPreviewMode('notion')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition ${
              previewMode === 'notion'
                ? 'bg-white dark:bg-notion-dark-card text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>노션 페이지 뷰</span>
          </button>
          <button
            onClick={() => setPreviewMode('tree')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition ${
              previewMode === 'tree'
                ? 'bg-white dark:bg-notion-dark-card text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>구조 트리 뷰</span>
          </button>
        </div>

        {/* Action Buttons: [내 노션에 템플릿 생성하기] & Quick Actions */}
        <div className="flex items-center space-x-2 text-xs">
          
          {/* 5단계: 쉬운 설명서 열기 버튼 */}
          <button
            onClick={() => setIsGuideModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:hover:bg-amber-900/60 border border-amber-300/80 dark:border-amber-800/60 transition shadow-xs"
            title="이 템플릿의 초보자 맞춤형 친절 사용 설명서 열기"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>쉬운 설명서</span>
          </button>

          {/* Main Action: Publish to Notion (2단계 핵심 액션 버튼) */}
          <button
            onClick={publishToNotion}
            disabled={isPublishing}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:to-teal-600 shadow-sm transition disabled:opacity-50"
            title="현재 설계된 템플릿을 내 노션 워크스페이스에 실제로 생성합니다"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>노션에 생성 중...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>내 노션에 템플릿 생성하기</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsRawJsonModalOpen(true)}
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>공유</span>
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
