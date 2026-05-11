import React, { useState, useEffect } from 'react';
import { Search, Clapperboard } from 'lucide-react';
import { apiFetch, EXCLUDED_TAGS } from '../services/api';
import { Manga } from '../types';
import { MangaCard, LoadingSkeleton } from '../components/MangaCard';
import { useAppContext } from '../App';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [manga, setManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const { settings } = useAppContext();

  useEffect(() => {
    if (!query) {
      setManga([]);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const getRatings = () => {
          let r = ["safe", "suggestive"];
          if (settings.matureMode && settings.ageVerified) r.push("erotica");
          return r;
        };

        const res = await apiFetch('/manga', {
          limit: 30,
          title: query,
          'includes[]': 'cover_art',
          'contentRating[]': getRatings(),
          'order[relevance]': 'desc',
          'excludedTags[]': EXCLUDED_TAGS
        });
        setManga(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [query, settings.matureMode, settings.ageVerified]);

  return (
    <div className="p-6 lg:p-16 space-y-12 pb-32">
        <div className="relative group max-w-4xl mx-auto w-full">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find your next story..." 
              className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-4xl p-8 pl-20 text-2xl font-black italic uppercase tracking-tighter focus:outline-none focus:border-primary transition-all shadow-2xl text-white"
            />
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 text-zinc-500 group-focus-within:text-primary transition-colors" />
        </div>

        <div id="search-results">
            {loading ? <LoadingSkeleton count={18} /> : manga.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                {manga.map(m => (
                  <MangaCard key={m.id} manga={m} />
                ))}
              </div>
            ) : query ? (
              <div className="py-32 text-center text-zinc-700 font-black uppercase tracking-widest italic text-2xl opacity-50">No results found for "{query}"</div>
            ) : (
              <div className="py-32 text-center text-zinc-700 font-black uppercase tracking-widest italic text-2xl opacity-50 space-y-4">
                  <Clapperboard className="w-16 h-16 mx-auto mb-6" />
                  <div>What are you looking for today?</div>
              </div>
            )}
        </div>
    </div>
  );
};

export default SearchPage;
