import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { 
  NotionTemplate, 
  CreatedNotionResource,
  RecentModifications 
} from '../types/notion';
import type { ChatMessage, GeminiModelType } from '../types/chat';
import type { GoogleSyncConfig } from '../types/dashboard';
import type { BeginnerGuide, GuideAudience } from '../types/guide';
import type { AuthUser } from '../types/auth';
import { PRESET_TEMPLATES } from '../services/presetTemplates';
import { processConversationWithGemini } from '../services/gemini';
import { createNotionTemplateInWorkspace, applyPatchToRemoteWorkspace, appendGuideToggleToNotionPage } from '../services/notionApi';
import { getGoogleSyncConfig, saveGoogleSyncConfig, saveArchivedTemplate } from '../services/archiveStorage';
import { DEFAULT_GUIDES, generateGuideWithGemini, createFallbackGuide } from '../services/guideGenerator';
import { getAuthSession, saveAuthSession, clearAllAuthAndCredentials, isUserAdmin } from '../services/authStorage';
import { getSavedChatMessages, saveChatMessages, clearSavedChatMessages, INITIAL_CHAT_MESSAGES } from '../services/chatStorage';
import confetti from 'canvas-confetti';

interface AppContextType {
  // 6단계 보안 및 인증 (Google OAuth & RBAC)
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;

  // Theme & Model
  isDark: boolean;
  toggleDarkMode: () => void;
  selectedModel: GeminiModelType;
  setSelectedModel: (model: GeminiModelType) => void;
  apiKey: string;
  setApiKey: (key: string) => void;

  // View Mode (4단계 보관함 vs 확장 2단계 퀵 캡처 허브)
  currentView: 'builder' | 'dashboard' | 'quick_capture';
  setCurrentView: (view: 'builder' | 'dashboard' | 'quick_capture') => void;

  // 5단계: 초보자 맞춤형 비주얼 가이드
  currentGuide: BeginnerGuide | null;
  setCurrentGuide: (guide: BeginnerGuide | null) => void;
  isGuideModalOpen: boolean;
  setIsGuideModalOpen: (open: boolean) => void;
  isGeneratingGuide: boolean;
  isAppendingGuideToNotion: boolean;
  generateGuide: (audience?: GuideAudience) => Promise<void>;
  appendGuideToNotion: () => Promise<{ success: boolean; message: string }>;

  // Notion Integration (2단계 & 3단계)
  notionApiKey: string;
  setNotionApiKey: (key: string) => void;
  notionParentPageId: string;
  setNotionParentPageId: (id: string) => void;
  isPublishing: boolean;
  publishProgress: { step: string; percent: number };
  publishError: string | null;
  createdNotionResource: CreatedNotionResource | null;
  isNotionSettingsModalOpen: boolean;
  setIsNotionSettingsModalOpen: (open: boolean) => void;
  isPublishSuccessModalOpen: boolean;
  setIsPublishSuccessModalOpen: (open: boolean) => void;
  publishToNotion: () => Promise<void>;

  // Google Workspace & Notion Calendar Sync (4단계)
  isGoogleSyncModalOpen: boolean;
  setIsGoogleSyncModalOpen: (open: boolean) => void;
  googleSyncConfig: GoogleSyncConfig;
  setGoogleSyncConfig: (config: GoogleSyncConfig) => void;

  // 3단계 Diff & Patch 하이라이트 상태
  recentModifications: RecentModifications;
  clearRecentModifications: () => void;

  // View & Tabs
  activeMobileTab: 'chat' | 'preview';
  setActiveMobileTab: (tab: 'chat' | 'preview') => void;
  previewMode: 'notion' | 'tree';
  setPreviewMode: (mode: 'notion' | 'tree') => void;

  // Modals
  isApiKeyModalOpen: boolean;
  setIsApiKeyModalOpen: (open: boolean) => void;
  isRawJsonModalOpen: boolean;
  setIsRawJsonModalOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;

  // Chat & Template
  messages: ChatMessage[];
  currentTemplate: NotionTemplate | null;
  setCurrentTemplate: (template: NotionTemplate | null) => void;
  isGenerating: boolean;
  sendMessage: (prompt: string, attachedFiles?: import('../types/fileAttachment').AttachedFile[]) => Promise<void>;
  clearChatHistory: () => void;
  applyPreset: (presetKey: string) => void;
  resetToDefault: () => void;
  updateCurrentCover: (newUrl: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 6단계: 보안 인증 상태 (Auth Gate & RBAC)
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    return getAuthSession();
  });

  const isAuthenticated = !!authUser;
  const isAdmin = authUser ? isUserAdmin(authUser.email) : false;

  const login = (user: AuthUser) => {
    const adminRole = isUserAdmin(user.email) ? 'admin' : 'user';
    const enrichedUser: AuthUser = {
      ...user,
      role: adminRole,
    };
    setAuthUser(enrichedUser);
    saveAuthSession(enrichedUser);
  };

  const logout = () => {
    clearAllAuthAndCredentials();
    setAuthUser(null);
    setNotionApiKeyState('');
    setNotionParentPageIdState('');
    setCreatedNotionResource(null);
    setMessages(INITIAL_CHAT_MESSAGES);
    setCurrentTemplate(PRESET_TEMPLATES.college_student);
    setCurrentGuide(DEFAULT_GUIDES.college_student);
    clearRecentModifications();
  };

  // Theme State
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('notion_maker_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Gemini Model & API Key
  const [selectedModel, setSelectedModel] = useState<GeminiModelType>('gemini-1.5-flash');
  const [apiKey, setApiKeyState] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });

  // Notion Integration State
  const [notionApiKey, setNotionApiKeyState] = useState<string>(() => {
    return localStorage.getItem('notion_api_key') || '';
  });
  const [notionParentPageId, setNotionParentPageIdState] = useState<string>(() => {
    return localStorage.getItem('notion_parent_page_id') || '';
  });
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishProgress, setPublishProgress] = useState<{ step: string; percent: number }>({
    step: '',
    percent: 0
  });
  const [publishError, setPublishError] = useState<string | null>(null);
  const [createdNotionResource, setCreatedNotionResource] = useState<CreatedNotionResource | null>(null);
  const [isNotionSettingsModalOpen, setIsNotionSettingsModalOpen] = useState<boolean>(false);
  const [isPublishSuccessModalOpen, setIsPublishSuccessModalOpen] = useState<boolean>(false);

  // 3단계: 최근 수정(Diff & Patch) 하이라이트 상태
  const [recentModifications, setRecentModifications] = useState<RecentModifications>({
    propertyNames: [],
    blockContents: [],
    timestamp: 0
  });

  // View Mode (빌더 vs 대시보드 vs 퀵 캡처 허브)
  const [currentView, setCurrentView] = useState<'builder' | 'dashboard' | 'quick_capture'>(() => {
    if (typeof window !== 'undefined') {
      const isDefaultQc = localStorage.getItem('default_view_quick_capture') === 'true';
      const isMobile = window.innerWidth < 768;
      if (isDefaultQc && isMobile) return 'quick_capture';
    }
    return 'builder';
  });

  // 4단계: Google Workspace & Notion Calendar Sync
  const [isGoogleSyncModalOpen, setIsGoogleSyncModalOpen] = useState<boolean>(false);
  const [googleSyncConfig, setGoogleSyncConfigState] = useState<GoogleSyncConfig>(() => getGoogleSyncConfig());

  const setGoogleSyncConfig = (config: GoogleSyncConfig) => {
    setGoogleSyncConfigState(config);
    saveGoogleSyncConfig(config);
  };

  // 5단계: 초보자 맞춤형 비주얼 가이드 상태
  const [currentGuide, setCurrentGuide] = useState<BeginnerGuide | null>(DEFAULT_GUIDES.college_student);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState<boolean>(false);
  const [isAppendingGuideToNotion, setIsAppendingGuideToNotion] = useState<boolean>(false);

  // Views & Modals
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'preview'>('chat');
  const [previewMode, setPreviewMode] = useState<'notion' | 'tree'>('notion');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isRawJsonModalOpen, setIsRawJsonModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Template & Chat State
  const [currentTemplate, setCurrentTemplate] = useState<NotionTemplate | null>(PRESET_TEMPLATES.college_student);
  const [messages, setMessages] = useState<ChatMessage[]>(() => getSavedChatMessages());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Sync Chat Messages with Local Storage
  useEffect(() => {
    saveChatMessages(messages);
  }, [messages]);

  // Sync Dark Mode with DOM
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('notion_maker_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('notion_maker_theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(prev => !prev);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem('gemini_api_key', key.trim());
  };

  const setNotionApiKey = (key: string) => {
    setNotionApiKeyState(key);
    localStorage.setItem('notion_api_key', key.trim());
  };

  const setNotionParentPageId = (id: string) => {
    setNotionParentPageIdState(id);
    localStorage.setItem('notion_parent_page_id', id.trim());
  };

  const clearRecentModifications = () => {
    setRecentModifications({ propertyNames: [], blockContents: [], timestamp: 0 });
  };

  const clearChatHistory = () => {
    const reset = clearSavedChatMessages();
    setMessages(reset);
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.65 }
    });
  };

  const updateCurrentCover = (newUrl: string) => {
    if (currentTemplate) {
      setCurrentTemplate({
        ...currentTemplate,
        cover_url: newUrl
      });
    }
  };

  // [3단계 및 확장 파이프라인] 대화형 프롬프트 처리 핸들러 (파일 분석, 비전 역설계 및 모드 A/B 분기)
  const sendMessage = async (
    prompt: string,
    attachedFiles: import('../types/fileAttachment').AttachedFile[] = []
  ) => {
    if (!isAuthenticated) {
      alert('보안 인증이 필요합니다. Google 계정으로 로그인 후 이용해 주세요.');
      return;
    }
    if ((!prompt.trim() && attachedFiles.length === 0) || isGenerating) return;

    const userAttachments = attachedFiles.map(f => ({
      name: f.name,
      category: f.category,
      sizeFormatted: f.sizeFormatted,
      previewUrl: f.previewUrl
    }));

    const userMessageId = `msg-user-${Date.now()}`;
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: prompt.trim(),
      timestamp: Date.now(),
      attachments: userAttachments.length > 0 ? userAttachments : undefined
    };

    const assistantMessageId = `msg-assistant-${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isLoading: true
    };

    setMessages(prev => [...prev, newUserMessage, initialAssistantMessage]);
    setIsGenerating(true);

    try {
      if (!apiKey && !import.meta.env.VITE_GEMINI_API_KEY) {
        setIsApiKeyModalOpen(true);
        throw new Error('Gemini API 키가 필요합니다. 열린 설정 창에서 API 키를 입력해 주세요.');
      }

      // Gemini Master Brain Engine 호출 (멀티턴 히스토리 전달)
      const response = await processConversationWithGemini(
        prompt,
        apiKey,
        currentTemplate,
        selectedModel,
        attachedFiles,
        messages
      );

      // 모드 A. 일반 대화 및 사용법 안내인 경우 (템플릿 변경 없이 친절한 설명 렌더링)
      if (response.mode === 'CONVERSATION_GUIDE') {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  isLoading: false,
                  content: response.explanation
                }
              : msg
          )
        );
        return;
      }

      // 모드 B-1. 부분 수정(PATCH_UPDATE) 모드인 경우
      if (response.mode === 'PATCH_UPDATE') {
        const { changes, updated_template, explanation } = response;
        
        setCurrentTemplate(updated_template);

        // 하이라이트 상태 기록
        const newPropNames = changes.new_properties?.map(p => p.name) || [];
        const newBlocks = changes.blocks_to_append?.map(b => 'content' in b ? (b as any).content : b.type) || [];
        setRecentModifications({
          propertyNames: newPropNames,
          blockContents: newBlocks,
          timestamp: Date.now()
        });

        // 실제 노션 워크스페이스에 이미 배포된 상태라면 원격 PATCH 동기화 수행
        let remoteSyncNotice = '';
        if (createdNotionResource && notionApiKey) {
          const syncResult = await applyPatchToRemoteWorkspace(response, notionApiKey, createdNotionResource);
          if (syncResult.success) {
            remoteSyncNotice = `\n\n🟢 **실제 노션 워크스페이스 동기화 완료**: ${syncResult.message}`;
          } else {
            remoteSyncNotice = `\n\n⚠️ **원격 노션 동기화 실패**: ${syncResult.message} (로컬 미리보기에는 정상 적용되었습니다)`;
          }
        }

        if (window.innerWidth < 768) {
          setActiveMobileTab('preview');
        }

        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  isLoading: false,
                  content: `🛠️ **[부분 수정 반영 완료]**\n\n${explanation}${remoteSyncNotice}`,
                  templateData: updated_template
                }
              : msg
          )
        );
      } 
      // 2. 신규 생성(CREATE_NEW) 모드인 경우
      else {
        const { template, explanation } = response;
        setCurrentTemplate(template);
        clearRecentModifications();
        triggerCelebration();
        setCurrentGuide(createFallbackGuide(template, 'general'));

        if (window.innerWidth < 768) {
          setActiveMobileTab('preview');
        }

        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  isLoading: false,
                  content: `${explanation}\n\n- **데이터베이스**: ${template.databases.map(d => `\`${d.name}\``).join(', ')}\n- **속성 구성**: 날짜(일정), 상태, 수식, 연관관계 속성 자동 구성.\n\n우측 상단의 **[내 노션에 템플릿 생성하기]**를 눌러 워크스페이스에 직접 배포해 보세요!`,
                  templateData: template
                }
              : msg
          )
        );
      }

    } catch (err: any) {
      const errorMsg = err?.message || '대화 처리 중 오류가 발생했습니다.';
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                isLoading: false,
                content: `⚠️ **처리 실패**\n\n${errorMsg}`,
                error: errorMsg
              }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // 2단계: 실제 노션 워크스페이스에 템플릿 자동 배포 실행 핸들러
  const publishToNotion = async () => {
    if (!isAuthenticated) {
      alert('보안 인증이 필요합니다. Google 계정으로 로그인 후 이용해 주세요.');
      return;
    }
    if (!currentTemplate) return;

    if (!notionApiKey || !notionParentPageId) {
      setIsNotionSettingsModalOpen(true);
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    setPublishProgress({ step: '노션 API 연결 준비 중...', percent: 5 });

    try {
      const result = await createNotionTemplateInWorkspace(
        currentTemplate,
        notionApiKey,
        notionParentPageId,
        (step, percent) => {
          setPublishProgress({ step, percent });
        }
      );

      setCreatedNotionResource(result);
      triggerCelebration();
      setIsPublishSuccessModalOpen(true);

      // 4단계: 배포 성공 시 내 보관함에도 자동 아카이빙 영구 보존
      saveArchivedTemplate({
        id: `arch-published-${Date.now()}`,
        title: currentTemplate.title,
        description: currentTemplate.description || '노션 워크스페이스 배포 템플릿',
        icon: currentTemplate.icon || '📑',
        cover_url: currentTemplate.cover_url || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80',
        tags: ['#배포완료', '#노션연동', '#실시간'],
        templateData: currentTemplate,
        notionUrl: result.pageUrl,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      const successMsg: ChatMessage = {
        id: `publish-success-${Date.now()}`,
        role: 'assistant',
        content: `🎉 **노션 워크스페이스에 템플릿이 성공적으로 배포되었습니다!**\n\n- **페이지 제목**: [${result.pageTitle}](${result.pageUrl})\n- **생성된 데이터베이스**: ${result.databases.map(d => `\`${d.name}\``).join(', ')}\n\n(내 보관함의 [노션 템플릿 보관함]에도 자동으로 안전하게 저장되었습니다.)`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, successMsg]);

    } catch (err: any) {
      console.error('노션 배포 실패:', err);
      const errMsg = err?.message || '노션 API 연동 중 알 수 없는 오류가 발생했습니다.';
      setPublishError(errMsg);
    } finally {
      setIsPublishing(false);
    }
  };

  const applyPreset = (presetKey: string) => {
    const preset = PRESET_TEMPLATES[presetKey];
    if (preset) {
      setCurrentTemplate(preset);
      clearRecentModifications();
      triggerCelebration();
      setCurrentGuide(createFallbackGuide(preset, 'general'));
      
      const assistantMsg: ChatMessage = {
        id: `preset-${Date.now()}`,
        role: 'assistant',
        content: `🎯 **"${preset.title}"** 프리셋 템플릿을 불러왔습니다!\n\n수정하고 싶은 속성이나 블록이 있다면 아래 대화창에 편하게 입력해 주세요. (예: "여기에 우선순위 속성 추가해줘")`,
        timestamp: Date.now(),
        templateData: preset
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (window.innerWidth < 768) {
        setActiveMobileTab('preview');
      }
    }
  };

  const resetToDefault = () => {
    setCurrentTemplate(PRESET_TEMPLATES.college_student);
    clearRecentModifications();
    setMessages(INITIAL_CHAT_MESSAGES);
    setCurrentGuide(DEFAULT_GUIDES.college_student);
  };

  // 5단계: 초보자 가이드 자동 생성 핸들러
  const generateGuide = async (audience: GuideAudience = 'general') => {
    if (!currentTemplate) return;
    setIsGeneratingGuide(true);
    try {
      const guide = await generateGuideWithGemini(currentTemplate, apiKey, audience, selectedModel);
      setCurrentGuide(guide);
      triggerCelebration();
    } catch (e) {
      console.error('가이드 생성 실패:', e);
      setCurrentGuide(createFallbackGuide(currentTemplate, audience));
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  // 5단계: 노션 워크스페이스에 설명서 토글 블록 자동 삽입 핸들러
  const appendGuideToNotion = async (): Promise<{ success: boolean; message: string }> => {
    if (!currentGuide) {
      return { success: false, message: '생성된 설명서가 없습니다.' };
    }
    if (!createdNotionResource || !notionApiKey) {
      return { 
        success: false, 
        message: '먼저 상단의 [내 노션에 템플릿 생성하기]를 통해 노션 워크스페이스에 페이지를 생성해 주세요.' 
      };
    }
    setIsAppendingGuideToNotion(true);
    try {
      const res = await appendGuideToggleToNotionPage(createdNotionResource.pageId, currentGuide, notionApiKey);
      return res;
    } finally {
      setIsAppendingGuideToNotion(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        authUser,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        isDark,
        toggleDarkMode,
        selectedModel,
        setSelectedModel,
        apiKey,
        setApiKey,
        currentView,
        setCurrentView,
        currentGuide,
        setCurrentGuide,
        isGuideModalOpen,
        setIsGuideModalOpen,
        isGeneratingGuide,
        isAppendingGuideToNotion,
        generateGuide,
        appendGuideToNotion,
        notionApiKey,
        setNotionApiKey,
        notionParentPageId,
        setNotionParentPageId,
        isPublishing,
        publishProgress,
        publishError,
        createdNotionResource,
        isNotionSettingsModalOpen,
        setIsNotionSettingsModalOpen,
        isPublishSuccessModalOpen,
        setIsPublishSuccessModalOpen,
        publishToNotion,
        isGoogleSyncModalOpen,
        setIsGoogleSyncModalOpen,
        googleSyncConfig,
        setGoogleSyncConfig,
        recentModifications,
        clearRecentModifications,
        activeMobileTab,
        setActiveMobileTab,
        previewMode,
        setPreviewMode,
        isApiKeyModalOpen,
        setIsApiKeyModalOpen,
        isRawJsonModalOpen,
        setIsRawJsonModalOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        messages,
        currentTemplate,
        setCurrentTemplate,
        isGenerating,
        sendMessage,
        clearChatHistory,
        applyPreset,
        resetToDefault,
        updateCurrentCover
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
