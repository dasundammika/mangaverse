import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { apiFetch, TAGS, EXCLUDED_TAGS } from '../services/api';
import { Manga } from '../types';
import { MangaCard, LoadingSkeleton } from '../components/MangaCard';
import { useAppContext } from '../App';

const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [manga, setManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const activeTag = searchParams.get('tag') || 'Popular';
  const { settings } = useAppContext();

  useEffect(() => {
    const fetchDiscover = async () => {
      setLoading(true);
      try {
        const getRatings = () => {
          let r = ["safe", "suggestive"];
          if (settings.matureMode && settings.ageVerified) r.push("erotica");
          return r;
        };

        const params: any = {
          limit: 30,
          'includes[]': 'cover_art',
          'contentRating[]': getRatings(),
          'excludedTags[]': EXCLUDED_TAGS
        };

        const tagId = TAGS[activeTag as keyof typeof TAGS];
        if (tagId) {
          params['includedTags[]'] = [tagId];
          params['order[followedCount]'] = 'desc';
        } else {
          params['order[followedCount]'] = 'desc';
        }

        const res = await apiFetch('/manga', params);
        setManga(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscover();
  }, [activeTag, settings.matureMode, settings.ageVerified]);

  return (
    <div className="p-6 lg:p-16 space-y-12 pb-32">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary italic">Explore Library</h4>
                <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">{activeTag}</h1>
            </div>
            <div className="flex items-center gap-4 bg-zinc-900/50 header-blur p-2 rounded-2xl border border-zinc-800 overflow-x-auto no-scrollbar max-w-full">
                <button 
                  onClick={() => setSearchParams({ tag: 'Popular' })}
                  className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTag === 'Popular' ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'text-zinc-500 hover:text-white'}`}
                >
                  Popular
                </button>
                {Object.keys(TAGS).map(t => (
                  <button 
                    key={t}
                    onClick={() => setSearchParams({ tag: t })}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0 ${activeTag === t ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'text-zinc-500 hover:text-white'}`}
                  >
                    {t}
                  </button>
                ))}
            </div>
        </div>

        {loading ? <LoadingSkeleton count={18} /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {manga.map(m => (
              <MangaCard key={m.id} manga={m} />
            ))}
          </div>
        )}
    </div>
  );
};

export default DiscoverPage;
