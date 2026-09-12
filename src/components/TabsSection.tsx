import React, { useState } from 'react';
import { History, Star, ListMusic, Trash2, Play, Search, Shuffle, Repeat, ArrowUpDown, ExternalLink } from 'lucide-react';
import { HistoryItem, FavoriteItem, PlaylistItem } from '../types';

interface Props {
  history: HistoryItem[];
  favorites: FavoriteItem[];
  playlist: PlaylistItem[];
  onSelectUrl: (url: string) => void;
  onClearHistory: () => void;
  onDeleteHistory: (id: string) => void;
  onDeleteFavorite: (id: string) => void;
  onUpdatePlaylist: (items: PlaylistItem[]) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TabsSection: React.FC<Props> = ({
  history,
  favorites,
  playlist,
  onSelectUrl,
  onClearHistory,
  onDeleteHistory,
  onDeleteFavorite,
  onUpdatePlaylist,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'favorites' | 'playlist'>('history');
  const [searchQuery, setSearchQuery] = useState('');
  const [favCategoryFilter, setFavCategoryFilter] = useState('all');

  // Filtered History
  const filteredHistory = history.filter(h => 
    h.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Categories for favorites
  const categories = ['all', ...Array.from(new Set(favorites.map(f => f.category || 'General')))];
  
  const filteredFavorites = favorites.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = favCategoryFilter === 'all' || (f.category || 'General') === favCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const filteredPlaylist = playlist.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const removePlaylistItem = (id: string) => {
    const updated = playlist.filter(p => p.id !== id);
    onUpdatePlaylist(updated);
    showToast('Removed item from playlist', 'info');
  };

  const movePlaylistIndex = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= playlist.length) return;
    const copy = [...playlist];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;
    onUpdatePlaylist(copy);
  };

  const shufflePlaylist = () => {
    const copy = [...playlist];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    onUpdatePlaylist(copy);
    showToast('Playlist shuffled!', 'success');
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
      
      {/* Tabs Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        
        {/* Tab buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'favorites' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Favorites ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('playlist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'playlist' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Playlist ({playlist.length})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
          />
        </div>

      </div>

      {/* Favorites Category filters */}
      {activeTab === 'favorites' && categories.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 font-medium mr-2">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFavCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                favCategoryFilter === cat ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Playlist Controls */}
      {activeTab === 'playlist' && playlist.length > 0 && (
        <div className="flex items-center justify-between bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Queue management & playback order</span>
          <button
            onClick={shufflePlaylist}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-700"
          >
            <Shuffle className="w-3.5 h-3.5 text-indigo-400" /> Shuffle Queue
          </button>
        </div>
      )}

      {/* Content List */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        
        {/* History Tab */}
        {activeTab === 'history' && (
          filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No watch history found.</div>
          ) : (
            <>
              <div className="flex justify-end pb-2">
                <button
                  onClick={onClearHistory}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All History
                </button>
              </div>
              {filteredHistory.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/80 transition-colors group">
                  <div className="space-y-0.5 truncate pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase tracking-wide">
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h4 className="font-medium text-sm text-slate-200 truncate">{item.title}</h4>
                    <p className="text-xs font-mono text-slate-500 truncate">{item.url}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onSelectUrl(item.url)}
                      className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
                      title="Play"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={() => onDeleteHistory(item.id)}
                      className="p-2 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          filteredFavorites.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No favorites bookmarked yet. Click 'Add to Favorites' on any video.</div>
          ) : (
            filteredFavorites.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/80 transition-colors group">
                <div className="space-y-0.5 truncate pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                      {item.category || 'General'}
                    </span>
                    <span className="text-xs text-slate-400">{item.type}</span>
                  </div>
                  <h4 className="font-medium text-sm text-slate-200 truncate">{item.name}</h4>
                  <p className="text-xs font-mono text-slate-500 truncate">{item.url}</p>
                  {item.notes && <p className="text-xs text-slate-400 italic truncate">{item.notes}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onSelectUrl(item.url)}
                    className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
                    title="Play"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => onDeleteFavorite(item.id)}
                    className="p-2 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete favorite"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {/* Playlist Tab */}
        {activeTab === 'playlist' && (
          filteredPlaylist.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">Your playlist is empty. Add videos from the video panel.</div>
          ) : (
            filteredPlaylist.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/80 transition-colors group">
                <div className="flex items-center gap-3 truncate pr-4">
                  <span className="text-xs font-mono font-bold text-indigo-400 w-5">{idx + 1}.</span>
                  <div className="space-y-0.5 truncate">
                    <h4 className="font-medium text-sm text-slate-200 truncate">{item.title}</h4>
                    <p className="text-xs font-mono text-slate-500 truncate">{item.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => movePlaylistIndex(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => movePlaylistIndex(idx, 'down')}
                    disabled={idx === playlist.length - 1}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move down"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => onSelectUrl(item.url)}
                    className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors ml-1"
                    title="Play"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => removePlaylistItem(item.id)}
                    className="p-2 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )
        )}

      </div>

    </div>
  );
};
