import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { UrlInputBar } from './components/UrlInputBar';
import { VideoPlayer } from './components/VideoPlayer';
import { VideoInfoPanel } from './components/VideoInfoPanel';
import { TabsSection } from './components/TabsSection';
import { ToastContainer, ToastMessage } from './components/Toast';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { JsonImportExportModal } from './components/JsonImportExportModal';
import { ExampleUrlsModal } from './components/ExampleUrlsModal';

import { 
  AppSettings, HistoryItem, FavoriteItem, PlaylistItem 
} from './types';
import { 
  getStoredSettings, saveSettings, 
  getStoredHistory, saveHistoryItem, clearHistoryStorage, deleteHistoryItem,
  getStoredFavorites, saveFavorite, deleteFavorite,
  getStoredPlaylist, savePlaylist, updateHistoryProgress
} from './utils/storage';
import { detectVideoUrl, DetectedResult, SAMPLE_VIDEOS } from './utils/detector';

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const h = Math.floor(m / 60);
  if (h > 0) {
    const remM = m % 60;
    return `${h}:${remM < 10 ? '0' : ''}${remM}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function App() {
  // Settings & Theme
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  
  // URL & Detected State
  const [currentUrl, setCurrentUrl] = useState<string>(SAMPLE_VIDEOS[0].url);
  const [detected, setDetected] = useState<DetectedResult>(detectVideoUrl(SAMPLE_VIDEOS[0].url));
  const [initialTime, setInitialTime] = useState<number>(0);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState<number | null>(0);
  const [metadata, setMetadata] = useState({
    duration: 0,
    resolution: '1920×1080',
    mimeType: 'video/mp4',
    title: SAMPLE_VIDEOS[0].title
  });

  // History, Favorites, Playlist
  const [history, setHistory] = useState<HistoryItem[]>(getStoredHistory());
  const [favorites, setFavorites] = useState<FavoriteItem[]>(getStoredFavorites());
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(getStoredPlaylist());

  // Modals
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Update settings handler
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = saveSettings(newSettings);
    setSettings(updated);
  };

  // Load URL action
  const handleLoadUrl = (urlToLoad: string, fromPlaylistIndex?: number) => {
    const trimmed = urlToLoad.trim();
    if (!trimmed) {
      showToast('Please enter a valid URL', 'error');
      return;
    }

    const result = detectVideoUrl(trimmed);
    setDetected(result);
    setCurrentUrl(trimmed);

    // Check history for saved progress (resume)
    const storedHist = getStoredHistory();
    const existingHist = storedHist.find(h => h.url === trimmed);
    let resumedTime = 0;
    if (existingHist && existingHist.progressSeconds && existingHist.progressSeconds > 3) {
      resumedTime = existingHist.progressSeconds;
      setInitialTime(resumedTime);
      showToast(`Resumed playback from ${formatTime(resumedTime)}`, 'info');
    } else {
      setInitialTime(0);
    }

    // Set playlist index if applicable
    if (typeof fromPlaylistIndex === 'number') {
      setCurrentPlaylistIndex(fromPlaylistIndex);
    } else {
      const plIndex = playlist.findIndex(p => p.url === trimmed);
      if (plIndex !== -1) {
        setCurrentPlaylistIndex(plIndex);
      } else {
        setCurrentPlaylistIndex(null);
      }
    }

    // Save to history unless incognito is enabled
    if (!settings.doNotSaveHistory && result.type !== 'unsupported') {
      saveHistoryItem({
        url: trimmed,
        title: result.title || 'Video Stream',
        type: result.type
      });
      setHistory(getStoredHistory());
    }

    if (resumedTime === 0) {
      showToast(`Loaded ${result.formatDescription}`, 'success');
    }
  };

  // Auto-play next in playlist when current video ends
  const handleVideoEnded = () => {
    if (currentPlaylistIndex !== null && playlist.length > 0) {
      const nextIdx = currentPlaylistIndex + 1;
      if (nextIdx < playlist.length) {
        setCurrentPlaylistIndex(nextIdx);
        const nextItem = playlist[nextIdx];
        handleLoadUrl(nextItem.url, nextIdx);
        showToast(`Auto-playing next: ${nextItem.title}`, 'info');
      } else if (settings.repeatMode === 'all' || playlist.length > 1) {
        setCurrentPlaylistIndex(0);
        const firstItem = playlist[0];
        handleLoadUrl(firstItem.url, 0);
        showToast(`Repeating playlist from start`, 'info');
      }
    }
  };

  // Handle drag and drop local video file
  const handleFileDrop = (file: File) => {
    const blobUrl = URL.createObjectURL(file);
    const result: DetectedResult = {
      type: 'direct',
      cleanUrl: blobUrl,
      formatDescription: `Local File (${file.type || 'Video'})`,
      title: file.name
    };
    setDetected(result);
    setCurrentUrl(blobUrl);
    showToast(`Loaded local file: ${file.name}`, 'success');
  };

  // Favorites toggle
  const isCurrentFavorite = favorites.some(f => f.url === detected.cleanUrl);

  const handleToggleFavorite = () => {
    if (isCurrentFavorite) {
      const fav = favorites.find(f => f.url === detected.cleanUrl);
      if (fav) {
        const updated = deleteFavorite(fav.id);
        setFavorites(updated);
        showToast('Removed from favorites', 'info');
      }
    } else {
      const updated = saveFavorite({
        url: detected.cleanUrl,
        name: detected.title || 'Favorite Video',
        category: 'General',
        notes: '',
        type: detected.type
      });
      setFavorites(updated);
      showToast('Added to favorites!', 'success');
    }
  };

  // Add to Playlist
  const handleAddToPlaylist = () => {
    const newItem: PlaylistItem = {
      id: 'pl_' + Date.now(),
      url: detected.cleanUrl,
      title: detected.title || 'Playlist Item',
      type: detected.type
    };
    const updated = [...playlist, newItem];
    setPlaylist(updated);
    savePlaylist(updated);
    showToast('Added item to playlist queue', 'success');
  };

  // Data reload after JSON import
  const handleDataImported = () => {
    setHistory(getStoredHistory());
    setFavorites(getStoredFavorites());
    setPlaylist(getStoredPlaylist());
    setSettings(getStoredSettings());
    showToast('Application state refreshed from JSON', 'success');
  };

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const videoEl = document.querySelector('video');

      if (e.code === 'Space') {
        e.preventDefault();
        if (videoEl) {
          if (videoEl.paused) videoEl.play();
          else videoEl.pause();
        }
      } else if (e.code === 'KeyM') {
        if (videoEl) {
          videoEl.muted = !videoEl.muted;
        }
      } else if (e.code === 'KeyF') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen();
        }
      } else if (e.code === 'KeyT') {
        handleUpdateSettings({ theaterMode: !settings.theaterMode });
      } else if (e.code === 'ArrowLeft') {
        if (videoEl) videoEl.currentTime = Math.max(videoEl.currentTime - 10, 0);
      } else if (e.code === 'ArrowRight') {
        if (videoEl) videoEl.currentTime = Math.min(videoEl.currentTime + 10, videoEl.duration || 100);
      } else if (e.code === 'ArrowUp') {
        if (videoEl) videoEl.volume = Math.min(videoEl.volume + 0.05, 1);
      } else if (e.code === 'ArrowDown') {
        if (videoEl) videoEl.volume = Math.max(videoEl.volume - 0.05, 0);
      } else if (e.key >= '0' && e.key <= '9') {
        if (videoEl && videoEl.duration) {
          const digit = parseInt(e.key);
          const percent = digit === 0 ? 0 : digit * 10;
          videoEl.currentTime = (videoEl.duration * percent) / 100;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.theaterMode]);

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white ${settings.theme}`}>
      
      {/* Header */}
      <Header
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        onOpenExamples={() => setIsExamplesOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        
        {/* URL Input Bar */}
        <UrlInputBar
          currentUrl={currentUrl}
          onUrlChange={setCurrentUrl}
          onLoadUrl={handleLoadUrl}
          onFileDrop={handleFileDrop}
          doNotSaveHistory={settings.doNotSaveHistory}
          onToggleDoNotSaveHistory={() => handleUpdateSettings({ doNotSaveHistory: !settings.doNotSaveHistory })}
          onOpenExamples={() => setIsExamplesOpen(true)}
          showToast={showToast}
        />

        {/* Video Player */}
        <VideoPlayer
          detected={detected}
          theaterMode={settings.theaterMode}
          onToggleTheater={() => handleUpdateSettings({ theaterMode: !settings.theaterMode })}
          showToast={showToast}
          onMetadataLoaded={(meta) => setMetadata(meta)}
          initialTime={initialTime}
          onTimeUpdateProp={(cur, dur) => {
            if (detected.type !== 'unsupported' && dur > 0) {
              updateHistoryProgress(detected.cleanUrl, cur, dur);
            }
          }}
          onEndedProp={handleVideoEnded}
        />

        {/* Video Information Panel */}
        <VideoInfoPanel
          detected={detected}
          metadata={metadata}
          isFavorite={isCurrentFavorite}
          onToggleFavorite={handleToggleFavorite}
          onAddToPlaylist={handleAddToPlaylist}
          showToast={showToast}
        />

        {/* History / Favorites / Playlist Tabs Section */}
        <TabsSection
          history={history}
          favorites={favorites}
          playlist={playlist}
          onSelectUrl={(url) => {
            const idx = playlist.findIndex(p => p.url === url);
            handleLoadUrl(url, idx !== -1 ? idx : undefined);
          }}
          onClearHistory={() => {
            clearHistoryStorage();
            setHistory([]);
            showToast('History cleared', 'info');
          }}
          onDeleteHistory={(id) => {
            const updated = deleteHistoryItem(id);
            setHistory(updated);
          }}
          onDeleteFavorite={(id) => {
            const updated = deleteFavorite(id);
            setFavorites(updated);
            showToast('Removed from favorites', 'info');
          }}
          onUpdatePlaylist={(items) => {
            setPlaylist(items);
            savePlaylist(items);
          }}
          showToast={showToast}
        />

      </main>

      {/* Modals */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <JsonImportExportModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        onDataImported={handleDataImported}
        showToast={showToast}
      />

      <ExampleUrlsModal
        isOpen={isExamplesOpen}
        onClose={() => setIsExamplesOpen(false)}
        onSelectVideo={({ url, title }) => {
          setCurrentUrl(url);
          handleLoadUrl(url);
        }}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
