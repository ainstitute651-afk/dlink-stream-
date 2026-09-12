import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  RotateCcw, RotateCw, Settings, PictureInPicture2, 
  AlertTriangle, Loader2, Subtitles, Film, ExternalLink, Sparkles
} from 'lucide-react';
import { DetectedResult } from '../utils/detector';

interface Props {
  detected: DetectedResult;
  theaterMode: boolean;
  onToggleTheater: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onMetadataLoaded: (metadata: {
    duration: number;
    resolution: string;
    mimeType: string;
    title: string;
  }) => void;
  onTimeUpdateProp?: (currentTime: number, duration: number) => void;
  onEndedProp?: () => void;
  initialTime?: number;
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const VideoPlayer: React.FC<Props> = ({
  detected,
  theaterMode,
  onToggleTheater,
  showToast,
  onMetadataLoaded,
  onTimeUpdateProp,
  onEndedProp,
  initialTime = 0,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [subtitleTrackUrl, setSubtitleTrackUrl] = useState<string | null>(null);
  const [subtitleLang, setSubtitleLang] = useState('English');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when URL changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
    setErrorMessage('');
    setIsLoading(true);
  }, [detected.cleanUrl]);

  // Handle video events
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);
      if (onTimeUpdateProp) {
        onTimeUpdateProp(cur, videoRef.current.duration || 0);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setIsLoading(false);

      if (initialTime && initialTime > 0 && initialTime < dur - 3) {
        videoRef.current.currentTime = initialTime;
        setCurrentTime(initialTime);
      }

      const width = videoRef.current.videoWidth;
      const height = videoRef.current.videoHeight;
      const resolution = width && height ? `${width}×${height}` : 'Unknown';
      const mimeType = videoRef.current.currentSrc ? 'video/mp4 / HTML5 Media' : 'Stream';
      
      onMetadataLoaded({
        duration: dur || 0,
        resolution,
        mimeType,
        title: detected.title || 'Video Stream'
      });
    }
  };

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBufferedEnd(bufferedEnd);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setErrorMessage('Playback failed. The source server may block embedding (CORS), require authentication, or use unsupported formats.');
    showToast('Failed to load video resource', 'error');
  };

  // Play/Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Play error:', err);
        setHasError(true);
        setErrorMessage('Playback was blocked or restricted by the browser/server.');
      });
    }
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), duration);
  };

  // Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !muted;
    setMuted(newMuted);
    videoRef.current.muted = newMuted;
  };

  // Speed
  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
    showToast(`Playback speed set to ${speed}×`, 'info');
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // PiP
  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      } else {
        showToast('Picture-in-Picture is not supported by your browser', 'error');
      }
    } catch (err) {
      console.error('PiP error:', err);
      showToast('Picture-in-Picture failed', 'error');
    }
  };

  // Subtitle file upload (.vtt)
  const handleSubtitleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSubtitleTrackUrl(url);
      setSubtitleLang(file.name.replace(/\.[^/.]+$/, ''));
      setSubtitlesEnabled(true);
      showToast(`Loaded subtitles: ${file.name}`, 'success');
    }
  };

  // Mouse activity for hiding controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 3000);
  };

  // Format time (seconds -> MM:SS)
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl transition-all duration-300 group ${
        theaterMode ? 'aspect-[21/9] max-h-[85vh]' : 'aspect-video'
      }`}
    >
      {/* Unsupported or Embed URL handling */}
      {detected.type === 'youtube' || detected.type === 'vimeo' ? (
        <div className="absolute inset-0 w-full h-full bg-black">
          <iframe
            src={detected.embedUrl}
            title={detected.title || 'Embedded Video'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : detected.type === 'unsupported' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/95 backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-xl">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">Webpage Cannot Be Played Directly</h3>
          <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            The provided URL is a standard webpage rather than a direct media file or supported embed. Browsers do not permit external apps to extract video streams from arbitrary webpages due to CORS and security policies.
          </p>
          <a
            href={detected.cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20"
          >
            Open in Original Source <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      ) : hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/95 backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-xl">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">Playback Restricted or CORS Error</h3>
          <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            {errorMessage}
          </p>
          <button
            onClick={() => {
              setHasError(false);
              if (videoRef.current) videoRef.current.load();
            }}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-colors border border-slate-700"
          >
            Retry Playback
          </button>
        </div>
      ) : (
        <>
          {/* HTML5 Video Element */}
          <video
            ref={videoRef}
            src={detected.cleanUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onProgress={handleProgress}
            onError={handleError}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            onEnded={() => {
              setIsPlaying(false);
              if (onEndedProp) onEndedProp();
            }}
            onClick={togglePlay}
            playsInline
            crossOrigin="anonymous"
            className="w-full h-full object-contain cursor-pointer bg-black"
          >
            {subtitleTrackUrl && (
              <track
                kind="subtitles"
                src={subtitleTrackUrl}
                srclang={subtitleLang.toLowerCase().slice(0, 2)}
                label={subtitleLang}
                default={subtitlesEnabled}
              />
            )}
            Your browser does not support the video tag.
          </video>

          {/* Loading spinner */}
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 shadow-2xl flex items-center gap-3 text-slate-200">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                <span className="text-sm font-medium">Loading stream...</span>
              </div>
            </div>
          )}

          {/* Center Play Overlay when paused */}
          {!isPlaying && !isLoading && currentTime === 0 && (
            <div 
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer group/overlay"
            >
              <div className="w-20 h-20 rounded-3xl bg-indigo-600/90 hover:bg-indigo-500 border border-indigo-400/30 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40 group-hover/overlay:scale-110 transition-transform">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            </div>
          )}

          {/* Custom Controls Overlay */}
          <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-4 sm:p-5 transition-opacity duration-300 flex flex-col gap-2.5 z-30 ${
            showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}>
            
            {/* Progress / Seek bar */}
            <div className="relative group/seek flex items-center">
              <div className="absolute inset-x-0 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-slate-700/70 rounded-full"
                  style={{ width: `${duration ? (bufferedEnd / duration) * 100 : 0}%` }}
                />
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-indigo-500 rounded-full"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-x-0 w-full h-3 opacity-0 cursor-pointer"
              />
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between pt-1">
              
              {/* Left group */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-colors"
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button
                  onClick={() => skipTime(-10)}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors hidden sm:block"
                  title="Rewind 10s (←)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => skipTime(10)}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors hidden sm:block"
                  title="Forward 10s (→)"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2 group/vol">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                    title={muted ? 'Unmute (M)' : 'Mute (M)'}
                  >
                    {muted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={muted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hidden sm:block"
                  />
                </div>

                {/* Time display */}
                <div className="text-xs font-mono text-slate-300 pl-2">
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-slate-500 mx-1">/</span>
                  <span className="text-slate-400">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right group */}
              <div className="flex items-center gap-1.5 sm:gap-2 relative">
                
                {/* Subtitle upload */}
                <label className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer" title="Load .vtt Subtitles">
                  <Subtitles className="w-4 h-4" />
                  <input type="file" accept=".vtt" onChange={handleSubtitleUpload} className="hidden" />
                </label>

                {/* Playback speed menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-xs font-semibold font-mono text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                    title="Playback Speed"
                  >
                    {playbackSpeed}×
                  </button>

                  {showSpeedMenu && (
                    <div className="absolute right-0 bottom-full mb-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 min-w-[100px] z-40">
                      <div className="text-[10px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">Speed</div>
                      {PLAYBACK_SPEEDS.map(speed => (
                        <button
                          key={speed}
                          onClick={() => changeSpeed(speed)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono text-left transition-colors ${
                            playbackSpeed === speed ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {speed}×
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Picture in Picture */}
                <button
                  onClick={togglePiP}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors hidden sm:block"
                  title="Picture-in-Picture (P)"
                >
                  <PictureInPicture2 className="w-4 h-4" />
                </button>

                {/* Theater Mode */}
                <button
                  onClick={onToggleTheater}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Theater Mode (T)"
                >
                  <Film className="w-4 h-4" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Fullscreen (F)"
                >
                  <Maximize className="w-4 h-4" />
                </button>

              </div>

            </div>

          </div>
        </>
      )}
    </div>
  );
};
