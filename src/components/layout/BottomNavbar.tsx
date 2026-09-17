import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Layers, Zap } from 'lucide-react';

export const BottomNavbar: React.FC = () => {
  const { currentView, setCurrentView } = useApp();

  const tabs = [
    {
      id: 'builder' as const,
      label: '템플릿 빌더',
      icon: Sparkles,
      color: 'text-amber-500',
      activeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
    },
    {
      id: 'dashboard' as const,
      label: '내 보관함',
      icon: Layers,
      color: 'text-blue-500',
      activeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
    },
    {
      id: 'quick_capture' as const,
      label: '1초 퀵 캡처',
      icon: Zap,
      color: 'text-rose-500',
      activeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
    }
  ];

  return (
    <nav 
      aria-label="모바일 하단 내비게이션"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-notion-dark-card/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="grid grid-cols-3 h-14 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-all rounded-xl my-1 active:scale-95 ${
                isActive
                  ? tab.activeBg + ' font-bold'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? tab.color : 'text-neutral-500 dark:text-neutral-400'}`} />
                {isActive && (
                  <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                    tab.id === 'builder' ? 'bg-amber-500' : tab.id === 'dashboard' ? 'bg-blue-500' : 'bg-rose-500'
                  }`} />
                )}
              </div>
              <span className="text-[11px] leading-none tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
