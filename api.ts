import { Manga } from '../types';

const DIRECT_API_BASE = 'https://api.mangadex.org';
const COVER_BASE_URL = 'https://uploads.mangadex.org/covers';
const PLACEHOLDER_COVER = 'https://placehold.co/400x600/18181b/3f3f46?text=No+Cover';

export const TAGS = {
  'Action': '391ebde9-f03d-41b4-8745-384f3d251992',
  'Romance': '423e2da2-3a4a-4c07-b6a3-37d40f43702a',
  'Fantasy': 'cdc58593-87dd-415e-bbc0-2ec27bf404cc',
  'Comedy': '4d32b451-110d-4f30-a38e-31396e9e6f6d',
  'Drama': 'b9af3a45-3afd-4ad8-b69c-64983018c5b2',
  'Horror': 'cdadfdc5-ad7a-42b4-9f1d-ad011333035d',
  'Slice of Life': 'e5301a23-ebd9-49dd-a0cb-2abb94451293',
  'Isekai': 'ace04321-c630-455b-b789-64c4448f9790',
  'Full Color': 'f153c506-9c44-4761-8b71-2bd2f0ad4a9a',
  'Long Strip': '3e130c41-8f27-4660-8348-f43c573356e4',
  'Web Comic': 'e197df38-d0e7-43b5-9b09-2842d0c326dd',
};

export const EXCLUDED_TAGS = ['d8a9547b-9159-48d4-92f0-9d0c357042a8', 'ddefd648-5140-4e5f-ba18-4eca4071d19b'];

const cache = new Map<string, any>();

export async function apiFetch(endpoint: string, params: any = {}) {
  const PROXY_API_BASE = localStorage.getItem('mangaverse_proxy') || '';
  
  const globalParams: any = { ...params };
  
  if (endpoint.includes('/manga') || endpoint.includes('/feed')) {
    if (!globalParams['contentRating[]']) {
      globalParams['contentRating[]'] = ['safe', 'suggestive', 'erotica', 'pornographic'];
    }
    if (!globalParams['translatedLanguage[]'] && !globalParams['translatedLanguage']) {
      globalParams['translatedLanguage[]'] = ['en'];
    }
  }

  const cacheKey = endpoint + JSON.stringify(globalParams) + PROXY_API_BASE;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const targetUrl = new URL(endpoint.startsWith('http') ? endpoint : `${DIRECT_API_BASE}${endpoint}`);
  Object.entries(globalParams).forEach(([key, val]) => {
    if (Array.isArray(val)) val.forEach(v => targetUrl.searchParams.append(key, v));
    else if (val !== null && val !== undefined) targetUrl.searchParams.set(key, val as string);
  });

  let finalUrl = targetUrl.toString();
  if (PROXY_API_BASE) {
    if (PROXY_API_BASE.includes('?')) {
      finalUrl = `${PROXY_API_BASE}${encodeURIComponent(targetUrl.toString())}`;
    } else {
      finalUrl = `${PROXY_API_BASE.replace(/\/$/, '')}/${targetUrl.toString().replace(/^https?:\/\//, '')}`;
    }
  }

  try {
    const response = await fetch(finalUrl);
    if (!response.ok) {
      if (response.status === 429) throw new Error("Too many requests (Rate Limited).");
      throw new Error(`API Error: ${response.status}`);
    }
    const data = await response.json();
    cache.set(cacheKey, data);
    return data;
  } catch (err: any) {
    console.error("API Error: ", err);
    throw err;
  }
}

export function getBestTitle(manga: Manga, prefLang: string = 'en') {
  if (!manga?.attributes?.title) return 'Untitled Manga';
  const titleObj = manga.attributes.title;
  const altTitles = manga.attributes.altTitles || [];
  
  if (titleObj[prefLang]) return titleObj[prefLang];
  if (titleObj.en) return titleObj.en;
  
  for (const alt of altTitles) {
    if (alt[prefLang]) return alt[prefLang];
    if (alt.en) return alt.en;
  }
  
  return Object.values(titleObj)[0] || 'Untitled Manga';
}

export function getDescription(manga: Manga, prefLang: string = 'en') {
  const desc = manga?.attributes?.description;
  if (!desc || Array.isArray(desc) || Object.keys(desc).length === 0) return "No description available.";
  const text = desc[prefLang] || desc.en || Object.values(desc)[0] || "No description available.";
  if (typeof text !== 'string') return "No description available.";
  return text.replace(/\[\/?\w+\]/g, '').trim();
}

export function getCoverUrl(manga: Manga, size: number | 'original' = 512) {
  const coverRel = manga?.relationships?.find(r => r.type === 'cover_art');
  if (!coverRel || !coverRel.attributes) return PLACEHOLDER_COVER;
  const fileName = coverRel.attributes.fileName;
  if (size === 'original') return `${COVER_BASE_URL}/${manga.id}/${fileName}`;
  return `${COVER_BASE_URL}/${manga.id}/${fileName}.${size}.jpg`;
}

export function getTags(manga: Manga) {
  if (!manga?.attributes?.tags) return [];
  return manga.attributes.tags.map(t => t.attributes?.name?.en).filter(Boolean);
}

export function getAuthorsAndArtists(manga: Manga) {
  const authorRel = manga?.relationships?.find(r => r.type === 'author');
  const artistRel = manga?.relationships?.find(r => r.type === 'artist') || authorRel;
  const author = authorRel?.attributes?.name || 'Unknown Author';
  const artist = artistRel?.attributes?.name || author;
  return { author, artist };
}