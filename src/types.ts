export interface Manga {
  id: string;
  type: string;
  attributes: {
    title: { [key: string]: string };
    altTitles: { [key: string]: string }[];
    description: { [key: string]: string };
    status: string;
    contentRating: string;
    year: number;
    tags: Tag[];
    [key: string]: any;
  };
  relationships: Relationship[];
}

export interface Tag {
  id: string;
  attributes: {
    name: { en: string };
  };
}

export interface Relationship {
  id: string;
  type: string;
  attributes?: {
    fileName?: string;
    name?: string;
  };
}

export interface Chapter {
  id: string;
  attributes: {
    chapter: string;
    title: string;
    translatedLanguage: string;
    createdAt: string;
    volume: string;
  };
}

export interface HistoryEntry {
  mangaId: string;
  chapterId: string;
  title: string;
  cover: string;
  page: number;
  lastRead: number;
}

export interface LibraryEntry {
  id: string;
  title: string;
  cover: string;
  addedAt: number;
}

export interface AppSettings {
  language: string;
  dataSaver: boolean;
  readerBg: 'black' | 'slate' | 'white';
  readerWidth: 'compact' | 'standard' | 'wide' | 'full-width' | 'original';
  matureMode: boolean;
  ageVerified: boolean;
}
