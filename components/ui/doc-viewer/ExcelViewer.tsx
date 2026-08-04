'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Loader2, ExternalLink } from 'lucide-react';
import { getEmbedUrl } from '@/lib/document-utils';
import { DocumentFallback } from './DocumentFallback';

interface ExcelViewerProps {
  fileUrl: string;
  title: string;
}

export function ExcelViewer({ fileUrl, title }: ExcelViewerProps) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [userFallback, setUserFallback] = useState(false);

  const embedUrl = getEmbedUrl(fileUrl, 'excel');

  useEffect(() => {
    setLoading(true);
    setHasError(false);
    setUserFallback(false);

    const timer = setTimeout(() => {
      if (loading) {
        console.warn('Excel viewer load timeout.');
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [fileUrl]);

  if (hasError || userFallback) {
    return (
      <DocumentFallback
        fileUrl={fileUrl}
        title={title}
        category="excel"
        categoryLabel="Excel Spreadsheet (XLSX)"
        onRetry={() => {
          setHasError(false);
          setUserFallback(false);
          setLoading(true);
        }}
      />
    );
  }

  return (
    <div className="w-full h-[650px] bg-slate-900 relative overflow-hidden flex flex-col">
      {loading && (
        <div className="absolute inset-0 bg-slate-900 z-10 flex flex-col items-center justify-center p-6 space-y-4">
          <div className="w-full max-w-lg space-y-3 p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl skeleton-shimmer shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="w-3/4 h-4 rounded skeleton-shimmer" />
                <div className="w-1/2 h-3 rounded skeleton-shimmer" />
              </div>
            </div>
            <div className="w-full h-40 rounded-xl skeleton-shimmer" />
          </div>
        </div>
      )}

      <iframe
        src={embedUrl}
        title={title}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setHasError(true);
        }}
        className="w-full h-full border-none bg-slate-900"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />

      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-slate-400 text-xs flex items-center justify-between z-20">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Excel Web Viewer Active</span>
        </span>

        <button
          onClick={() => setUserFallback(true)}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <span>Having trouble loading spreadsheet? Switch to Direct View</span>
          <ExternalLink className="w-3 h-3 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
