'use client';

import React, { useState, useRef } from 'react';
import { detectFileMetadata, FileCategory } from '@/lib/document-utils';
import { DocumentToolbar } from './DocumentToolbar';
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
      className={`w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none h-screen w-screen flex flex-col' : ''
      }`}
    >
      {/* Header Toolbar */}
      <DocumentToolbar
        title={title}
        fileUrl={fileUrl}
        category={meta.category}
        categoryLabel={meta.label}
        isCompleted={completed}
        isFullscreen={isFullscreen}
        onMarkCompleted={handleMarkCompleted}
        onToggleFullscreen={handleToggleFullscreen}
        onRetryPreview={handleRetryPreview}
        showRetry={meta.category !== 'image'}
      />

      {/* Main Content Viewer Area */}
      <div className={`w-full flex-1 relative ${isFullscreen ? 'h-full overflow-hidden' : ''}`}>
        {renderSubViewer()}
      </div>
    </div>
  );
}
