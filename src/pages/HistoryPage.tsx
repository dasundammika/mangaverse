import React from 'react';
import { Clock, Play } from 'lucide-react';
import { useAppContext } from '../App';
import { Link } from 'react-router-dom';

const HistoryPage: React.FC = () => {
  const { history } = useAppContext();

  return (
    <div className="p-6 lg:p-16 space-y-12 min-h-screen pb-32">
        <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary italic">Reading Journey</h4>
            <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">History</h1>
        </div>

        {history.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-8 bg-zinc-950 rounded-4xl border border-zinc-800/30">
              <Clock className="w-16 h-16 text-zinc-800" />
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-600">No history yet</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {history.map(h => (
              <Link 
                key={`${h.mangaId}-${h.chapterId}`}
                to={`/read/${h.chapterId}`} 
                className="flex items-center gap-6 p-4 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-3xl transition-all group"
              >
                  <div className="w-24 h-32 shrink-0 rounded-2xl overflow-hidden border border-white/5 bg-zinc-950">
                      <img src={h.cover} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-black italic tracking-tighter uppercase group-hover:text-primary transition-colors">{h.title}</h3>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Last Read: {new Date(h.lastRead).toLocaleDateString()}</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded-full text-[8px] font-black uppercase tracking-tighter">
                        <Play className="w-3 h-3 fill-current" /> Continue Reading
                      </div>
                  </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
};

export default HistoryPage;
