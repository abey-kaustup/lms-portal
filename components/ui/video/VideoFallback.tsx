'use client';

import React from 'react';
import {
  Video,
  Play,
  ExternalLink,
  ShieldAlert,
  RefreshCw,
  CheckCircle,
  Lock,
} from 'lucide-react';

interface VideoFallbackProps {
  videoUrl: string;
  title?: string;
  providerLabel: string;
  isCompleted?: boolean;
  onRetry?: () => void;
  onMarkCompleted?: () => void;
}

export function VideoFallback({
  videoUrl,
  title = 'SharePoint Video Lesson',
  providerLabel,
  isCompleted = false,
  onRetry,
  onMarkCompleted,
}: VideoFallbackProps) {
  return (
    <div className="w-full aspect-video bg-slate-950 rounded-2xl flex items-center justify-center p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 border border-slate-800 text-center space-y-5 shadow-2xl">
        {/* Branded Video Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
            <Video className="w-10 h-10 text-blue-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 bg-amber-500 text-white rounded-full shadow-md border-2 border-slate-900">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Info & Title */}
        <div className="space-y-1.5">
          <span className="inline-flex items-center px-3 py-1 text-[11px] font-bold rounded-full bg-blue-950 text-blue-300 border border-blue-800">
            {providerLabel}
          </span>
          <h3 className="text-base font-extrabold text-white line-clamp-2 px-2">
            {title}
          </h3>
        </div>

        {/* Security & Access Notice */}
        <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-2xl text-left flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <p className="font-bold text-amber-300">Inline Playback Restricted by SharePoint</p>
            <p className="text-amber-300/80 text-[11px] mt-0.5">
              SharePoint security policies require this video to be played directly via Microsoft Stream. Use your corporate credentials to view the stream.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2.5 pt-1">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open in Microsoft Stream</span>
          </a>

          {onMarkCompleted && (
            <button
              onClick={onMarkCompleted}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isCompleted
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
            </button>
          )}
        </div>

        {/* Retry Button */}
        {onRetry && (
          <div>
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry embedded player</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
