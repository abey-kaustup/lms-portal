'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Presentation, Loader2, ExternalLink } from 'lucide-react';
import { getEmbedUrl } from '@/lib/document-utils';
import { DocumentFallback } from './DocumentFallback';

interface PowerPointViewerProps {
  fileUrl: string;
  title: string;
  isCompleted?: boolean;
}

export function PowerPointViewer({ fileUrl, title }: PowerPointViewerProps) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [userFallback, setUserFallback] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const embedUrl = getEmbedUrl(fileUrl, 'ppt');

  useEffect(() => {
    // Debug logging for Tasks 1, 2, 3, 6, 9
    console.log('====================================================');
    console.log('[PPTX_VIEWER_DEBUG] 1. Original SharePoint URL:', fileUrl);
    try {
      const raw = fileUrl.includes('%3A') ? decodeURIComponent(fileUrl) : fileUrl;
      const enc = encodeURIComponent(raw);
      console.log('[PPTX_VIEWER_DEBUG] 2. Encoded URL (encodeURIComponent x1):', enc);
      console.log('[PPTX_VIEWER_DEBUG] 3. Office Viewer URL:', `https://view.officeapps.live.com/op/embed.aspx?src=${enc}`);
    } catch (e) {
      console.error('[PPTX_VIEWER_DEBUG] Encoding error:', e);
    }
    console.log('[PPTX_VIEWER_DEBUG] 4. Final Iframe Src Rendered:', embedUrl);
    console.log('====================================================');

    setLoading(true);
    setHasError(false);
    setUserFallback(false);

    const timer = setTimeout(() => {
      if (loading) {
        console.warn('PowerPoint iframe embed load timeout. Switching to fallback option.');
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [fileUrl, embedUrl]);

  const handleIframeLoad = () => {
    console.log('[PPTX_VIEWER_DEBUG] Iframe loaded successfully:', embedUrl);
    setLoading(false);
  };

  const handleIframeError = () => {
    console.error('[PPTX_VIEWER_DEBUG] Iframe load error detected for:', embedUrl);
    setLoading(false);
    setHasError(true);
  };

  if (hasError || userFallback) {
    return (
      <DocumentFallback
        fileUrl={fileUrl}
        title={title}
        category="ppt"
        categoryLabel="PowerPoint Presentation (PPTX)"
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
      {/* Loading Skeleton & Progress Indicator */}
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

      {/* Main PowerPoint Embedded Iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        className="w-full h-full border-none bg-slate-900"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />

      {/* Bottom Control Bar / Fallback Switcher */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-slate-400 text-xs flex items-center justify-between z-20">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
          <Presentation className="w-3.5 h-3.5 text-orange-400" />
          <span>PowerPoint Viewer Active</span>
        </span>

        <button
          onClick={() => setUserFallback(true)}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <span>Having trouble loading slides? Switch to Direct View</span>
          <ExternalLink className="w-3 h-3 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
