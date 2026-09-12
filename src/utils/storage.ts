import { HistoryItem, FavoriteItem, PlaylistItem, AppSettings } from '../types';

const HISTORY_KEY = 'uvp_history_v1';
const FAVORITES_KEY = 'uvp_favorites_v1';
const PLAYLIST_KEY = 'uvp_playlist_v1';
const SETTINGS_KEY = 'uvp_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: 'indigo',
  doNotSaveHistory: false,
  volume: 1,
  muted: false,
  playbackSpeed: 1,
  theaterMode: false,
  repeatMode: 'off',
  shuffle: false
};

// History
export function getStoredHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): void {
  const settings = getStoredSettings();
  if (settings.doNotSaveHistory) return;

  try {
    const current = getStoredHistory();
    const newItem: HistoryItem = {
      ...item,
      id: 'hist_' + Date.now() + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString()
    };
    // Keep max 50 items
    const updated = [newItem, ...current.filter(h => h.url !== item.url)].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function clearHistoryStorage(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  const current = getStoredHistory();
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function updateHistoryProgress(url: string, progressSeconds: number, duration: number): void {
  const settings = getStoredSettings();
  if (settings.doNotSaveHistory) return;

  try {
    const current = getStoredHistory();
    const index = current.findIndex(h => h.url === url);
    if (index !== -1) {
      current[index].progressSeconds = progressSeconds;
      current[index].duration = duration;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(current));
    }
  } catch (e) {
    console.error('Failed to update history progress', e);
  }
}

// Favorites
export function getStoredFavorites(): FavoriteItem[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFavorite(item: Omit<FavoriteItem, 'id' | 'dateAdded'>): FavoriteItem[] {
  try {
    const current = getStoredFavorites();
    const newFav: FavoriteItem = {
      ...item,
      id: 'fav_' + Date.now() + Math.random().toString(36).substr(2, 5),
      dateAdded: new Date().toISOString()
    };
    const updated = [newFav, ...current];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save favorite', e);
    return getStoredFavorites();
  }
}

export function deleteFavorite(id: string): FavoriteItem[] {
  const current = getStoredFavorites();
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
}

// Playlist
export function getStoredPlaylist(): PlaylistItem[] {
  try {
    const data = localStorage.getItem(PLAYLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePlaylist(items: PlaylistItem[]): void {
  try {
    localStorage.setItem(PLAYLIST_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save playlist', e);
  }
}

// Settings
export function getStoredSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getStoredSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
  return updated;
}

// JSON Export / Import
export function exportAppDataJson(): string {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    history: getStoredHistory(),
    favorites: getStoredFavorites(),
    playlists: getStoredPlaylist(),
    settings: getStoredSettings()
  };
  return JSON.stringify(payload, null, 2);
}

export function importAppDataJson(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid JSON format.' };
    }
    if (data.history && Array.isArray(data.history)) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(data.history));
    }
    if (data.favorites && Array.isArray(data.favorites)) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(data.favorites));
    }
    if (data.playlists && Array.isArray(data.playlists)) {
      localStorage.setItem(PLAYLIST_KEY, JSON.stringify(data.playlists));
    }
    if (data.settings && typeof data.settings === 'object') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, ...data.settings }));
    }
    return { success: true, message: 'Data successfully imported and applied!' };
  } catch (err: any) {
    return { success: false, message: `Failed to parse JSON: ${err.message}` };
  }
}
