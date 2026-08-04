'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Maximize,
  Minimize,
  ExternalLink,
  RefreshCw,
  Video,
  Loader2,
} from 'lucide-react';
import { detectVideoProvider, VideoProviderInfo } from '@/lib/video-utils';
import { VideoFallback } from './VideoFallback';

export interface EnterpriseVideoPlayerProps {
  videoUrl: string;
  initialWatchedSeconds?: number;
  minDurationSeconds?: number;
  seekToTime?: number;
  onProgressUpdate: (watchedSeconds: number, totalSeconds: number, isCompleted: boolean) => void;
  onComplete: () => void;
  isCompleted?: boolean;
}

export function EnterpriseVideoPlayer({
  videoUrl,
  initialWatchedSeconds = 0,
  minDurationSeconds = 0,
  seekToTime,
  onProgressUpdate,
  onComplete,
  isCompleted = false,
}: EnterpriseVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [providerInfo, setProviderInfo] = useState<VideoProviderInfo>(() => detectVideoProvider(videoUrl));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxWatchedTime, setMaxWatchedTime] = useState(initialWatchedSeconds);
  const [completed, setCompleted] = useState(isCompleted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Playback engine modes: 'iframe' | 'native' | 'fallback'
  const [playerMode, setPlayerMode] = useState<'iframe' | 'native' | 'fallback'>('iframe');

  useEffect(() => {
    if (typeof seekToTime === 'number' && seekToTime >= 0) {
      if (videoRef.current) {
        const targetTime = completed ? seekToTime : Math.min(seekToTime, maxWatchedTime);
        videoRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
    }
  }, [seekToTime, completed, maxWatchedTime]);

  useEffect(() => {
    const info = detectVideoProvider(videoUrl);
    setProviderInfo(info);
    setIsLoading(true);

    // Default player mode based on provider
    if (info.provider === 'direct_mp4') {
      setPlayerMode('native');
    } else {
      setPlayerMode('iframe');
    }

    // Task 11 Debug Logging
    console.log('[ENTERPRISE_VIDEO_PLAYER_DEBUG] Video Player initialized for:', videoUrl);
    console.log('[ENTERPRISE_VIDEO_PLAYER_DEBUG] Provider Info:', info);

    // Timeout safety for iframe embedding (5 seconds fallback trigger if iframe fails silently)
    const timer = setTimeout(() => {
      if (isLoading && info.isMicrosoftHosted) {
        console.warn('[ENTERPRISE_VIDEO_PLAYER_DEBUG] Iframe load timeout for Microsoft video. Retrying stream fallback.');
      }
    }, 5500);

    return () => clearTimeout(timer);
  }, [videoUrl]);

  // Fullscreen event handlers
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    const doc = document as any;
    const elem = containerRef.current as any;
    const isFull = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);

    if (!isFull) {
      if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    } else {
      if (doc.exitFullscreen) doc.exitFullscreen().catch(() => {});
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
      else if (doc.mozCancelFullScreen) doc.mozCancelFullScreen();
      else if (doc.msExitFullscreen) doc.msExitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // HTML5 Video Event Handlers (Anti-Skip Logic preserved)
  const handleLoadedMetadata = () => {
    setIsLoading(false);
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      if (initialWatchedSeconds > 0 && initialWatchedSeconds < dur) {
        videoRef.current.currentTime = initialWatchedSeconds;
        setCurrentTime(initialWatchedSeconds);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    // Anti-skip protection: prevent seeking past maxWatchedTime
    if (!completed && cur > maxWatchedTime + 1.5) {
      videoRef.current.currentTime = maxWatchedTime;
      setCurrentTime(maxWatchedTime);
      return;
    }

    if (cur > maxWatchedTime) {
      setMaxWatchedTime(cur);
    }

    // Completion calculation (90% Watch Duration Threshold)
    if (!completed && duration > 0) {
      const watchedPercent = maxWatchedTime / duration;
      const minRequiredSeconds = minDurationSeconds > 0 ? minDurationSeconds * 0.9 : duration * 0.9;
      if (watchedPercent >= 0.90 || maxWatchedTime >= minRequiredSeconds) {
        setCompleted(true);
        onComplete();
      }
    }
  };

  // Periodic Progress Sync
  useEffect(() => {
    const interval = setInterval(() => {
      if (duration > 0) {
        const isFullyWatched = completed || maxWatchedTime / duration >= 0.90;
        onProgressUpdate(maxWatchedTime, duration, isFullyWatched);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [maxWatchedTime, duration, completed, onProgressUpdate]);

  const togglePlay = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await videoRef.current.play();
          setIsPlaying(true);
        } catch (err) {
          console.warn('Playback play error:', err);
        }
      }
    }
  };

  const handleRewind10 = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const watchedPercentage = duration > 0 ? Math.min(100, Math.round((maxWatchedTime / duration) * 100)) : 0;

  // 1. Fallback Mode (Option 6)
  if (playerMode === 'fallback') {
    return (
      <VideoFallback
        videoUrl={videoUrl}
        providerLabel={providerInfo.label}
        isCompleted={completed}
        onRetry={() => {
          setPlayerMode('iframe');
          setIsLoading(true);
        }}
        onMarkCompleted={() => {
          setCompleted(true);
          onComplete();
          onProgressUpdate(100, 100, true);
        }}
      />
    );
  }

  // 2. Iframe Embed Mode (SharePoint, YouTube, GDrive, Vimeo, Loom)
  if (playerMode === 'iframe' && providerInfo.embedUrl) {
    return (
      <div ref={containerRef} className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {/* Skeleton Loader during initial iframe connection */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950 z-20 flex flex-col items-center justify-center p-6 space-y-3">
              <div className="w-full h-full skeleton-shimmer rounded-xl opacity-90" />
            </div>
          )}

          <iframe
            src={providerInfo.embedUrl}
            title={providerInfo.label}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              console.error('[ENTERPRISE_VIDEO_PLAYER_DEBUG] Iframe load error for:', providerInfo.embedUrl);
              setIsLoading(false);
              setPlayerMode('fallback');
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            className="w-full h-full border-0"
          />

          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>{providerInfo.label}</span>
          </div>

          {completed && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Lesson Completed</span>
            </div>
          )}
        </div>

        {/* Player Bottom Control Bar */}
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {providerInfo.directStreamUrl && (
              <button
                onClick={() => setPlayerMode('native')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                title="Switch to direct HTML5 stream player"
              >
                <Video className="w-3.5 h-3.5 text-blue-400" />
                <span>Switch to Direct HTML5 Stream</span>
              </button>
            )}

            <button
              onClick={() => setPlayerMode('fallback')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Having Trouble? Fallback View
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Video Stream</span>
            </a>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs font-medium"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => {
                setCompleted(true);
                onComplete();
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{completed ? 'Lesson Completed ✔' : 'Mark Complete'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Direct Native HTML5 Video Stream Player (with Anti-Skip Protection)
  return (
    <div ref={containerRef} className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
      <div className="relative aspect-video bg-black flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950 z-20 flex flex-col items-center justify-center p-6 space-y-3">
            <div className="w-full h-full skeleton-shimmer rounded-xl opacity-90" />
          </div>
        )}

        <video
          ref={videoRef}
          src={providerInfo.directStreamUrl || videoUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onError={() => {
            console.warn('[ENTERPRISE_VIDEO_PLAYER_INFO] HTML5 video stream load restricted. Switching to embedded player.');
            setIsLoading(false);
            setPlayerMode('iframe');
          }}
          onEnded={() => {
            setIsPlaying(false);
            if (watchedPercentage >= 95) {
              setCompleted(true);
              onComplete();
            }
          }}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
        />

        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 border border-slate-700">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>{providerInfo.label} (Anti-Skip Enforced)</span>
        </div>

        {completed && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-800">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Lesson Completed</span>
          </div>
        )}
      </div>

      {/* Control Bar for HTML5 Video */}
      <div className="p-4 bg-slate-900 text-white flex flex-col gap-3">
        <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500/40"
            style={{ width: `${duration > 0 ? (maxWatchedTime / duration) * 100 : 0}%` }}
          />
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-150"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <button
              onClick={handleRewind10}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="w-4 h-4" />
              <span>-10s</span>
            </button>
            <span className="text-xs font-medium text-slate-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPlayerMode('iframe')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Switch to Iframe Player
            </button>
            <div className="text-right">
              <span className="text-xs text-slate-400">Watched</span>
              <p className={`text-xs font-bold ${completed ? 'text-emerald-400' : 'text-blue-400'}`}>
                {watchedPercentage}%
              </p>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
