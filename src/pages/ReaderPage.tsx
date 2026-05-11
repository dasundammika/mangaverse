import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings, X, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';
import { apiFetch, getBestTitle, getCoverUrl } from '../services/api';
import { Chapter, Manga } from '../types';
import { useAppContext } from '../App';
import { motion, AnimatePresence } from 'motion/react';

const ReaderPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [manga, setManga] = useState<Manga | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [feed, setFeed] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const { settings, updateSetting, saveHistory } = useAppContext();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch current chapter info first to get manga relationship
        const chapterRes = await apiFetch(`/chapter/${chapterId}`, {
          includes: ['manga', 'scanlation_group']
        });
        const chapterData = chapterRes.data;
        const mangaRel = chapterData.relationships.find((r: any) => r.type === 'manga');
        const mId = mangaRel?.id;

        if (!mId) throw new Error("Could not identify manga for this chapter.");

        const mangaRes = await apiFetch(`/manga/${mId}`, {
           includes: ['cover_art', 'author', 'artist']
        });
        setManga(mangaRes.data);

        // Fetch pages
        const serverRes = await apiFetch(`/at-home/server/${chapterId}`);
        const { baseUrl, chapter: chData } = serverRes;
        const modeDir = settings.dataSaver ? 'data-saver' : 'data';
        const hash = chData.hash;
        const fileNames = settings.dataSaver ? chData.dataSaver : chData.data;
        
        if (!fileNames || fileNames.length === 0) {
            throw new Error("This chapter content is provided by an external publisher and cannot be viewed here.");
        }

        const images = fileNames.map((f: string) => `${baseUrl}/${modeDir}/${hash}/${f}`);
        setPages(images);

        // Fetch full feed for navigation
        const feedRes = await apiFetch(`/manga/${mId}/feed`, {
          limit: 100,
          translatedLanguage: [settings.language, 'en'],
          order: { chapter: 'asc', volume: 'asc' }
        });
        setFeed(feedRes.data);
        
        // Save to history
        saveHistory({
          mangaId: mId,
          chapterId: chapterId!,
          title: getBestTitle(mangaRes.data),
          cover: getCoverUrl(mangaRes.data),
          page: 1,
          lastRead: Date.now()
        });

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chapterId, settings.dataSaver, settings.language]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 100) setShowHeader(false);
      else setShowHeader(true);
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentIndex = feed.findIndex(c => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? feed[currentIndex - 1] : null;
  const nextChapter = currentIndex < feed.length - 1 ? feed[currentIndex + 1] : null;

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="h-screen bg-black flex items-center justify-center p-6 text-center">
      <div className="space-y-6 max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
        <p className="text-xl font-bold text-white uppercase italic">{error}</p>
        <button 
          onClick={() => navigate(manga ? `/manga/${manga.id}` : '/')}
          className="px-10 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest border border-zinc-800"
        >
          Go Back to Series
        </button>
      </div>
    </div>
  );

  const bgClass = settings.readerBg === 'black' ? 'bg-black text-white' : settings.readerBg === 'slate' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900';

  return (
    <div className={`min-h-screen ${bgClass} relative flex flex-col items-center`}>
      {/* Top Header */}
      <motion.header 
        animate={{ y: showHeader ? 0 : -100 }}
        className="fixed top-0 left-0 right-0 z-[100] bg-zinc-950/80 header-blur border-b border-zinc-800/30 p-4 flex items-center justify-between shadow-2xl"
      >
        <div className="flex items-center gap-4">
          <Link to={manga ? `/manga/${manga.id}` : '/'} className="p-3 bg-zinc-900 rounded-2xl hover:bg-zinc-800 transition-all text-white">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h2 className="text-sm font-black tracking-tighter uppercase italic line-clamp-1">{manga ? getBestTitle(manga) : 'Loading...'}</h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Chapter {feed[currentIndex]?.attributes.chapter || '?'}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-3 bg-zinc-900 rounded-2xl hover:bg-zinc-800 transition-all text-white"
        >
          <Settings className="w-6 h-6" />
        </button>
      </motion.header>

      {/* Pages */}
      <div className={`w-full pt-28 pb-32 flex flex-col items-center reader-${settings.readerWidth}`}>
        {pages.map((src, i) => (
          <div key={i} className="relative w-full flex justify-center bg-zinc-950/20 group">
            <img 
              src={src}
              alt={`Page ${i + 1}`}
              className="reader-page-img w-full h-auto"
              loading="lazy"
            />
            <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 header-blur text-[8px] font-black uppercase tracking-widest rounded-full opacity-0 group-hover:opacity-50 transition-opacity">
              Page {i + 1} / {pages.length}
            </div>
          </div>
        ))}

        {/* End Actions */}
        <div className="w-full p-20 flex flex-col items-center gap-8">
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl">
                {prevChapter ? (
                    <button 
                        onClick={() => navigate(`/read/${prevChapter.id}`)}
                        className="flex-1 px-8 py-5 bg-zinc-900 border border-zinc-800 rounded-3xl text-sm font-black uppercase tracking-widest hover:border-primary/50 transition-all text-white flex items-center justify-center gap-3"
                    >
                        <ChevronLeft className="w-5 h-5" /> Previous EP
                    </button>
                ) : (
                    <button disabled className="flex-1 px-8 py-5 bg-zinc-900/50 border border-zinc-800/30 rounded-3xl text-sm font-black uppercase tracking-widest opacity-30 text-white cursor-not-allowed">
                        First Chapter
                    </button>
                )}
                {nextChapter ? (
                    <button 
                        onClick={() => navigate(`/read/${nextChapter.id}`)}
                        className="flex-1 px-8 py-5 bg-primary rounded-3xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-white flex items-center justify-center gap-3"
                    >
                        Next Episode <ChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button disabled className="flex-1 px-8 py-5 bg-zinc-900/50 border border-zinc-800/30 rounded-3xl text-sm font-black uppercase tracking-widest opacity-30 text-white cursor-not-allowed">
                        End of Feed
                    </button>
                )}
            </div>
            <Link to={manga ? `/manga/${manga.id}` : '/'} className="text-zinc-500 font-bold hover:text-primary transition-colors uppercase tracking-widest text-[10px] flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Return to Series Hub
            </Link>
        </div>
      </div>

      {/* Settings Drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-[400px] bg-zinc-950 p-10 lg:p-12 space-y-12 shadow-2xl border-l border-zinc-800 overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black italic tracking-tighter uppercase">Settings</h3>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-3 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 italic">Data Management</h4>
                  <button 
                    onClick={() => updateSetting('dataSaver', !settings.dataSaver)}
                    className={`w-full p-5 rounded-3xl border-2 transition-all font-black text-xs uppercase tracking-widest ${settings.dataSaver ? 'border-primary bg-primary/10 text-primary' : 'border-zinc-800 text-zinc-600'}`}
                  >
                    Data Saver Mode: {settings.dataSaver ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 italic">Reader Theme</h4>
                  <div className="flex gap-4">
                    {['black', 'slate', 'white'].map(t => (
                      <button 
                        key={t}
                        onClick={() => updateSetting('readerBg', t)}
                        className={`flex-1 p-5 rounded-2xl border transition-all text-[10px] font-black uppercase ${settings.readerBg === t ? 'border-primary shadow-lg shadow-primary/20' : 'border-white/10'} ${t === 'black' ? 'bg-zinc-950 text-white' : t === 'slate' ? 'bg-zinc-800 text-white' : 'bg-white text-black'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 italic">Page Scaling</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {['compact', 'standard', 'wide', 'full-width', 'original'].map(w => (
                      <button 
                        key={w}
                        onClick={() => updateSetting('readerWidth', w)}
                        className={`p-4 bg-zinc-900 border rounded-2xl text-[10px] font-black uppercase transition-all ${settings.readerWidth === w ? 'border-primary text-primary bg-primary/10' : 'border-zinc-800 text-zinc-600'}`}
                      >
                        {w.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReaderPage;
