'use client';

import React, { useState } from 'react';
import { FileText, CheckCircle2, Download, ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  isCompleted?: boolean;
  onMarkCompleted: () => void;
}

export function PDFViewer({ pdfUrl, title, isCompleted = false, onMarkCompleted }: PDFViewerProps) {
  const [completed, setCompleted] = useState(isCompleted);

  const handleComplete = () => {
    setCompleted(true);
    onMarkCompleted();
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            <p className="text-xs text-slate-500">SharePoint PDF Document</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in SharePoint</span>
          </a>

          {!completed ? (
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark PDF as Read & Complete</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* PDF Iframe Embed */}
      <div className="w-full h-[650px] bg-slate-100">
        <iframe
          src={`${pdfUrl}#toolbar=0`}
          className="w-full h-full border-none"
          title={title}
        />
      </div>
    </div>
  );
}
