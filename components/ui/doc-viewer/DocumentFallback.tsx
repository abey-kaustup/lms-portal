'use client';

import React from 'react';
import {
  Presentation,
  FileText,
  FileSpreadsheet,
  ExternalLink,
  Download,
  ShieldAlert,
  RefreshCw,
  FileCode,
  Lock,
} from 'lucide-react';
import { FileCategory, extractFilename } from '@/lib/document-utils';

interface DocumentFallbackProps {
  fileUrl: string;
  title: string;
  category: FileCategory;
  categoryLabel: string;
  onRetry?: () => void;
}

export function DocumentFallback({
  fileUrl,
  title,
  category,
  categoryLabel,
  onRetry,
}: DocumentFallbackProps) {
  const filename = extractFilename(fileUrl, title);

  const getTheme = () => {
    switch (category) {
      case 'ppt':
        return {
          icon: <Presentation className="w-16 h-16 text-orange-500" />,
          badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
          btnBg: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-100',
          borderHover: 'hover:border-orange-300',
          typeText: 'PowerPoint Presentation',
        };
      case 'excel':
        return {
          icon: <FileSpreadsheet className="w-16 h-16 text-emerald-500" />,
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100',
          borderHover: 'hover:border-emerald-300',
          typeText: 'Excel Workbook',
        };
      case 'word':
        return {
          icon: <FileText className="w-16 h-16 text-blue-500" />,
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          btnBg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100',
          borderHover: 'hover:border-blue-300',
          typeText: 'Word Document',
        };
      case 'pdf':
        return {
          icon: <FileText className="w-16 h-16 text-rose-500" />,
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100',
          borderHover: 'hover:border-rose-300',
          typeText: 'PDF Document',
        };
      default:
        return {
          icon: <FileCode className="w-16 h-16 text-slate-500" />,
          badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
          btnBg: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-100',
          borderHover: 'hover:border-slate-300',
          typeText: 'Corporate Document',
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="w-full min-h-[480px] bg-slate-900/5 flex items-center justify-center p-6 border-t border-slate-200">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl text-center space-y-6">
        {/* Document Branded Icon Container */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-28 h-28 rounded-3xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shadow-inner">
            {theme.icon}
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 bg-amber-500 text-white rounded-full shadow-md border-2 border-white">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* Info & Title */}
        <div className="space-y-2">
          <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border ${theme.badgeBg}`}>
            {categoryLabel}
          </span>
          <h3 className="text-lg font-extrabold text-slate-900 line-clamp-2 px-4">
            {title}
          </h3>
          <p className="text-xs text-slate-500 font-medium truncate max-w-sm mx-auto">
            {filename}
          </p>
        </div>

        {/* Security & Preview Note */}
        <div className="p-4 bg-amber-50/80 border border-amber-200/70 rounded-2xl text-left flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <p className="font-bold">Embedded Preview Protected by SharePoint Security</p>
            <p className="text-amber-800/90 mt-0.5">
              SharePoint security policies restrict direct iframe embedding for this file. You can safely open or download the file directly using your corporate credentials.
            </p>
          </div>
        </div>

        {/* Large Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 pt-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all ${theme.btnBg}`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open {theme.typeText}</span>
          </a>

          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download</span>
          </a>
        </div>

        {/* Secondary Retry Option */}
        {onRetry && (
          <div className="pt-2">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try embedded preview again</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
