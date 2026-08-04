'use client';

import React from 'react';
import { EnterpriseVideoPlayer, EnterpriseVideoPlayerProps } from './video/EnterpriseVideoPlayer';
import { detectVideoProvider } from '@/lib/video-utils';

export interface VideoEmbedInfo {
  embedUrl: string;
  directStreamUrl?: string;
  type: 'gdrive' | 'youtube' | 'vimeo' | 'loom' | 'generic';
  label: string;
}

/**
 * Backward compatible getEmbedInfo helper for legacy calls.
 */
export function getEmbedInfo(url: string): VideoEmbedInfo | null {
  const info = detectVideoProvider(url);
  let legacyType: 'gdrive' | 'youtube' | 'vimeo' | 'loom' | 'generic' = 'generic';

  if (info.provider === 'youtube') legacyType = 'youtube';
  else if (info.provider === 'gdrive') legacyType = 'gdrive';
  else if (info.provider === 'vimeo') legacyType = 'vimeo';
  else if (info.provider === 'loom') legacyType = 'loom';

  return {
    embedUrl: info.embedUrl,
    directStreamUrl: info.directStreamUrl,
    type: legacyType,
    label: info.label,
  };
}

/**
 * AntiSkipVideoPlayer re-exported for backward compatibility.
 * Delegates to the enterprise video player architecture.
 */
export function AntiSkipVideoPlayer(props: EnterpriseVideoPlayerProps) {
  return <EnterpriseVideoPlayer {...props} />;
}

export { EnterpriseVideoPlayer };
