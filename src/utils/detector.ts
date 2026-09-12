import { VideoType } from '../types';

export interface DetectedResult {
  type: VideoType;
  cleanUrl: string;
  embedUrl?: string;
  formatDescription: string;
  title?: string;
}

export function detectVideoUrl(inputUrl: string): DetectedResult {
  const trimmed = inputUrl.trim();
  
  if (!trimmed) {
    return {
      type: 'unsupported',
      cleanUrl: '',
      formatDescription: 'Empty URL'
    };
  }

  // Basic URL validation check
  try {
    new URL(trimmed.startsWith('blob:') || trimmed.startsWith('file:') ? 'http://localhost' + trimmed : trimmed);
  } catch {
    // If not a valid absolute URL, check if it's local blob or relative
    if (!trimmed.startsWith('blob:') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return {
        type: 'unsupported',
        cleanUrl: trimmed,
        formatDescription: 'Invalid URL format'
      };
    }
  }

  // Blob URL (Local file drag & drop)
  if (trimmed.startsWith('blob:')) {
    return {
      type: 'direct',
      cleanUrl: trimmed,
      formatDescription: 'Local File (HTML5 Video)',
      title: 'Local Video File'
    };
  }

  // YouTube detection
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      cleanUrl: trimmed,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1`,
      formatDescription: 'YouTube Video',
      title: `YouTube Video (${videoId})`
    };
  }

  // Vimeo detection
  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]+\/videos\/|album\/[^\/]+\/video\/|video\/|)(\d+)(?:$|\/|\?))/i;
  const vimeoMatch = trimmed.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      cleanUrl: trimmed,
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1`,
      formatDescription: 'Vimeo Video',
      title: `Vimeo Video (${videoId})`
    };
  }

  // HLS stream (.m3u8)
  if (trimmed.toLowerCase().includes('.m3u8') || trimmed.toLowerCase().includes('playlist.m3u8')) {
    return {
      type: 'hls',
      cleanUrl: trimmed,
      formatDescription: 'HLS Streaming (.m3u8)',
      title: getFilenameFromUrl(trimmed) || 'HLS Stream'
    };
  }

  // Direct video file extensions
  const lowerUrl = trimmed.toLowerCase();
  if (
    lowerUrl.endsWith('.mp4') ||
    lowerUrl.endsWith('.webm') ||
    lowerUrl.endsWith('.ogg') ||
    lowerUrl.endsWith('.mov') ||
    lowerUrl.endsWith('.m4v') ||
    lowerUrl.includes('.mp4?') ||
    lowerUrl.includes('.webm?')
  ) {
    let format = 'MP4 Video';
    if (lowerUrl.includes('.webm')) format = 'WebM Video';
    if (lowerUrl.includes('.ogg')) format = 'Ogg Video';
    if (lowerUrl.includes('.mov')) format = 'QuickTime Video';

    return {
      type: 'direct',
      cleanUrl: trimmed,
      formatDescription: format,
      title: getFilenameFromUrl(trimmed) || 'Direct Video'
    };
  }

  // Generic check for common video hosting paths or if it contains video keywords
  if (lowerUrl.includes('video') || lowerUrl.includes('media') || lowerUrl.includes('stream')) {
    return {
      type: 'direct',
      cleanUrl: trimmed,
      formatDescription: 'Direct Stream / Media Link',
      title: getFilenameFromUrl(trimmed) || 'Media Stream'
    };
  }

  // Default fallback for unknown webpages
  return {
    type: 'unsupported',
    cleanUrl: trimmed,
    formatDescription: 'Standard Webpage (Direct playback not supported without embed/direct file URL)'
  };
}

function getFilenameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const segments = pathname.split('/');
    const last = segments[segments.length - 1];
    return last ? decodeURIComponent(last) : '';
  } catch {
    return '';
  }
}

export const SAMPLE_VIDEOS = [
  {
    id: 'sample-1',
    title: 'Big Buck Bunny (MP4 1080p)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'direct' as VideoType,
    category: 'Animation',
    notes: 'Classic open-source Blender Foundation animation test.'
  },
  {
    id: 'sample-2',
    title: 'Elephant Dream (MP4 720p)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    type: 'direct' as VideoType,
    category: 'Sci-Fi',
    notes: 'The worlds first open movie.'
  },
  {
    id: 'sample-3',
    title: 'Tears of Steel (MP4 1080p)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    type: 'direct' as VideoType,
    category: 'VFX / Action',
    notes: 'Open source sci-fi short film shot in Amsterdam.'
  },
  {
    id: 'sample-4',
    title: 'For Bigger Blazes (MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    type: 'direct' as VideoType,
    category: 'Commercial',
    notes: 'Google Chromecast promotional video.'
  },
  {
    id: 'sample-5',
    title: 'Big Buck Bunny HLS Stream (.m3u8)',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    type: 'hls' as VideoType,
    category: 'HLS Test',
    notes: 'Mux sample HLS adaptive bitrate stream.'
  },
  {
    id: 'sample-6',
    title: 'YouTube Sample: Blender Animation',
    url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    type: 'youtube' as VideoType,
    category: 'YouTube',
    notes: 'Big Buck Bunny official YouTube upload.'
  }
];
