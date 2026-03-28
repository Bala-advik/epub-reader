export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SEPIA = 'sepia'
}

export enum ViewMode {
  PAGINATED = 'paginated', // Horizontal
  SCROLLED = 'scrolled'    // Vertical
}

export interface NavItem {
  id: string;
  href: string;
  label: string;
  subitems?: NavItem[];
}

export interface BookMetadata {
  title?: string;
  creator?: string;
  description?: string;
  pubdate?: string;
  publisher?: string;
  language?: string;
}

export interface TocItem {
  id: string;
  href: string;
  label: string;
  subitems?: TocItem[];
}

export interface Bookmark {
  id: string;
  cfi: string;
  label: string;
  created: number;
}

export interface SearchResult {
  cfi: string;
  excerpt: string;
}

export interface ReaderSettings {
  theme: ThemeMode;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  marginHorizontal: number;
  marginVertical: number;
  viewMode: ViewMode;
  spread: boolean; // true = 2 pages (if space allows), false = 1 page
}

// epubjs Types (Simplified)
export interface EpubBook {
  renderTo: (element: string | HTMLElement, options?: any) => EpubRendition;
  destroy: () => void;
  loaded: {
    navigation: Promise<any>;
    metadata: Promise<any>;
  };
  spine: {
    get: (target: string) => any;
  };
  find: (query: string) => Promise<any[]>;
}

export interface EpubRendition {
  display: (target?: string) => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  themes: {
    register: (name: string, styles: any) => void;
    select: (name: string) => void;
    fontSize: (size: string) => void;
    font: (font: string) => void;
    override: (name: string, value: string) => void;
  };
  spread: (mode: string) => void;
  flow: (mode: string) => void;
  on: (event: string, callback: (e: any) => void) => void;
  off: (event: string, callback: (e: any) => void) => void;
  location: {
    start: { cfi: string; displayed: { page: number; total: number } };
  };
  getRange: (cfi: string) => Promise<Range>;
  resize: (width?: number | string, height?: number | string) => void;
}

export interface AIResponse {
  summary?: string;
  analysis?: string;
  loading: boolean;
  error?: string;
}