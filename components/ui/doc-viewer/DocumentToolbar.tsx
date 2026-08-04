'use client';

import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  Download,
} from 'lucide-react';
import { FileCategory } from '@/lib/document-utils';

interface DocumentToolbarProps {
  title: string;
  fileUrl: string;
  category: FileCategory;
  categoryLabel: string;
  isCompleted?: boolean;
  isFullscreen?: boolean;
  onMarkCompleted: () => void;
  onToggleFullscreen?: () => void;
  onRetryPreview?: () => void;
  showRetry?: boolean;
}

export function DocumentToolbar({
  title,
  fileUrl,
  category,
  categoryLabel,
  isCompleted = false,
  isFullscreen = false,
  onMarkCompleted,
  onToggleFullscreen,
  onRetryPreview,
  showRetry = false,
}: DocumentToolbarProps) {
  const getCategoryTheme = () => {
    switch (category) {
      case 'ppt':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-600',
          badge: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: <Presentation className="w-5 h-5" />,
        };
      case 'excel':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-600',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <FileSpreadsheet className="w-5 h-5" />,
        };
      case 'word':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <FileText className="w-5 h-5" />,
        };
      case 'image':
        return {
          bg: 'bg-indigo-100',
          text: 'text-indigo-600',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: <ImageIcon className="w-5 h-5" />,
        };
      case 'pdf':
        return {
          bg: 'bg-rose-100',
          text: 'text-rose-600',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <FileText className="w-5 h-5" />,
        };
      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-600',
          badge: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: <FileText className="w-5 h-5" />,
        };
    }
  };

  const theme = getCategoryTheme();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200 gap-3">
      {/* Title & Badge */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2.5 ${theme.bg} ${theme.text} rounded-xl shrink-0 shadow-xs`}>
          {theme.icon}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900 truncate" title={title}>
            {title}
          </h4>
          <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md border mt-0.5 ${theme.badge}`}>
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
        {showRetry && onRetryPreview && (
          <button
            onClick={onRetryPreview}
            title="Retry loading preview"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reload Preview</span>
          </button>
        )}

        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
          title="Open in new tab or download file"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          <span>Open / Download</span>
        </a>

        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        )}

        {!isCompleted ? (
          <button
            onClick={onMarkCompleted}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Completed</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Completed</span>
          </div>
        )}
      </div>
    </div>
  );
}
