import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Compass, Search, Bookmark, Settings, Zap, Home as HomeIcon } from 'lucide-react';
import { AppSettings, LibraryEntry, HistoryEntry } from './types';
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import SearchPage from './pages/SearchPage';
import LibraryPage from './pages/LibraryPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import MangaDetailsPage from './pages/MangaDetailsPage';
import ReaderPage from './pages/ReaderPage';
import { AnimatePresence, motion } from 'motion/react';

// --- Context & State ---
interface AppContextType {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, val: any) => void;
  library: LibraryEntry[];
  toggleLibrary: (manga: any) => void;
  history: HistoryEntry[];
  saveHistory: (entry: HistoryEntry) => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Changed to v4 to force reset old cached settings
    const saved = localStorage.getItem('mangaverse_settings_v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return {
      language: 'en',
      dataSaver: false,
      readerBg: 'black',
      readerWidth: 'standard',
      matureMode: true, // Force Enabled
      ageVerified: true, // Force Verified
    };
  });

  const [library, setLibrary] = useState<LibraryEntry[]>(() => {
    const saved = localStorage.getItem('mangaverse_library');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem('mangaverse_history');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('mangaverse_settings_v4', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('mangaverse_library', JSON.stringify(library));
  }, [library]);

  useEffect(() => {
    localStorage.setItem('mangaverse_history', JSON.stringify(history));
  }, [history]);

  const updateSetting = (key: keyof AppSettings, val: any) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleLibrary = (manga: any) => {
    const exists = library.some(m => m.id === manga.id);
    if (exists) {
      setLibrary(prev => prev.filter(m => m.id !== manga.id));
      showToast('Removed from Library');
    } else {
      setLibrary(prev => [...prev, {
        id: manga.id,
        title: manga.title,
        cover: manga.cover,
        addedAt: Date.now()
      }]);
      showToast('Added to Library');
    }
  };

  const saveHistory = (entry: HistoryEntry) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.mangaId !== entry.mangaId);
      const newHistory = [entry, ...filtered].slice(0, 50);
      return newHistory;
    });
  };

  return (
    <AppContext.Provider value={{ settings, updateSetting, library, toggleLibrary, history, saveHistory, toast, showToast }}>
      {children}
    </AppContext.Provider>
  );
};

// --- Layout Components ---
const Sidebar = () => {
  const location = useLocation();
  
  const NavLink = ({ to, icon: Icon, id }: { to: string; icon: any; id: string }) => (
    <Link 
      to={to} 
      className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center hover:bg-zinc-900 group ${location.pathname === to ? 'bg-primary/20 text-primary' : 'text-zinc-500 hover:text-white'}`}
    >
      <Icon className={`w-6 h-6 ${location.pathname === to ? 'fill-current' : ''} group-hover:scale-110 transition-transform`} />
    </Link>
  );

  return (
    <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-24 flex-col items-center py-8 bg-zinc-950 border-r border-zinc-800/50 z-50">
      <Link to="/" className="mb-12 group">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-all duration-300">
          <Zap className="w-7 h-7 fill-current" />
        </div>
      </Link>
      <div className="flex flex-col gap-6 flex-1">
        <NavLink to="/" icon={HomeIcon} id="home" />
        <NavLink to="/discover" icon={Compass} id="discover" />
        <NavLink to="/search" icon={Search} id="search" />
        <NavLink to="/library" icon={Bookmark} id="library" />
      </div>
      <NavLink to="/settings" icon={Settings} id="settings" />
    </nav>
  );
};

const MobileNav = () => {
  const location = useLocation();
  
  const NavLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link 
      to={to} 
      className={`flex flex-col items-center gap-1 p-2 transition-colors ${location.pathname === to ? 'text-primary' : 'text-zinc-500'}`}
    >
      <Icon className={`w-6 h-6 ${location.pathname === to ? 'fill-current' : ''}`} />
      <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
    </Link>
  );

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 header-blur border-t border-zinc-800/50 px-2 py-2 flex items-center justify-around shadow-2xl">
      <NavLink to="/" icon={HomeIcon} label="Home" />
      <NavLink to="/discover" icon={Compass} label="Find" />
      <NavLink to="/search" icon={Search} label="Search" />
      <NavLink to="/library" icon={Bookmark} label="Box" />
    </nav>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useAppContext();
  const location = useLocation();
  const isReader = location.pathname.startsWith('/read');

  return (
    <div className="min-h-screen">
      {!isReader && <Sidebar />}
      {!isReader && <MobileNav />}
      <main className={`${!isReader ? 'lg:ml-24' : ''} min-h-screen`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-24 lg:bottom-12 left-1/2 px-6 py-3 bg-zinc-900 border border-primary/30 rounded-2xl text-[10px] font-black uppercase tracking-widest z-[1000] shadow-2xl text-white"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/manga/:id" element={<MangaDetailsPage />} />
            <Route path="/read/:chapterId" element={<ReaderPage />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;