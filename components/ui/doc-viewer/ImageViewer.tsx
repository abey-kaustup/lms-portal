'use client';

import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Minimize,
  Download,
  Image as ImageIcon,
  Maximize2,
} from 'lucide-react';

interface ImageViewerProps {
  fileUrl: string;
  title: string;
}

export function ImageViewer({ fileUrl, title }: ImageViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [fitMode, setFitMode] = useState<'contain' | 'width' | 'height'>('contain');

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 25));
  };

  const handleResetZoom = () => {
    setZoom(100);
    setFitMode('contain');
  };

  const getImageStyle = () => {
    switch (fitMode) {
      case 'width':
        return 'w-full h-auto object-cover';
      case 'height':
        return 'h-full w-auto object-contain';
      case 'contain':
      default:
        return 'max-w-full max-h-[600px] object-contain';
    }
  };

  return (
    <div className="w-full bg-slate-950 flex flex-col items-center justify-between relative overflow-hidden min-h-[500px]">
      {/* Interactive Controls Bar */}
      <div className="w-full px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 text-white z-10 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-medium">
          <ImageIcon className="w-4 h-4 text-indigo-400" />
          <span>Interactive Image Controls</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 25}
              title="Zoom Out (-25%)"
              className="p-1 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-bold w-12 text-center text-slate-200">
              {zoom}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 300}
              title="Zoom In (+25%)"
              className="p-1 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetZoom}
              title="Reset Zoom (100%)"
              className="p-1 text-slate-400 hover:text-white ml-1 transition-colors border-l border-slate-700 pl-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fit Mode Toggles */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => {
                setFitMode('contain');
                setZoom(100);
              }}
              className={`px-2 py-1 text-xs font-medium rounded ${
                fitMode === 'contain' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Contain
            </button>
            <button
              onClick={() => {
                setFitMode('width');
                setZoom(100);
              }}
              className={`px-2 py-1 text-xs font-medium rounded ${
                fitMode === 'width' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Fit Width
            </button>
            <button
              onClick={() => {
                setFitMode('height');
                setZoom(100);
              }}
              className={`px-2 py-1 text-xs font-medium rounded ${
                fitMode === 'height' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Fit Height
            </button>
          </div>
        </div>
      </div>

      {/* Image Container Area */}
      <div className="w-full flex-1 min-h-[480px] max-h-[700px] flex items-center justify-center p-6 overflow-auto bg-slate-950">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
          className="transition-transform duration-200 ease-out flex items-center justify-center"
        >
          <img
            src={fileUrl}
            alt={title}
            className={`rounded-lg shadow-2xl border border-slate-800 ${getImageStyle()}`}
          />
        </div>
      </div>
    </div>
  );
}
