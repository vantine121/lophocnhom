'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  X, Undo, Download, Save, Trash2, Edit3, 
  Circle, Square, Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';

interface DrawingCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  postTitle?: string;
  authorName?: string;
  onSaveAnnotation: (annotatedImageUrl: string) => Promise<void>;
}

const COLOR_PALETTE = [
  { name: 'Đỏ chấm điểm', hex: '#ef4444' },
  { name: 'Xanh lá chuẩn', hex: '#22c55e' },
  { name: 'Xanh dương', hex: '#3b82f6' },
  { name: 'Vàng chú ý', hex: '#eab308' },
  { name: 'Tím ghi chú', hex: '#a855f7' },
  { name: 'Cam', hex: '#f97316' },
  { name: 'Đen', hex: '#0f172a' },
  { name: 'Trắng', hex: '#ffffff' },
];

const BRUSH_SIZES = [
  { label: 'Mảnh', size: 3 },
  { label: 'Vừa', size: 6 },
  { label: 'Dày', size: 12 },
  { label: 'Lớn', size: 22 },
];

export default function DrawingCanvasModal({
  isOpen,
  onClose,
  imageUrl,
  postTitle,
  authorName,
  onSaveAnnotation,
}: DrawingCanvasModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const baseImageRef = useRef<HTMLImageElement | null>(null);

  const [activeTool, setActiveTool] = useState<'pen' | 'highlighter' | 'eraser' | 'circle' | 'rect'>('pen');
  const [selectedColor, setSelectedColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(6);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const snapshotBeforeShape = useRef<ImageData | null>(null);

  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    setImgLoaded(false);
    setLoadError(false);
    setHistory([]);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      baseImageRef.current = img;
      setImgLoaded(true);
      setupCanvas(img);
    };

    img.onerror = () => {
      setLoadError(true);
    };
  }, [isOpen, imageUrl]);

  const setupCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = img.naturalWidth || 1000;
    canvas.height = img.naturalHeight || 750;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const initialSnap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialSnap]);
  };

  const saveHistoryStep = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev.slice(-12), snap]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextHistory = [...history];
    nextHistory.pop();
    const previousState = nextHistory[nextHistory.length - 1];

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(nextHistory);
    }
  };

  const handleClearAll = () => {
    if (!baseImageRef.current) return;
    setupCanvas(baseImageRef.current);
  };

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    startPos.current = { x, y };
    setIsDrawing(true);

    if (activeTool === 'circle' || activeTool === 'rect') {
      snapshotBeforeShape.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (activeTool === 'eraser') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = brushSize * 2.5;
      } else if (activeTool === 'highlighter') {
        ctx.strokeStyle = `${selectedColor}66`;
        ctx.lineWidth = brushSize * 3;
      } else {
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = brushSize;
      }
    }
  };

  const drawMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    if (activeTool === 'pen' || activeTool === 'eraser' || activeTool === 'highlighter') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (activeTool === 'rect' && snapshotBeforeShape.current) {
      ctx.putImageData(snapshotBeforeShape.current, 0, 0);
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      const width = x - startPos.current.x;
      const height = y - startPos.current.y;
      ctx.strokeRect(startPos.current.x, startPos.current.y, width, height);
    } else if (activeTool === 'circle' && snapshotBeforeShape.current) {
      ctx.putImageData(snapshotBeforeShape.current, 0, 0);
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      const radiusX = Math.abs(x - startPos.current.x) / 2;
      const radiusY = Math.abs(y - startPos.current.y) / 2;
      const centerX = Math.min(x, startPos.current.x) + radiusX;
      const centerY = Math.min(y, startPos.current.y) + radiusY;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveHistoryStep();
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsSaving(true);
    try {
      // Export as optimized JPEG (250KB) instead of huge PNG (6MB) for instant upload!
      const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
      await onSaveAnnotation(dataUrl);
      onClose();
    } catch (err) {
      console.error('Lỗi lưu ảnh chú thích:', err);
      alert('Có lỗi khi lưu chú thích. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `bai-tap-chu-thich-${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.88);
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md text-white select-none">
      {/* Top Bar: Title & Primary Actions */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 truncate">
          <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 shrink-0">
            <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="truncate">
            <h2 className="text-xs sm:text-sm font-bold flex items-center gap-1.5 truncate">
              <span>Chấm & Vẽ chú thích</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 font-medium hidden sm:inline">
                Canvas
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              Bài của: <span className="font-semibold text-slate-200">{authorName || 'Học sinh'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Hoàn tác (Undo)"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearAll}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition"
            title="Xóa nét"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 transition hidden sm:flex items-center gap-1"
            title="Tải về máy"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/25 transition disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Lưu...' : 'Lưu bài'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toolbar: Responsive Scrollable for Mobile & Desktop */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs shrink-0 overflow-x-auto custom-scrollbar">
        {/* Tools */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTool('pen')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-bold transition ${
              activeTool === 'pen' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Bút</span>
          </button>

          <button
            onClick={() => setActiveTool('highlighter')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-bold transition ${
              activeTool === 'highlighter' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dạ quang</span>
          </button>

          <button
            onClick={() => setActiveTool('circle')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-bold transition ${
              activeTool === 'circle' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Circle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Khoanh</span>
          </button>

          <button
            onClick={() => setActiveTool('rect')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-bold transition ${
              activeTool === 'rect' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Khung</span>
          </button>

          <button
            onClick={() => setActiveTool('eraser')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-bold transition ${
              activeTool === 'eraser' ? 'bg-rose-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Tẩy</span>
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5 shrink-0">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c.hex}
              onClick={() => {
                setSelectedColor(c.hex);
                if (activeTool === 'eraser') setActiveTool('pen');
              }}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition transform hover:scale-110 ${
                selectedColor === c.hex ? 'border-white scale-110 shadow ring-2 ring-indigo-500' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl shrink-0">
          {BRUSH_SIZES.map((b) => (
            <button
              key={b.size}
              onClick={() => setBrushSize(b.size)}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition ${
                brushSize === b.size ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Workspace */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 select-none relative touch-none"
      >
        {loadError && (
          <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-slate-900 border border-rose-500/30 text-center max-w-md">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <h3 className="text-xs font-bold text-white">Không thể tải ảnh vào bảng vẽ</h3>
          </div>
        )}

        {!imgLoaded && !loadError && (
          <div className="flex items-center gap-3 text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
            <span>Đang chuẩn bị bảng vẽ...</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onPointerDown={startDraw}
          onPointerMove={drawMove}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
          className={`max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl border border-slate-700/80 bg-white cursor-crosshair touch-none ${
            !imgLoaded ? 'hidden' : 'block'
          }`}
        />
      </div>
    </div>
  );
}
