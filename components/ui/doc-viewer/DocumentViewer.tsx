'use client';

import React, { useState, useRef } from 'react';
import { detectFileMetadata, FileCategory } from '@/lib/document-utils';
import { DocumentHeader, DocumentBottomBar } from './DocumentToolbar';
import { PowerPointViewer } from './PowerPointViewer';
import { WordViewer } from './WordViewer';
import { ExcelViewer } from './ExcelViewer';
import { PDFViewerComponent } from './PDFViewerComponent';
import { ImageViewer } from './ImageViewer';
import { DocumentFallback } from './DocumentFallback';

export interface DocumentViewerProps {
  pdfUrl: string; // File URL (PDF, PPT, Word, Excel, Image, SharePoint, Google Docs, etc.)
  title: string;
  isCompleted?: boolean;
  onMarkCompleted: () => void;
}

export function DocumentViewer({
  pdfUrl,
  title,
  isCompleted = false,
  onMarkCompleted,
}: DocumentViewerProps) {
  const [completed, setCompleted] = useState(isCompleted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fileUrl = pdfUrl ? pdfUrl.trim() : '';
  const meta = detectFileMetadata(fileUrl);

  const handleMarkCompleted = () => {
    setCompleted(true);
    onMarkCompleted();
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
          setIsFullscreen(false);
        });
      }
      setIsFullscreen(false);
    }
  };

  const handleRetryPreview = () => {
    setRetryKey((prev) => prev + 1);
  };

  const renderSubViewer = () => {
    if (!fileUrl) {
      return (
        <DocumentFallback
          fileUrl="#"
          title={title}
          category="generic"
          categoryLabel="Document Unavailable"
        />
      );
    }

    switch (meta.category) {
      case 'ppt':
        return (
          <PowerPointViewer key={`ppt-${retryKey}`} fileUrl={fileUrl} title={title} />
        );
      case 'word':
        return (
          <WordViewer key={`word-${retryKey}`} fileUrl={fileUrl} title={title} />
        );
      case 'excel':
        return (
          <ExcelViewer key={`excel-${retryKey}`} fileUrl={fileUrl} title={title} />
        );
      case 'image':
        return <ImageViewer key={`img-${retryKey}`} fileUrl={fileUrl} title={title} />;
      case 'pdf':
        return (
          <PDFViewerComponent key={`pdf-${retryKey}`} fileUrl={fileUrl} title={title} />
        );
      case 'generic':
      default:
        return (
          <DocumentFallback
            key={`fallback-${retryKey}`}
            fileUrl={fileUrl}
            title={title}
            category={meta.category}
            categoryLabel={meta.label}
            onRetry={handleRetryPreview}
          />
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none h-screen w-screen flex flex-col' : ''
      }`}
    >
      {/* Top Header */}
      <DocumentHeader
        title={title}
        category={meta.category}
        categoryLabel={meta.label}
      />

      {/* Main Content Viewer Area */}
      <div className={`w-full flex-1 relative ${isFullscreen ? 'h-full overflow-hidden' : ''}`}>
        {renderSubViewer()}
      </div>

      {/* Bottom Control Bar with static Mark Completed button */}
      <DocumentBottomBar
        fileUrl={fileUrl}
        isCompleted={completed}
        isFullscreen={isFullscreen}
        onMarkCompleted={handleMarkCompleted}
        onToggleFullscreen={handleToggleFullscreen}
        onRetryPreview={handleRetryPreview}
        showRetry={meta.category !== 'image'}
      />
    </div>
  );
}
