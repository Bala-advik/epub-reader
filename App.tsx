import React, { useState, useEffect, useCallback, useRef } from 'react';
import DropZone from './components/DropZone';
import Reader from './components/Reader';
import Sidebar from './components/Sidebar';
import Controls from './components/Controls';
import { ThemeMode, BookMetadata, TocItem, AIResponse, ReaderSettings, ViewMode, SearchResult, Bookmark } from './types';
import { summarizeText, explainSelection } from './services/geminiService';

const App: React.FC = () => {
  const [fileContent, setFileContent] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  // Settings State
  const [settings, setSettings] = useState<ReaderSettings>({
    theme: ThemeMode.LIGHT,
    fontSize: 100,
    lineHeight: 1.5,
    fontFamily: 'Merriweather, serif',
    marginHorizontal: 40,
    marginVertical: 40,
    viewMode: ViewMode.PAGINATED,
    spread: true
  });
  
  // Book Data
  const [bookInstance, setBookInstance] = useState<any>(null);
  const [metadata, setMetadata] = useState<BookMetadata | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [currentCfi, setCurrentCfi] = useState<string>('');
  
  // Feature State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectionMenu, setSelectionMenu] = useState<{ visible: boolean; text: string; cfi: string; x: number; y: number } | null>(null);
  
  // Search & Bookmarks
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // AI State
  const [chapterSummary, setChapterSummary] = useState<AIResponse>({ loading: false });
  const [aiExplanation, setAiExplanation] = useState<AIResponse>({ loading: false });

  const selectionRef = useRef<HTMLDivElement>(null);

  // Load File Handler
  const handleFileLoaded = (content: ArrayBuffer, name: string) => {
    setFileContent(content);
    setFileName(name);
    // Reset state for new book
    setBookmarks([]);
    setSearchResults([]);
    setChapterSummary({ loading: false });
    setAiExplanation({ loading: false });
  };

  // Book Ready Handler
  const handleBookReady = useCallback(async (book: any) => {
    setBookInstance(book);
    
    // Load Metadata
    const meta = await book.loaded.metadata;
    setMetadata(meta);

    // Load TOC
    const navigation = await book.loaded.navigation;
    const parseToc = (items: any[]): TocItem[] => {
      return items.map(item => ({
        id: item.id,
        href: item.href,
        label: item.label,
        subitems: item.subitems ? parseToc(item.subitems) : undefined
      }));
    };
    setToc(parseToc(navigation.toc));
  }, []);

  // Navigation Logic
  const handlePrev = () => {
    window.dispatchEvent(new CustomEvent('epub-nav', { detail: 'prev' }));
  };

  const handleNext = () => {
    window.dispatchEvent(new CustomEvent('epub-nav', { detail: 'next' }));
  };

  const handleNavigate = (href: string) => {
     if(bookInstance) {
       bookInstance.rendition.display(href);
       setSidebarOpen(false);
     }
  };

  // Search Logic
  const handleSearch = async (query: string) => {
    if (!bookInstance || !query) return;
    setIsSearching(true);
    try {
      // book.find is expensive, use with care
      const results = await Promise.all(
        (await bookInstance.find(query)).map(async (item: any) => {
          // Clean up excerpt
          return {
            cfi: item.cfi,
            excerpt: item.excerpt.replace(/\s+/g, ' ').trim()
          };
        })
      );
      setSearchResults(results);
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setIsSearching(false);
    }
  };

  // Bookmark Logic
  const handleAddBookmark = () => {
    if (selectionMenu) {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        cfi: selectionMenu.cfi,
        label: selectionMenu.text.substring(0, 60) + (selectionMenu.text.length > 60 ? '...' : ''),
        created: Date.now()
      };
      setBookmarks([...bookmarks, newBookmark]);
      setSelectionMenu(null); // Close menu
      setSidebarOpen(true); // Show where it went
    }
  };

  const handleRemoveBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  // Selection Logic
  const handleTextSelected = (text: string, cfi: string, rect: {x: number, y: number} | null) => {
    if (text && rect) {
      setSelectionMenu({ visible: true, text, cfi, x: rect.x, y: rect.y });
    } else {
      setSelectionMenu(null);
    }
  };

  // AI Logic
  const handleRequestSummary = async () => {
    if (!bookInstance || !currentCfi) return;
    
    setSidebarOpen(true);
    setChapterSummary(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const spineItem = bookInstance.spine.get(currentCfi);
      if (spineItem) {
        const doc = await spineItem.load(bookInstance.load.bind(bookInstance));
        const text = doc.body.innerText;
        spineItem.unload();

        const summary = await summarizeText(text.substring(0, 10000));
        setChapterSummary({ loading: false, summary });
      } else {
         setChapterSummary({ loading: false, error: "Could not retrieve chapter text." });
      }
    } catch (e) {
      setChapterSummary({ loading: false, error: "Failed to generate summary." });
    }
  };

  const handleExplainSelection = async () => {
    if (!selectionMenu) return;
    setSidebarOpen(true);
    setSelectionMenu(null); // Close float menu
    setAiExplanation({ loading: true, error: undefined });
    try {
      const explanation = await explainSelection(selectionMenu.text, "User selected text inside the book.");
      setAiExplanation({ loading: false, analysis: explanation });
    } catch (e) {
      setAiExplanation({ loading: false, error: "Failed to explain." });
    }
  };

  // Update Settings Helper
  const updateSettings = (partial: Partial<ReaderSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  // Apply Theme Classes to Body
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === ThemeMode.DARK) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Click outside to close selection menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectionRef.current && !selectionRef.current.contains(event.target as Node)) {
        // Only close if not clicking inside iframe (handled by Reader)
        // But here we are outside iframe
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!fileContent) {
    return <DropZone onFileLoaded={handleFileLoaded} />;
  }

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden transition-colors duration-500
      ${settings.theme === ThemeMode.LIGHT ? 'bg-paper' : ''}
      ${settings.theme === ThemeMode.SEPIA ? 'bg-sepia' : ''}
      ${settings.theme === ThemeMode.DARK ? 'bg-paper-dark' : ''}
    `}>
      
      {/* Top Bar */}
      <header className="h-14 flex items-center justify-between px-4 z-20 bg-opacity-90 backdrop-blur-sm sticky top-0 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <h1 className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[200px] md:max-w-md font-serif">
            {metadata?.title || fileName}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
           <button 
             onClick={handleRequestSummary}
             className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
             title="Summarize Current Chapter"
           >
             <i className="fas fa-magic"></i>
             <span>AI Summary</span>
           </button>
           <button
             onClick={() => setFileContent(null)}
             className="text-gray-400 hover:text-red-500 transition-colors"
             title="Close Book"
           >
             <i className="fas fa-sign-out-alt"></i>
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <Reader 
          fileContent={fileContent}
          settings={settings}
          onBookReady={handleBookReady}
          onRelocated={(location) => setCurrentCfi(location.start.cfi)}
          onTextSelected={handleTextSelected}
        />

        {/* Floating Selection Menu */}
        {selectionMenu && selectionMenu.visible && (
           <div 
             ref={selectionRef}
             className="absolute z-50 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-1 flex space-x-1 transform -translate-x-1/2 -translate-y-full animate-fade-in border border-gray-100 dark:border-gray-600"
             style={{ left: selectionMenu.x, top: selectionMenu.y - 10 }}
           >
             <button 
               onClick={handleAddBookmark}
               className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-200 text-xs font-medium flex items-center space-x-1"
             >
               <i className="fas fa-bookmark text-blue-500"></i>
               <span>Bookmark</span>
             </button>
             <div className="w-px bg-gray-200 dark:bg-gray-600 my-1"></div>
             <button 
               onClick={handleExplainSelection}
               className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-200 text-xs font-medium flex items-center space-x-1"
             >
               <i className="fas fa-magic text-purple-500"></i>
               <span>Explain</span>
             </button>
           </div>
        )}
      </main>

      {/* Controls */}
      <Controls 
        settings={settings}
        updateSettings={updateSettings}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {/* Sidebar Overlay */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        toc={toc}
        metadata={metadata}
        onNavigate={handleNavigate}
        currentChapterSummary={chapterSummary}
        onRequestSummary={handleRequestSummary}
        aiExplanation={aiExplanation}
        // Search Props
        searchResults={searchResults}
        isSearching={isSearching}
        onSearch={handleSearch}
        // Bookmark Props
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
      />

    </div>
  );
};

export default App;