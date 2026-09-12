export type VideoType = 'direct' | 'hls' | 'youtube' | 'vimeo' | 'embed' | 'unsupported';

export interface VideoItem {
  id: string;
  url: string;
  title: string;
  type: VideoType;
  detectedFormat?: string;
  category?: string;
  notes?: string;
  dateAdded: string;
  duration?: number;
  thumbnail?: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  type: VideoType;
  timestamp: string;
  progressSeconds?: number;
  duration?: number;
}

export interface FavoriteItem {
  id: string;
  url: string;
  name: string;
  category: string;
  notes: string;
  dateAdded: string;
  type: VideoType;
}

export interface PlaylistItem {
  id: string;
  url: string;
  title: string;
  type: VideoType;
  duration?: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet' | 'cyan';

export interface AppSettings {
  theme: ThemeMode;
  accentColor: AccentColor;
  doNotSaveHistory: boolean;
  volume: number;
  muted: boolean;
  playbackSpeed: number;
  theaterMode: boolean;
  repeatMode: 'off' | 'all' | 'one';
  shuffle: boolean;
}
