/**
 * Utility functions for Enterprise Video Player in LMS Portal.
 * Handles video provider detection, SharePoint/OneDrive URL normalization,
 * embed URL transformation, and direct stream URL generation.
 */

export type VideoProviderType =
  | 'sharepoint'
  | 'onedrive'
  | 'youtube'
  | 'gdrive'
  | 'vimeo'
  | 'loom'
  | 'direct_mp4'
  | 'generic';

export interface VideoProviderInfo {
  provider: VideoProviderType;
  label: string;
  embedUrl: string;
  directStreamUrl?: string;
  isMicrosoftHosted: boolean;
}

/**
 * Detects the video provider and normalizes playback & embed URLs.
 */
export function detectVideoProvider(url: string): VideoProviderInfo {
  if (!url) {
    return {
      provider: 'generic',
      label: 'Corporate Learning Video',
      embedUrl: '',
      isMicrosoftHosted: false,
    };
  }

  const cleanUrl = url.trim();
  const lowerUrl = cleanUrl.toLowerCase();

  // DEBUG LOG TASK 11
  console.log('[ENTERPRISE_VIDEO_DEBUG] 1. Original Video URL:', cleanUrl);

  // 1. SharePoint / OneDrive / Microsoft Stream Hosted Videos
  const isSharePoint = lowerUrl.includes('sharepoint.com') || lowerUrl.includes('onedrive.live.com') || lowerUrl.includes('1drv.ms') || lowerUrl.includes('stream.office.com');

  if (isSharePoint) {
    let embedUrl = cleanUrl;
    let directStreamUrl = cleanUrl;

    // Normalize SharePoint embed URL
    if (cleanUrl.includes('action=embedview') || cleanUrl.includes('action=interactivepreview')) {
      embedUrl = cleanUrl;
    } else {
      const joiner = cleanUrl.includes('?') ? '&' : '?';
      embedUrl = `${cleanUrl}${joiner}action=embedview`;
    }

    // Direct Stream URL (forces raw video download/stream bytes from SharePoint)
    const streamJoiner = cleanUrl.includes('?') ? '&' : '?';
    directStreamUrl = `${cleanUrl}${streamJoiner}download=1`;

    const label = lowerUrl.includes('onedrive') ? 'OneDrive Enterprise Video' : 'SharePoint Stream Video';

    console.log('[ENTERPRISE_VIDEO_DEBUG] 2. Detected Provider: Microsoft (SharePoint/OneDrive)');
    console.log('[ENTERPRISE_VIDEO_DEBUG] 3. Generated Embed URL:', embedUrl);
    console.log('[ENTERPRISE_VIDEO_DEBUG] 4. Direct Stream URL:', directStreamUrl);

    return {
      provider: lowerUrl.includes('onedrive') ? 'onedrive' : 'sharepoint',
      label,
      embedUrl,
      directStreamUrl,
      isMicrosoftHosted: true,
    };
  }

  // 2. YouTube
  const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`;
    console.log('[ENTERPRISE_VIDEO_DEBUG] 2. Detected Provider: YouTube');
    console.log('[ENTERPRISE_VIDEO_DEBUG] 3. Generated Embed URL:', embedUrl);
    return {
      provider: 'youtube',
      label: 'YouTube Player',
      embedUrl,
      directStreamUrl: `https://www.youtube.com/watch?v=${videoId}`,
      isMicrosoftHosted: false,
    };
  }

  // 3. Google Drive / Google Docs Videos
  if (lowerUrl.includes('drive.google.com') || lowerUrl.includes('docs.google.com')) {
    const dMatch = cleanUrl.match(/\/(?:d|file\/d|videos\/d)\/([a-zA-Z0-9_-]+)/);
    const fileId = dMatch ? dMatch[1] : null;
    const embedUrl = fileId
      ? `https://drive.google.com/file/d/${fileId}/preview`
      : cleanUrl;
    const directStreamUrl = fileId
      ? `https://drive.google.com/uc?export=download&id=${fileId}`
      : cleanUrl;

    console.log('[ENTERPRISE_VIDEO_DEBUG] 2. Detected Provider: Google Drive');
    console.log('[ENTERPRISE_VIDEO_DEBUG] 3. Generated Embed URL:', embedUrl);
    return {
      provider: 'gdrive',
      label: 'Google Drive Video Player',
      embedUrl,
      directStreamUrl,
      isMicrosoftHosted: false,
    };
  }

  // 4. Vimeo
  const vimeoMatch = cleanUrl.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    const embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`;
    console.log('[ENTERPRISE_VIDEO_DEBUG] 2. Detected Provider: Vimeo');
    return {
      provider: 'vimeo',
      label: 'Vimeo Video Player',
      embedUrl,
      directStreamUrl: cleanUrl,
      isMicrosoftHosted: false,
    };
  }

  // 5. Loom
  const loomMatch = cleanUrl.match(/(?:loom\.com\/share\/|loom\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (loomMatch && loomMatch[1]) {
    const embedUrl = `https://www.loom.com/embed/${loomMatch[1]}`;
    console.log('[ENTERPRISE_VIDEO_DEBUG] 2. Detected Provider: Loom');
    return {
      provider: 'loom',
      label: 'Loom Video Player',
      embedUrl,
      directStreamUrl: cleanUrl,
      isMicrosoftHosted: false,
    };
  }

  // 6. Direct MP4 / WebM / HLS video files
  const isDirectVideo = /\.(mp4|webm|ogg|m3u8|mpd)(\?.*)?$/i.test(cleanUrl);
  if (isDirectVideo) {
    console.log('[ENTERPRISE_VIDEO_DEBUG] 2. Detected Provider: Direct Video File');
    return {
      provider: 'direct_mp4',
      label: 'Direct HTML5 Video Stream',
      embedUrl: cleanUrl,
      directStreamUrl: cleanUrl,
      isMicrosoftHosted: false,
    };
  }

  // 7. Generic Fallback Cloud Video
  console.log('[ENTERPRISE_VIDEO_DEBUG] 2. Detected Provider: Generic Cloud Video');
  return {
    provider: 'generic',
    label: 'Cloud Video Player',
    embedUrl: cleanUrl,
    directStreamUrl: cleanUrl,
    isMicrosoftHosted: false,
  };
}
