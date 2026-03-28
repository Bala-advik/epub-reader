import React, { useState } from 'react';
import { TocItem, BookMetadata, AIResponse, SearchResult, Bookmark } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  toc: TocItem[];
  metadata: BookMetadata | null;
  onNavigate: (href: string) => void;
  currentChapterSummary: AIResponse;
  onRequestSummary: () => void;
  aiExplanation: AIResponse;
  searchResults: SearchResult[];
  isSearching: boolean;
  onSearch: (query: string) => void;
  bookmarks: Bookmark[];
  onRemoveBookmark: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  toc, 
  metadata, 
  onNavigate,
  currentChapterSummary,
  onRequestSummary,
  aiExplanation,
  searchResults,
  isSearching,
  onSearch,
  bookmarks,
  onRemoveBookmark
}) => {
  const [activeTab, setActiveTab] = useState<'toc' | 'search' | 'bookmarks' | 'ai' | 'meta'>('toc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Panel */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col border-r dark:border-gray-700
      `}>
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <h2 className="font-bold text-lg dark:text-white font-serif">Lumina</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white p-2 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b dark:border-gray-700 overflow-x-auto no-scrollbar">
          {[
            { id: 'toc', icon: 'fa-list', label: 'TOC' },
            { id: 'search', icon: 'fa-search', label: 'Find' },
            { id: 'bookmarks', icon: 'fa-bookmark', label: 'Marks' },
            { id: 'ai', icon: 'fa-robot', label: 'AI' },
            { id: 'meta', icon: 'fa-info-circle', label: 'Info' },
          ].map((tab) => (
             <button 
              key={tab.id}
              className={`flex-1 py-3 min-w-[60px] text-sm font-medium flex flex-col items-center justify-center gap-1 transition-colors
                ${activeTab === tab.id 
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              onClick={() => setActiveTab(tab.id as any)}
              title={tab.label}
            >
              <i className={`fas ${tab.icon}`}></i>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
          {/* Table of Contents */}
          {activeTab === 'toc' && (
            <div className="space-y-1">
              {toc.length === 0 && <p className="text-gray-400 text-sm text-center mt-4">No Table of Contents found.</p>}
              {toc.map((item) => (
                <div key={item.id} className="mb-2">
                  <button
                    onClick={() => { onNavigate(item.href); onClose(); }}
                    className="w-full text-left text-sm py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 truncate transition-colors font-serif"
                  >
                    {item.label}
                  </button>
                  {item.subitems && (
                    <div className="pl-4 border-l-2 border-gray-100 dark:border-gray-700 mt-1">
                      {item.subitems.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => { onNavigate(sub.href); onClose(); }}
                          className="w-full text-left text-xs py-1.5 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 truncate transition-colors"
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          {activeTab === 'search' && (
             <div className="flex flex-col h-full">
               <form onSubmit={handleSearchSubmit} className="mb-4 relative">
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search in book..." 
                   className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm dark:text-white transition-all"
                 />
                 <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
               </form>
               
               <div className="flex-1 overflow-y-auto">
                  {isSearching && (
                    <div className="flex justify-center py-8">
                      <div className="loader w-6 h-6 border-2 rounded-full border-blue-500"></div>
                    </div>
                  )}
                  
                  {!isSearching && searchResults.length === 0 && searchQuery && (
                    <p className="text-center text-gray-400 text-sm">No results found.</p>
                  )}

                  {!isSearching && searchResults.map((result, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => { onNavigate(result.cfi); onClose(); }}
                      className="p-3 mb-2 rounded bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border border-transparent hover:border-blue-100 dark:hover:border-gray-600"
                    >
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 font-serif">
                        "...{result.excerpt}..."
                      </p>
                    </div>
                  ))}
               </div>
             </div>
          )}

          {/* Bookmarks */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-3">
               {bookmarks.length === 0 && (
                 <div className="text-center py-10">
                   <i className="far fa-bookmark text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
                   <p className="text-gray-500 text-sm">No bookmarks yet.</p>
                   <p className="text-gray-400 text-xs mt-1">Select text or use the menu to add one.</p>
                 </div>
               )}
               {bookmarks.map((bm) => (
                 <div key={bm.id} className="group relative p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all">
                    <button 
                      onClick={() => { onNavigate(bm.cfi); onClose(); }}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Bookmark</span>
                        <span className="text-[10px] text-gray-400">{new Date(bm.created).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-200 font-serif line-clamp-2">
                        {bm.label}
                      </p>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemoveBookmark(bm.id); }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                 </div>
               ))}
            </div>
          )}

          {/* AI Insights */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              
              {/* Selected Text Explanation */}
              {aiExplanation.analysis && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                  <h3 className="text-xs font-bold text-purple-600 uppercase mb-2 flex items-center">
                    <i className="fas fa-magic mr-2"></i> Selection Analysis
                  </h3>
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {aiExplanation.loading ? (
                       <div className="flex items-center space-x-2 text-gray-500">
                         <div className="loader w-4 h-4 border-2 rounded-full"></div>
                         <span>Analyzing...</span>
                       </div>
                    ) : (
                      aiExplanation.analysis
                    )}
                  </div>
                </div>
              )}

              {/* Chapter Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-blue-100 dark:border-gray-600 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Current Chapter</h3>
                  <button 
                    onClick={onRequestSummary}
                    disabled={currentChapterSummary.loading}
                    className="text-xs bg-white dark:bg-gray-600 hover:bg-blue-50 dark:hover:bg-gray-500 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-gray-500 px-3 py-1 rounded-full transition-colors flex items-center"
                  >
                    {currentChapterSummary.loading ? <div className="loader w-3 h-3 border-2 rounded-full mr-1"></div> : <i className="fas fa-sparkles mr-1"></i>}
                    Summarize
                  </button>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed min-h-[100px]">
                  {currentChapterSummary.loading ? (
                    <div className="space-y-2 opacity-50 animate-pulse">
                      <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-300 rounded w-full"></div>
                      <div className="h-2 bg-gray-300 rounded w-5/6"></div>
                    </div>
                  ) : currentChapterSummary.summary ? (
                    currentChapterSummary.summary
                  ) : (
                    <span className="text-gray-400 italic">Click summarize to get an AI overview of this chapter using Gemini.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Metadata Editor */}
          {activeTab === 'meta' && metadata && (
            <div className="space-y-4">
               <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700">
                 <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cover</label>
                 <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400">
                    <i className="fas fa-image text-3xl"></i>
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title</label>
                 <input 
                  type="text" 
                  defaultValue={metadata.title} 
                  className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 py-1 text-sm dark:text-gray-200 outline-none transition-colors"
                 />
               </div>

               <div>
                 <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Author</label>
                 <input 
                  type="text" 
                  defaultValue={metadata.creator} 
                  className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 py-1 text-sm dark:text-gray-200 outline-none transition-colors"
                 />
               </div>

               <div>
                 <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Publisher</label>
                 <input 
                  type="text" 
                  defaultValue={metadata.publisher} 
                  className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-blue-500 py-1 text-sm dark:text-gray-200 outline-none transition-colors"
                 />
               </div>

               <div className="pt-4">
                 <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg shadow transition-colors">
                   Save Changes (Session)
                 </button>
                 <p className="text-xs text-gray-400 mt-2 text-center">Changes are stored locally for this session.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;