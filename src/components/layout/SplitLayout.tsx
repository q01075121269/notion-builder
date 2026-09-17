import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChatContainer } from '../chat/ChatContainer';
import { NotionMockup } from '../preview/NotionMockup';

export const SplitLayout: React.FC = () => {
  const { activeMobileTab } = useApp();

  return (
    <div className="flex-1 flex overflow-hidden relative">
      
      {/* PC: Left 2-Split (AI Chat) / Mobile: Tab Dependent */}
      <div
        className={`w-full md:w-[42%] lg:w-[38%] h-full flex-shrink-0 transition-all duration-300 ${
          activeMobileTab === 'chat' ? 'flex' : 'hidden md:flex'
        }`}
      >
        <div className="w-full h-full">
          <ChatContainer />
        </div>
      </div>

      {/* PC: Right 2-Split (Notion Mockup Preview) / Mobile: Tab Dependent */}
      <div
        className={`w-full md:w-[58%] lg:w-[62%] h-full flex-1 overflow-hidden transition-all duration-300 ${
          activeMobileTab === 'preview' ? 'flex' : 'hidden md:flex'
        }`}
      >
        <div className="w-full h-full">
          <NotionMockup />
        </div>
      </div>

    </div>
  );
};
