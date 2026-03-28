import React, { useEffect, useRef, useState, useCallback } from 'react';
import ePub from 'epubjs';
import { EpubBook, ThemeMode, ReaderSettings, ViewMode } from '../types';

interface ReaderProps {
  fileContent: ArrayBuffer;
  settings: ReaderSettings;
  onBookReady: (book: any) => void;
  onRelocated: (location: any) => void;
  onTextSelected: (text: string, cfiRange: string, rect: { x: number, y: number } | null) => void;
}

const Reader: React.FC<ReaderProps> = ({ 
  fileContent, 
  settings,
  onBookReady, 
  onRelocated,
  onTextSelected
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<any>(null);
  const renditionRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize Book
  // We must re-initialize if the ViewMode (Flow) changes, as RenderTo options are immutable after creation
  useEffect(() => {
    if (!viewerRef.current || !fileContent) return;

    // Cleanup previous instance
    if (bookRef.current) {
      bookRef.current.destroy();
    }

    const book = ePub(fileContent);
    bookRef.current = book;

    // Determine Flow
    const flow = settings.viewMode === ViewMode.SCROLLED ? 'scrolled-doc' : 'paginated';
    const manager = settings.viewMode === ViewMode.SCROLLED ? 'continuous' : 'default';

    const rendition = book.renderTo(viewerRef.current, {
      width: '100%',
      height: '100%',
      flow: flow,
      manager: manager,
    });
    renditionRef.current = rendition;

    // Register Themes with dynamic CSS
    // We use the !important flag for some properties to ensure override
    const commonStyles = {
       'p': { 'font-family': 'inherit !important', 'line-height': 'inherit !important' }
    };

    rendition.themes.register(ThemeMode.LIGHT, { 
      body: { color: '#000000', background: '#ffffff', ...commonStyles },
      '::selection': { background: 'rgba(255,255,0, 0.3)' }
    });
    rendition.themes.register(ThemeMode.DARK, { 
      body: { color: '#cfcfcf', background: '#1a1a1a', ...commonStyles },
      '::selection': { background: 'rgba(255,255,255, 0.3)' },
      a: { color: '#60a5fa' }
    });
    rendition.themes.register(ThemeMode.SEPIA, { 
      body: { color: '#5f4b32', background: '#f4ecd8', ...commonStyles },
      '::selection': { background: 'rgba(95, 75, 50, 0.3)' }
    });

    // Display
    rendition.display();

    // Event Listeners
    rendition.on('relocated', (location: any) => {
      onRelocated(location);
    });

    rendition.on('selected', (cfiRange: string, contents: any) => {
      // Cast to any to fix TS error: Property 'then' does not exist on type 'Range'
      (rendition.getRange(cfiRange) as any).then((range: Range) => {
         const text = range.toString();
         // Calculate client rect for menu positioning
         // Note: The range rect is relative to the iframe document
         const rect = range.getBoundingClientRect();
         // We need to convert this to the main window coordinates
         // We assume simple iframe structure
         const views = viewerRef.current?.querySelectorAll('iframe');
         let frameRect = { left: 0, top: 0 };
         if (views && views.length > 0) {
            frameRect = views[0].getBoundingClientRect();
         }
         
         const absoluteRect = {
           x: frameRect.left + rect.left + (rect.width / 2),
           y: frameRect.top + rect.top
         };

         if(text) onTextSelected(text, cfiRange, absoluteRect);
      });
    });
    
    // Clear selection when clicking elsewhere
    rendition.on('click', () => {
      onTextSelected('', '', null);
    });

    book.ready.then(() => {
      setIsReady(true);
      onBookReady(book);
      // Apply initial styles explicitly after ready
      updateStyles(true);
    });

    const handleResize = () => {
      if(renditionRef.current) {
        renditionRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (bookRef.current) {
        bookRef.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileContent, settings.viewMode]); // Re-run if file or view mode (scroll/page) changes

  // Update Styles when settings props change (without re-init book)
  const updateStyles = useCallback((isInit = false) => {
    if (!renditionRef.current) return;
    
    // Theme
    renditionRef.current.themes.select(settings.theme);
    
    // Font Size
    renditionRef.current.themes.fontSize(`${settings.fontSize}%`);
    
    // Font Family
    renditionRef.current.themes.font(settings.fontFamily);

    // Line Height & Margins
    // epubjs themes override allows setting generic CSS on body
    // For margins, we use padding on body to fake it inside iframe
    renditionRef.current.themes.override('line-height', `${settings.lineHeight} !important`);
    renditionRef.current.themes.override('padding-top', `${settings.marginVertical}px !important`);
    renditionRef.current.themes.override('padding-bottom', `${settings.marginVertical}px !important`);
    renditionRef.current.themes.override('padding-left', `${settings.marginHorizontal}px !important`);
    renditionRef.current.themes.override('padding-right', `${settings.marginHorizontal}px !important`);

    // Spread
    if (settings.viewMode === ViewMode.PAGINATED) {
      renditionRef.current.spread(settings.spread ? 'auto' : 'none');
    }

  }, [settings]);

  useEffect(() => {
    updateStyles();
  }, [updateStyles]);

  // Navigation Listeners
  useEffect(() => {
    const handleNav = (e: CustomEvent) => {
      if (!renditionRef.current) return;
      if (e.detail === 'next') renditionRef.current.next();
      if (e.detail === 'prev') renditionRef.current.prev();
    };
    window.addEventListener('epub-nav' as any, handleNav);
    return () => window.removeEventListener('epub-nav' as any, handleNav);
  }, []);

  return (
    <div className={`w-full h-full relative ${!isReady ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
       <div ref={viewerRef} className="w-full h-full" />
       {!isReady && (
         <div className="absolute inset-0 flex items-center justify-center">
           <div className="loader w-12 h-12 border-4 rounded-full border-gray-200"></div>
         </div>
       )}
    </div>
  );
};

export default Reader;