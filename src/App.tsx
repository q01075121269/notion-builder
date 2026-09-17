import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { SplitLayout } from './components/layout/SplitLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { ApiKeyModal } from './components/modals/ApiKeyModal';
import { RawJsonModal } from './components/modals/RawJsonModal';
import { ExportModal } from './components/modals/ExportModal';
import { NotionSettingsModal } from './components/modals/NotionSettingsModal';
import { PublishProgressModal } from './components/modals/PublishProgressModal';
import { PublishSuccessModal } from './components/modals/PublishSuccessModal';
import { GoogleSyncModal } from './components/modals/GoogleSyncModal';
import { GuideModal } from './components/guide/GuideModal';
import { MobileFab } from './components/common/MobileFab';
import { LoginView } from './components/auth/LoginView';
import { UnauthorizedView } from './components/auth/UnauthorizedView';
import { QuickCaptureView } from './components/quickCapture/QuickCaptureView';

export const MainApp: React.FC = () => {
  const { 
    currentView,
    authUser,
    isAuthenticated,
    isAdmin,
    login,
    logout
  } = useApp();

  // 1. 미인증 상태 -> Google OAuth 로그인 화면 (Auth Gate)
  if (!isAuthenticated || !authUser) {
    return <LoginView onLogin={login} />;
  }

  // 2. 인증되었으나 관리자 화이트리스트에 미등록된 계정 -> 차단 및 권한 요청 화면
  if (!isAdmin) {
    return (
      <UnauthorizedView 
        user={authUser} 
        onLogout={logout} 
        onSwitchAccount={logout} 
      />
    );
  }

  // 3. 관리자 권한 인가 완료 -> 정상 빌더 & 대시보드 애플리케이션 진입
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text font-sans">
      <Navbar />
      
      {/* 뷰 모드 분기: 빌더 화면 vs 대시보드(내 보관함) vs 모바일 1초 퀵 캡처 */}
      {currentView === 'dashboard' ? (
        <DashboardView />
      ) : currentView === 'quick_capture' ? (
        <QuickCaptureView />
      ) : (
        <SplitLayout />
      )}
      
      {/* Mobile Floating Action Button (모바일에서 언제든 새 템플릿 작성으로 복귀) */}
      <MobileFab />

      {/* Modals */}
      <ApiKeyModal />
      <NotionSettingsModal />
      <GoogleSyncModal />
      <GuideModal />
      <PublishProgressModal />
      <PublishSuccessModal />
      <RawJsonModal />
      <ExportModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
