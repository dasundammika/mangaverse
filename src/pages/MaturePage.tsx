import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { apiFetch, EXCLUDED_TAGS } from '../services/api';
import { Manga } from '../types';
import { MangaCard, LoadingSkeleton } from '../components/MangaCard';
import { useAppContext } from '../App';
import { Link } from 'react-router-dom';

const MaturePage: React.FC = () => {
  const [manga, setManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useAppContext();

  useEffect(() => {
    if (!settings.ageVerified) return;

    const fetchMature = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/manga', {
          limit: 30,
          'contentRating[]': ['erotica', 'pornographic'],
          'includes[]': 'cover_art',
          'order[followedCount]': 'desc',
          'excludedTags[]': EXCLUDED_TAGS
        });
        setManga(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMature();
  }, [settings.ageVerified]);

  if (!settings.ageVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950">
        <div className="max-w-md w-full p-10 bg-zinc-900 rounded-4xl border border-red-500/30 text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-600/10 blur-3xl rounded-full"></div>
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">Mature Access</h2>
            <p className="text-zinc-400 font-bold leading-relaxed">This section contains adult content. Restricted to verified users only.</p>
          </div>
          <Link to="/settings" className="block w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            Verify in Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-16 space-y-12 pb-32">
        <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-red-600/20 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/20">Restricted Access</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none text-white">Mature Zone</h1>
            <p className="text-zinc-500 font-bold max-w-2xl text-lg italic leading-relaxed uppercase">Curated selection of erotica and mature adult titles from the community.</p>
        </div>

        {loading ? <LoadingSkeleton count={18} /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {manga.map(m => (
              <MangaCard key={m.id} manga={m} />
            ))}
          </div>
        )}
        
        <div className="p-12 bg-red-950/20 border border-red-500/10 rounded-4xl flex flex-col md:flex-row items-center gap-8">
          <AlertTriangle className="w-12 h-12 text-red-500 shrink-0" />
          <div className="space-y-2">
            <h4 className="font-black uppercase tracking-tighter text-white">Advisory Notification</h4>
            <p className="text-zinc-500 text-sm font-bold leading-relaxed">Content in this section is community-uploaded. Report any illegal or non-compliant content directly to the source provider (MangaDex).</p>
          </div>
        </div>
    </div>
  );
};

export default MaturePage;
