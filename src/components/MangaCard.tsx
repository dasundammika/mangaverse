import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Manga } from '../types';
import { getBestTitle, getCoverUrl, getTags } from '../services/api';
import { useAppContext } from '../App';

export const LoadingSkeleton = ({ count = 6, grid = true }) => {
  const content = Array(count).fill(0).map((_, i) => (
    <div key={i} className="space-y-4">
      <div className="aspect-[2/3] bg-zinc-900 rounded-3xl shimmer"></div>
      <div className="h-4 w-3/4 bg-zinc-900 rounded shimmer"></div>
      <div className="h-3 w-1/2 bg-zinc-900 rounded shimmer"></div>
    </div>
  ));

  return grid ? (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {content}
    </div>
  ) : (
    <div className="flex gap-6 overflow-hidden">
      {content}
    </div>
  );
};

export const MangaCard = ({ manga }: { manga: Manga }) => {
  const { settings } = useAppContext();
  const title = getBestTitle(manga, settings.language);
  const cover = getCoverUrl(manga);
  const tags = getTags(manga);
  const isWebtoon = tags.includes('Long Strip') || tags.includes('Web Comic') || tags.includes('Full Color');
  const status = manga.attributes.status;
  const rating = manga.attributes.contentRating;

  return (
    <Link to={`/manga/${manga.id}`} className="group block scroll-snap-align min-w-[150px] sm:min-w-[200px] lg:min-w-[0px]">
      <div className="relative aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-[1.03] group-hover:-translate-y-1 bg-zinc-900 border border-zinc-800/30">
        <img 
          src={cover}
          alt={title} 
          className="w-full h-full object-cover transition-opacity duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 manga-card-gradient"></div>
        
        <div className="absolute top-2 left-2 flex flex-col gap-1">
             <span className="px-2 py-1 bg-black/60 header-blur text-[8px] font-black uppercase rounded-lg text-white border border-white/10 italic tracking-tighter">{status}</span>
             {isWebtoon && <span className="px-2 py-1 bg-primary text-white text-[8px] font-black uppercase rounded-lg italic tracking-tighter shadow-lg shadow-primary/20">Webtoon</span>}
        </div>

        {(rating === 'erotica' || rating === 'pornographic') && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-red-600 text-white text-[8px] font-black uppercase rounded-lg shadow-lg">18+ Mature</span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xs font-bold text-white line-clamp-2 drop-shadow-md group-hover:text-primary transition-colors">{title}</h3>
        </div>
        
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <div className="w-10 h-10 bg-white text-primary rounded-full flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300">
                <Play className="w-5 h-5 fill-current ml-0.5" />
             </div>
        </div>
      </div>
    </Link>
  );
};
