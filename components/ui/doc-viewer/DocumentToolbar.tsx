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

export function DocumentHeader({
  title,
  category,
  categoryLabel,
}: {
  title: string;
  category: FileCategory;
  categoryLabel: string;
}) {
  const getCategoryTheme = () => {
    switch (category) {
      case 'ppt':
        return {
          bg: 'bg-orange-100 dark:bg-orange-950/60',
          text: 'text-orange-600 dark:text-orange-400',
          badge: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
          icon: <Presentation className="w-5 h-5" />,
        };
      case 'excel':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-950/60',
          text: 'text-emerald-600 dark:text-emerald-400',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
          icon: <FileSpreadsheet className="w-5 h-5" />,
        };
      case 'word':
        return {
          bg: 'bg-blue-100 dark:bg-blue-950/60',
          text: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
          icon: <FileText className="w-5 h-5" />,
        };
      case 'image':
        return {
          bg: 'bg-indigo-100 dark:bg-indigo-950/60',
          text: 'text-indigo-600 dark:text-indigo-400',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
          icon: <ImageIcon className="w-5 h-5" />,
        };
      case 'pdf':
      default:
        return {
          bg: 'bg-rose-100 dark:bg-rose-950/60',
          text: 'text-rose-600 dark:text-rose-400',
          badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
          icon: <FileText className="w-5 h-5" />,
        };
    }
  };

  const theme = getCategoryTheme();

  return (
    <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2.5 ${theme.bg} ${theme.text} rounded-xl shrink-0 shadow-xs`}>
          {theme.icon}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate" title={title}>
            {title}
          </h4>
          <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md border mt-0.5 ${theme.badge}`}>
            {categoryLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export function DocumentBottomBar({
  fileUrl,
  isCompleted = false,
  isFullscreen = false,
  onMarkCompleted,
  onToggleFullscreen,
  onRetryPreview,
  showRetry = false,
}: Omit<DocumentToolbarProps, 'title' | 'category' | 'categoryLabel'>) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 bg-slate-900 text-white border-t border-slate-800 gap-3">
      <div className="flex items-center gap-2">
        {showRetry && onRetryPreview && (
          <button
            onClick={onRetryPreview}
            title="Retry loading preview"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Reload Preview</span>
          </button>
        )}

        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
          title="Open in new tab or download file"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open / Download</span>
        </a>
      </div>

      <div className="flex items-center gap-2">
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs font-medium"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        )}

        <button
          onClick={onMarkCompleted}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all shrink-0 active:scale-95 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isCompleted ? 'Completed ✔' : 'Mark Completed'}</span>
        </button>
      </div>
    </div>
  );
}

export function DocumentToolbar(props: DocumentToolbarProps) {
  return (
    <>
      <DocumentHeader title={props.title} category={props.category} categoryLabel={props.categoryLabel} />
    </>
  );
}
