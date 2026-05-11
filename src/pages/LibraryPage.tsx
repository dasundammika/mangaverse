import React from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import { useAppContext } from '../App';
import { Link } from 'react-router-dom';

const LibraryPage: React.FC = () => {
  const { library, toggleLibrary } = useAppContext();

  return (
    <div className="p-6 lg:p-16 space-y-12 min-h-screen pb-32">
        <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary italic">Saved Series</h4>
            <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">Library</h1>
        </div>

        {library.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-8 bg-zinc-950 rounded-4xl border border-zinc-800/30">
              <Bookmark className="w-16 h-16 text-zinc-800" />
              <div className="space-y-2">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">Your library is empty</h2>
                  <p className="text-zinc-500 font-bold max-w-xs mx-auto">Save series to keep track of your reading.</p>
              </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {library.sort((a,b) => b.addedAt - a.addedAt).map(m => (
              <div key={m.id} className="relative group">
                <Link to={`/manga/${m.id}`} className="block">
                  <div className="aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
                    <img src={m.cover} className="w-full h-full object-cover" alt={m.title} />
                  </div>
                  <h3 className="mt-3 text-xs font-bold text-white line-clamp-1">{m.title}</h3>
                </Link>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    toggleLibrary({ id: m.id });
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-xl shadow-xl transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default LibraryPage;
