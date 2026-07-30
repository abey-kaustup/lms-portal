'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ShieldCheck, AlertCircle, CheckCircle, Maximize, Minimize } from 'lucide-react';

interface AntiSkipVideoPlayerProps {
  videoUrl: string;
  initialWatchedSeconds?: number;
  minDurationSeconds?: number;
  onProgressUpdate: (watchedSeconds: number, totalSeconds: number, isCompleted: boolean) => void;
  onComplete: () => void;
  isCompleted?: boolean;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`;
  }
  return null;
}

export function AntiSkipVideoPlayer({
  videoUrl,
  initialWatchedSeconds = 0,
  minDurationSeconds = 0,
  onProgressUpdate,
  onComplete,
  isCompleted = false,
}: AntiSkipVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxWatchedTime, setMaxWatchedTime] = useState(initialWatchedSeconds);
  const [completed, setCompleted] = useState(isCompleted);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Resume from last watched timestamp on metadata load
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      if (initialWatchedSeconds > 0 && initialWatchedSeconds < dur) {
        videoRef.current.currentTime = initialWatchedSeconds;
        setCurrentTime(initialWatchedSeconds);
      }
    }
  };

  // Time update & Anti-skip enforcement
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    // Anti-skip check: If user seeks forward beyond max watched time + 1.5s buffer
    if (!completed && cur > maxWatchedTime + 1.5) {
      // Force rewind back to max watched position!
      videoRef.current.currentTime = maxWatchedTime;
      setCurrentTime(maxWatchedTime);
      return;
    }

    // Update max watched time if progressing normally
    if (cur > maxWatchedTime) {
      setMaxWatchedTime(cur);
    }

    // Check completion (95% watched or duration met)
    if (!completed && duration > 0) {
      const watchedPercent = maxWatchedTime / duration;
      if (watchedPercent >= 0.95 || (minDurationSeconds > 0 && maxWatchedTime >= minDurationSeconds)) {
        setCompleted(true);
        onComplete();
      }
    }
  };

  // Heartbeat every 10s to report progress to server
  useEffect(() => {
    if (youtubeEmbedUrl) return; // Skip HTML5 video heartbeat if YouTube iframe
    const interval = setInterval(() => {
      if (duration > 0) {
        const isFullyWatched = completed || maxWatchedTime / duration >= 0.95;
        onProgressUpdate(maxWatchedTime, duration, isFullyWatched);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [maxWatchedTime, duration, completed, onProgressUpdate, youtubeEmbedUrl]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
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

  // Render YouTube Iframe Player if YouTube URL
  if (youtubeEmbedUrl) {
    return (
      <div ref={containerRef} className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <iframe
            src={youtubeEmbedUrl}
            title="Lesson YouTube Video Player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />

          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Interactive Video Lesson</span>
          </div>

          {completed && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Lesson Completed</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Watch the video and click completed when you finish.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </button>
            <button
              onClick={() => {
                setCompleted(true);
                onComplete();
                onProgressUpdate(100, 100, true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{completed ? 'Lesson Completed' : 'Mark as Completed'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Native HTML5 Video Player
  return (
    <div ref={containerRef} className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
      {/* SharePoint / Video Player Container */}
      <div className="relative aspect-video bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          src={videoUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
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

        {/* Anti-skip indicator overlay badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 border border-slate-700">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Anti-Skip Protected</span>
        </div>

        {/* Completion badge */}
        {completed && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-800">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Lesson Completed</span>
          </div>
        )}
      </div>

      {/* Control Bar & Progress */}
      <div className="p-4 bg-slate-900 text-white flex flex-col gap-3">
        {/* Custom Progress Bar showing max watched range */}
        <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          {/* Max watched range */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-500/40"
            style={{ width: `${duration > 0 ? (maxWatchedTime / duration) * 100 : 0}%` }}
          />
          {/* Current position */}
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
            <div className="text-right">
              <span className="text-xs text-slate-400">Watched</span>
              <p className={`text-xs font-bold ${completed ? 'text-emerald-400' : 'text-blue-400'}`}>
                {watchedPercentage}%
              </p>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {!completed && (
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            Fast-forwarding is restricted. Please watch at least 95% of the video to complete this lesson.
          </p>
        )}
      </div>
    </div>
  );
}
