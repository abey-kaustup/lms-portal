'use client';

import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  File,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string; // Document / File URL (PDF, PPT, Word, Excel, Image, SharePoint, Google Docs, etc.)
  title: string;
  isCompleted?: boolean;
  onMarkCompleted: () => void;
}

export type FileKind = 'pdf' | 'image' | 'word' | 'ppt' | 'excel' | 'gdocs' | 'generic';

export function getFileKind(url: string): { kind: FileKind; label: string } {
  if (!url) return { kind: 'pdf', label: 'Document' };
  const cleanUrl = url.trim().toLowerCase();

  if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(cleanUrl)) {
    const ext = cleanUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)/i)?.[1]?.toUpperCase() || 'IMAGE';
    return { kind: 'image', label: `Image File (${ext})` };
  }

  if (/\.(ppt|pptx)(\?.*)?$/i.test(cleanUrl) || cleanUrl.includes('docs.google.com/presentation')) {
    return { kind: 'ppt', label: 'PowerPoint Presentation (PPTX)' };
  }

  if (/\.(doc|docx)(\?.*)?$/i.test(cleanUrl) || cleanUrl.includes('docs.google.com/document')) {
    return { kind: 'word', label: 'Word Document (DOCX)' };
  }

  if (/\.(xls|xlsx|csv)(\?.*)?$/i.test(cleanUrl) || cleanUrl.includes('docs.google.com/spreadsheets')) {
    return { kind: 'excel', label: 'Excel Spreadsheet (XLSX)' };
  }

  if (cleanUrl.includes('docs.google.com')) {
    if (cleanUrl.includes('/presentation')) return { kind: 'ppt', label: 'Google Slides Presentation' };
    if (cleanUrl.includes('/spreadsheets')) return { kind: 'excel', label: 'Google Sheets Spreadsheet' };
    return { kind: 'gdocs', label: 'Google Docs Document' };
  }

  if (cleanUrl.endsWith('.pdf') || cleanUrl.includes('.pdf?')) {
    return { kind: 'pdf', label: 'PDF Document' };
  }

  return { kind: 'generic', label: 'Corporate Learning Resource' };
}

export function PDFViewer({ pdfUrl, title, isCompleted = false, onMarkCompleted }: PDFViewerProps) {
  const [completed, setCompleted] = useState(isCompleted);

  const handleComplete = () => {
    setCompleted(true);
    onMarkCompleted();
  };

  const fileMeta = getFileKind(pdfUrl);

  const renderIcon = () => {
    switch (fileMeta.kind) {
      case 'image':
        return <ImageIcon className="w-5 h-5" />;
      case 'ppt':
        return <Presentation className="w-5 h-5" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5" />;
      case 'word':
      case 'gdocs':
      case 'pdf':
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // Determine iframe / view src based on file type
  const getEmbedSrc = (): string => {
    const clean = pdfUrl.trim();

    // 1. Google Docs/Slides/Sheets
    if (clean.includes('docs.google.com')) {
      if (clean.includes('/presentation')) {
        return clean.replace(/\/edit.*$/, '/embed').replace(/\/view.*$/, '/embed');
      }
      if (clean.includes('/document') || clean.includes('/spreadsheets')) {
        return clean.replace(/\/edit.*$/, '/preview').replace(/\/view.*$/, '/preview');
      }
    }

    // 2. Direct Office Files (.docx, .doc, .pptx, .ppt, .xlsx, .xls) -> Use Office Web Viewer
    if (/\.(doc|docx|ppt|pptx|xls|xlsx)(\?.*)?$/i.test(clean)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(clean)}`;
    }

    // 3. PDF Files
    if (clean.toLowerCase().includes('.pdf')) {
      return `${clean}#toolbar=0`;
    }

    return clean;
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0">
            {renderIcon()}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            <p className="text-xs text-slate-500 font-medium">{fileMeta.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open File / Download</span>
          </a>

          {!completed ? (
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Read & Complete</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area: Image vs Office/PDF/Cloud Viewer */}
      {fileMeta.kind === 'image' ? (
        <div className="w-full min-h-[450px] max-h-[700px] bg-slate-950 flex items-center justify-center p-4 overflow-auto">
          <img
            src={pdfUrl}
            alt={title}
            className="max-w-full max-h-[650px] object-contain rounded-lg shadow-xl border border-slate-800"
          />
        </div>
      ) : (
        <div className="w-full h-[650px] bg-slate-100 relative">
          <iframe
            src={getEmbedSrc()}
            className="w-full h-full border-none"
            title={title}
          />
        </div>
      )}
    </div>
  );
}

export const DocumentViewer = PDFViewer;
