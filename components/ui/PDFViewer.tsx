'use client';

import React from 'react';
import { DocumentViewer, DocumentViewerProps } from './doc-viewer/DocumentViewer';
import { detectFileMetadata, FileCategory } from '@/lib/document-utils';

export type FileKind = 'pdf' | 'image' | 'word' | 'ppt' | 'excel' | 'gdocs' | 'generic';

/**
 * Backward compatible getFileKind helper for legacy calls.
 */
export function getFileKind(url: string): { kind: FileKind; label: string } {
  const meta = detectFileMetadata(url);
  let legacyKind: FileKind = 'generic';

  if (meta.isGoogleDoc) legacyKind = 'gdocs';
  else if (meta.category === 'ppt') legacyKind = 'ppt';
  else if (meta.category === 'word') legacyKind = 'word';
  else if (meta.category === 'excel') legacyKind = 'excel';
  else if (meta.category === 'image') legacyKind = 'image';
  else if (meta.category === 'pdf') legacyKind = 'pdf';

  return {
    kind: legacyKind,
    label: meta.label,
  };
}

/**
 * PDFViewer component re-exported for backward compatibility.
 * Delegates to the production-grade DocumentViewer architecture.
 */
export function PDFViewer(props: DocumentViewerProps) {
  return <DocumentViewer {...props} />;
}

export { DocumentViewer };
