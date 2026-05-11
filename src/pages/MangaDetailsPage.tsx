import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Plus, Check, BookOpen, ChevronRight, Sparkles, ShieldAlert } from 'lucide-react';
import { apiFetch, getBestTitle, getCoverUrl, getDescription, getTags, getAuthorsAndArtists } from '../services/api';
import { Manga, Chapter } from '../types';
import { LoadingSkeleton, MangaCard } from '../components/MangaCard';
import { useAppContext } from '../App';
import { motion } from 'motion/react';

const MangaDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [recommendations, setRecommendations] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings, toggleLibrary, library, showToast } = useAppContext();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const mangaRes = await apiFetch(`/manga/${id}`, { includes: ['cover_art', 'author', 'artist'] });
        setManga(mangaRes.data);

        const getRatings = () => {
          let r = ["safe", "suggestive"];
          if (settings.matureMode && settings.ageVerified) r.push("erotica");
          return r;
        };

        const chaptersRes = await apiFetch(`/manga/${id}/feed`, {
          limit: 100,
          translatedLanguage: [settings.language, 'en'],
          order: { chapter: 'desc', volume: 'desc' },
          contentRating: getRatings()
        });
        setChapters(chaptersRes.data);

        const recsRes = await apiFetch('/manga', {
          limit: 6,
          'includedTags[]': mangaRes.data.attributes.tags.map((t: any) => t.id).slice(0, 3),
          contentRating: getRatings(),
          includes: ['cover_art'],
          'excludedManga[]': [id]
        });
        setRecommendations(recsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, settings.language, settings.matureMode, settings.ageVerified]);

  if (loading) return <div className="p-12"><LoadingSkeleton count={12} /></div>;
  if (!manga) return <div className="p-12 text-center text-zinc-500 font-black uppercase">Series not found</div>;

  const title = getBestTitle(manga, settings.language);
  const desc = getDescription(manga, settings.language);
  const cover = getCoverUrl(manga, 'original');
  const tags = getTags(manga);
  const { author, artist } = getAuthorsAndArtists(manga);
  const isLib = library.some(m => m.id === id);
  const rating = manga.attributes.contentRating;

  if ((rating === 'erotica' || rating === 'pornographic') && !settings.ageVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950">
        <div className="max-w-md w-full p-10 bg-zinc-900 rounded-4xl border border-red-500/30 text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-600/10 blur-3xl rounded-full"></div>
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">Restricted Content</h2>
            <p className="text-zinc-400 font-bold leading-relaxed">This series is marked as Mature (18+). You must verify your age in settings to continue.</p>
          </div>
          <Link to="/settings" className="block w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-32">
      <div className="relative h-[60vh] lg:h-[70vh] w-full overflow-hidden">
        <img src={cover} className="w-full h-full object-cover blur-3xl opacity-30 scale-125" alt="" />
        <div className="absolute inset-0 hero-alpha-gradient"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-16 -mt-32 relative z-20">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-80 shrink-0 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="aspect-[2/3] rounded-4xl overflow-hidden shadow-2xl border-4 border-zinc-900 group relative bg-zinc-900">
                <img src={getCoverUrl(manga)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => toggleLibrary({ id: manga.id, title, cover: getCoverUrl(manga) })}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-tighter text-sm flex items-center justify-center gap-3 transition-all ${isLib ? 'bg-zinc-800 text-zinc-400' : 'bg-white text-black hover:bg-primary hover:text-white shadow-xl shadow-primary/20'}`}
                >
                  {isLib ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {isLib ? 'In Library' : 'Add to Library'}
                </button>
                {chapters.length > 0 && (
                  <Link to={`/read/${chapters[chapters.length - 1].id}`} className="w-full py-4 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl font-black uppercase tracking-tighter text-sm flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <BookOpen className="w-5 h-5" /> Start Reading
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-10 pt-8 lg:pt-32">
            <div className="space-y-4 text-center lg:text-left">
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                <span>{manga.attributes.status}</span>
                <span className="text-zinc-700">•</span>
                <span>{manga.attributes.year || 'N/A'}</span>
                <span className="text-zinc-700">•</span>
                <span className={rating === 'safe' ? 'text-green-500' : 'text-red-500'}>{rating}</span>
              </div>
              <h1 className="text-4xl lg:text-7xl font-black italic tracking-tighter leading-none uppercase text-white drop-shadow-xl">{title}</h1>
              <p className="text-lg lg:text-xl font-bold text-zinc-400 italic">By {author}{artist !== author ? ' & ' + artist : ''}</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-2">
                {tags.map(t => (
                  <Link key={t} to={`/discover?tag=${t}`} className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-primary/50 transition-colors uppercase">
                    {t}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Synopsis</h3>
              <div className="p-6 lg:p-8 bg-zinc-900/40 header-blur rounded-4xl border border-white/5">
                <p className="text-zinc-300 lg:text-lg leading-relaxed font-medium max-w-4xl">{desc}</p>
              </div>
            </div>

            <div className="space-y-6 pt-10">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Chapters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
                {chapters.map(ch => (
                  <Link key={ch.id} to={`/read/${ch.id}`} className="group flex items-center justify-between p-5 bg-zinc-900/40 hover:bg-zinc-800 rounded-2xl transition-all border border-zinc-800/30">
                    <div className="flex flex-col">
                      <span className="text-sm font-black italic tracking-tighter uppercase group-hover:text-primary transition-colors">
                        Chapter {ch.attributes.chapter || '?'}: {ch.attributes.title || 'No Title'}
                      </span>
                      <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest mt-1">
                        {new Date(ch.attributes.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[8px] font-black px-2 py-1 bg-zinc-800 rounded uppercase tracking-tighter">{ch.attributes.translatedLanguage}</span>
                      <ChevronRight className="w-5 h-5 text-zinc-700" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="pt-20">
              <h2 className="text-2xl lg:text-3xl font-black flex items-center gap-2 italic tracking-tighter uppercase mb-6">
                <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </span>
                You might also like
              </h2>
              <div className="flex overflow-x-auto gap-6 no-scrollbar pb-4">
                {recommendations.map(m => <MangaCard key={m.id} manga={m} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetailsPage;
