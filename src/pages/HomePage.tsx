import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, Smartphone, Heart, CheckCircle, Zap, Plus, Play } from 'lucide-react';
import { apiFetch, getBestTitle, getCoverUrl, getDescription, getTags, EXCLUDED_TAGS } from '../services/api';
import { Manga } from '../types';
import { MangaCard, LoadingSkeleton } from '../components/MangaCard';
import { useAppContext } from '../App';
import { motion, AnimatePresence } from 'motion/react';

const HeroCarousel = ({ mangaList }: { mangaList: Manga[] }) => {
  const [current, setCurrent] = useState(0);
  const { settings, toggleLibrary } = useAppContext();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % mangaList.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [mangaList.length]);

  return (
    <div className="relative h-[70vh] lg:h-[85vh] w-full overflow-hidden group">
      <AnimatePresence mode="popLayout">
        {mangaList.map((m, i) => i === current && (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img src={getCoverUrl(m, 'original')} className="w-full h-full object-cover blur-md opacity-40 scale-110" alt="" />
            <div className="absolute inset-0 hero-alpha-gradient"></div>
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-7xl mx-auto w-full px-6 lg:px-16 pb-20 lg:pb-32 flex flex-col lg:flex-row items-center gap-10">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-48 lg:w-72 shrink-0 aspect-[2/3] rounded-4xl overflow-hidden shadow-2xl border border-white/10"
                >
                  <img src={getCoverUrl(m)} className="w-full h-full object-cover" alt="" />
                </motion.div>
                <div className="flex-1 text-center lg:text-left space-y-4">
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap justify-center lg:justify-start gap-2"
                  >
                    <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase rounded-full shadow-lg italic tracking-widest">Trending Now</span>
                    <span className="px-3 py-1 bg-white/10 header-blur border border-white/5 text-[10px] font-bold rounded-full">{getTags(m)[0] || 'Official'}</span>
                  </motion.div>
                  <motion.h1 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl lg:text-7xl font-black italic tracking-tighter leading-none text-white drop-shadow-2xl line-clamp-2 uppercase"
                  >
                    {getBestTitle(m, settings.language)}
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-zinc-400 text-sm lg:text-lg font-medium line-clamp-3 max-w-2xl leading-relaxed"
                  >
                    {getDescription(m, settings.language)}
                  </motion.p>
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4"
                  >
                    <Link to={`/manga/${m.id}`} className="px-10 py-5 bg-gradient-to-br from-primary to-secondary hover:scale-105 active:scale-95 rounded-2xl font-black shadow-2xl shadow-primary/30 transition-all uppercase tracking-tighter">
                      Enter Series
                    </Link>
                    <button 
                      onClick={() => toggleLibrary(m)}
                      className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all"
                    >
                      <Plus className="w-7 h-7" />
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
        {mangaList.map((_, i) => (
          <button 
            key={i}
            onClick={() => setCurrent(i)} 
            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'w-8 bg-primary' : 'bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
};

const HorizontalSection = ({ title, mangaList, icon: Icon }: { title: string; mangaList: Manga[]; icon: any }) => {
  if (!mangaList || mangaList.length === 0) return null;
  return (
    <section className="space-y-6 px-4 lg:px-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl lg:text-3xl font-black flex items-center gap-2 italic tracking-tighter uppercase">
          <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </span>
          {title}
        </h2>
      </div>
      <div className="flex overflow-x-auto gap-6 no-scrollbar scroll-snap-x pb-4">
        {mangaList.map(m => (
          <MangaCard key={m.id} manga={m} />
        ))}
      </div>
    </section>
  );
};

const HomePage: React.FC = () => {
  const [data, setData] = useState<{ [key: string]: Manga[] }>({});
  const [loading, setLoading] = useState(true);
  const { settings, history } = useAppContext();

  useEffect(() => {
    const fetchData = async () => {
      const getRatings = () => {
        let r = ["safe", "suggestive"];
        if (settings.matureMode && settings.ageVerified) r.push("erotica");
        return r;
      };

      const params = {
        limit: 12,
        contentRating: getRatings(),
        includes: ['cover_art', 'author', 'artist'],
        'excludedTags[]': EXCLUDED_TAGS
      };

      try {
        const [trending, updated, webtoons, romance, action, completed] = await Promise.all([
          apiFetch('/manga', { ...params, order: { followedCount: 'desc' }, limit: 6 }),
          apiFetch('/manga', { ...params, order: { updatedAt: 'desc' } }),
          apiFetch('/manga', { ...params, 'includedTags[]': ['3e130c41-8f27-4660-8348-f43c573356e4', 'f153c506-9c44-4761-8b71-2bd2f0ad4a9a'] }),
          apiFetch('/manga', { ...params, 'includedTags[]': ['423e2da2-3a4a-4c07-b6a3-37d40f43702a'] }),
          apiFetch('/manga', { ...params, 'includedTags[]': ['391ebde9-f03d-41b4-8745-384f3d251992'] }),
          apiFetch('/manga', { ...params, status: ['completed'] })
        ]);

        setData({
          trending: trending.data,
          updated: updated.data,
          webtoons: webtoons.data,
          romance: romance.data,
          action: action.data,
          completed: completed.data
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [settings.matureMode, settings.ageVerified]);

  if (loading) return (
    <div className="space-y-16 py-12">
      <div className="aspect-[21/9] w-full bg-zinc-900 shimmer"></div>
      <div className="px-12"><LoadingSkeleton count={6} /></div>
      <div className="px-12"><LoadingSkeleton count={6} /></div>
    </div>
  );

  return (
    <div className="space-y-16 pb-32">
      {data.trending && <HeroCarousel mangaList={data.trending} />}
      
      {history.length > 0 && (
        <div className="px-4 lg:px-12">
          <div className="p-6 lg:p-10 bg-gradient-to-r from-zinc-900 to-black rounded-4xl border border-white/5 flex flex-col md:flex-row items-center gap-8 shadow-2xl overflow-hidden relative group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full"></div>
            <img src={history[0].cover} className="w-32 lg:w-40 aspect-[2/3] object-cover rounded-2xl shadow-2xl relative z-10 transition-transform group-hover:scale-105" alt="" />
            <div className="relative z-10 flex-1 text-center md:text-left space-y-3">
              <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Jump Back In</span>
              <h2 className="text-2xl lg:text-3xl font-black italic tracking-tighter uppercase text-white">{history[0].title}</h2>
              <div className="pt-2">
                <Link to={`/read/${history[0].chapterId}`} className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-primary hover:text-white transition-all uppercase tracking-tighter text-sm">
                  <Play className="w-5 h-5 fill-current" /> Continue Reading
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <HorizontalSection title="Trending Now" mangaList={data.trending || []} icon={Flame} />
      <HorizontalSection title="Recently Updated" mangaList={data.updated || []} icon={Clock} />
      <HorizontalSection title="Webtoon Picks" mangaList={data.webtoons || []} icon={Smartphone} />
      <HorizontalSection title="Romance & Fantasy" mangaList={data.romance || []} icon={Heart} />
      <HorizontalSection title="Completed Series" mangaList={data.completed || []} icon={CheckCircle} />
      <HorizontalSection title="Adrenaline Rush" mangaList={data.action || []} icon={Zap} />
    </div>
  );
};

export default HomePage;
