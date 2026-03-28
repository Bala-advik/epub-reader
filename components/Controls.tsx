import React, { useState } from 'react';
import { ThemeMode, ReaderSettings, ViewMode } from '../types';

interface ControlsProps {
  settings: ReaderSettings;
  updateSettings: (partial: Partial<ReaderSettings>) => void;
  onPrev: () => void;
  onNext: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  settings,
  updateSettings,
  onPrev,
  onNext
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'display' | 'layout' | 'theme'>('display');

  const fonts = [
    { name: 'Serif', value: 'Merriweather, serif' },
    { name: 'Sans', value: 'Inter, sans-serif' },
    { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times', value: '"Times New Roman", Times, serif' },
    { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  ];

  return (
    <>
      {/* Floating Navigation Pill (Always Visible) */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-30">
        
        <button 
          onClick={onPrev} 
          className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:scale-110 transition-transform"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`px-6 h-12 rounded-full shadow-lg border flex items-center space-x-2 font-medium transition-all
            ${isOpen 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }
          `}
        >
          <i className="fas fa-sliders-h"></i>
          <span>Controls</span>
        </button>

        <button 
          onClick={onNext} 
          className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:scale-110 transition-transform"
        >
          <i className="fas fa-chevron-right"></i>
        </button>

      </div>

      {/* Settings Panel Overlay */}
      {isOpen && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-30 overflow-hidden animate-slide-up">
          
          {/* Panel Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            {[
              { id: 'display', label: 'Display', icon: 'fa-font' },
              { id: 'layout', label: 'Layout', icon: 'fa-expand' },
              { id: 'theme', label: 'Theme', icon: 'fa-palette' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-gray-50 dark:bg-gray-700/50 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                  }
                `}
              >
                <i className={`fas ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="p-6 h-[300px] overflow-y-auto custom-scrollbar">
            
            {/* Display Settings */}
            {activeTab === 'display' && (
              <div className="space-y-6">
                {/* Font Size */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 uppercase font-semibold">
                    <span>Size</span>
                    <span>{settings.fontSize}%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-font text-xs text-gray-400"></i>
                    <input 
                      type="range" 
                      min="50" 
                      max="200" 
                      step="10" 
                      value={settings.fontSize}
                      onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <i className="fas fa-font text-lg text-gray-400"></i>
                  </div>
                </div>

                {/* Line Height */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 uppercase font-semibold">
                    <span>Line Height</span>
                    <span>{settings.lineHeight.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-align-justify text-xs text-gray-400"></i>
                    <input 
                      type="range" 
                      min="1" 
                      max="2.5" 
                      step="0.1" 
                      value={settings.lineHeight}
                      onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <i className="fas fa-align-justify text-lg text-gray-400"></i>
                  </div>
                </div>

                {/* Font Family */}
                <div className="space-y-2">
                   <label className="text-xs text-gray-500 uppercase font-semibold">Typeface</label>
                   <div className="grid grid-cols-2 gap-2">
                      {fonts.map(font => (
                        <button
                          key={font.name}
                          onClick={() => updateSettings({ fontFamily: font.value })}
                          className={`px-3 py-2 rounded-lg text-sm border transition-all
                            ${settings.fontFamily === font.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                            }
                          `}
                          style={{ fontFamily: font.value }}
                        >
                          {font.name}
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            )}

            {/* Layout Settings */}
            {activeTab === 'layout' && (
              <div className="space-y-6">
                {/* View Direction */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase font-semibold">View Direction</label>
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => updateSettings({ viewMode: ViewMode.PAGINATED })}
                      className={`flex-1 py-2 text-sm rounded-md flex items-center justify-center space-x-2 transition-all
                        ${settings.viewMode === ViewMode.PAGINATED
                          ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                        }
                      `}
                    >
                      <i className="fas fa-book-open"></i>
                      <span>Paginated</span>
                    </button>
                    <button
                      onClick={() => updateSettings({ viewMode: ViewMode.SCROLLED })}
                      className={`flex-1 py-2 text-sm rounded-md flex items-center justify-center space-x-2 transition-all
                        ${settings.viewMode === ViewMode.SCROLLED
                          ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                        }
                      `}
                    >
                      <i className="fas fa-scroll"></i>
                      <span>Scrolled</span>
                    </button>
                  </div>
                </div>

                {/* Spreads (Only for paginated) */}
                {settings.viewMode === ViewMode.PAGINATED && (
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 dark:text-gray-300">Two Page Spread</label>
                    <button 
                      onClick={() => updateSettings({ spread: !settings.spread })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${settings.spread ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                       <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.spread ? 'translate-x-6' : ''}`}></div>
                    </button>
                  </div>
                )}

                <hr className="border-gray-100 dark:border-gray-700" />

                {/* Margins */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 uppercase font-semibold">
                      <span>Horizontal Margin</span>
                      <span>{settings.marginHorizontal}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="5" 
                      value={settings.marginHorizontal}
                      onChange={(e) => updateSettings({ marginHorizontal: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 uppercase font-semibold">
                      <span>Vertical Margin</span>
                      <span>{settings.marginVertical}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="5" 
                      value={settings.marginVertical}
                      onChange={(e) => updateSettings({ marginVertical: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Theme Settings */}
            {activeTab === 'theme' && (
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => updateSettings({ theme: ThemeMode.LIGHT })}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center space-y-2 transition-all
                    ${settings.theme === ThemeMode.LIGHT 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="w-10 h-10 rounded-full border bg-white shadow-sm"></div>
                  <span className="text-xs font-semibold text-gray-600">Light</span>
                </button>

                <button 
                  onClick={() => updateSettings({ theme: ThemeMode.SEPIA })}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center space-y-2 transition-all
                    ${settings.theme === ThemeMode.SEPIA
                      ? 'border-blue-500 bg-[#f4ecd8]' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="w-10 h-10 rounded-full border bg-[#f4ecd8] shadow-sm"></div>
                  <span className="text-xs font-semibold text-gray-600">Sepia</span>
                </button>

                <button 
                  onClick={() => updateSettings({ theme: ThemeMode.DARK })}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center space-y-2 transition-all
                    ${settings.theme === ThemeMode.DARK
                      ? 'border-blue-500 bg-gray-800' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="w-10 h-10 rounded-full border bg-[#1a1a1a] shadow-sm"></div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Dark</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default Controls;