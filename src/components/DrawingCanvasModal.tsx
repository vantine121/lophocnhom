'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  { label: 'Lớn', size: 24 },
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

  // Drawing tracking
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const snapshotBeforeShape = useRef<ImageData | null>(null);

  // Initialize Canvas with Image
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
      console.warn('Canvas image load error (likely CORS). Retrying with direct data URL');
      setLoadError(true);
    };
  }, [isOpen, imageUrl]);

  const setupCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions to match image natural resolution
    canvas.width = img.naturalWidth || 800;
    canvas.height = img.naturalHeight || 600;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Draw background image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Save initial clean state to history
    const initialSnap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialSnap]);
  };

  const saveHistoryStep = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev.slice(-15), snap]); // keep up to 15 undo steps
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextHistory = [...history];
    nextHistory.pop(); // Remove current
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

  // Convert client mouse/touch coordinates to canvas coordinates
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
      ctx.lineWidth = brushSize;

      if (activeTool === 'eraser') {
        // Redraw underlying image section or white/transparent
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = brushSize * 2;
      } else if (activeTool === 'highlighter') {
        ctx.strokeStyle = `${selectedColor}66`; // 40% alpha
        ctx.lineWidth = brushSize * 2.5;
      } else {
        ctx.strokeStyle = selectedColor;
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
      const dataUrl = canvas.toDataURL('image/png', 0.95);
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
    link.download = `bai-tap-chu-thich-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md text-white">
      {/* Top Bar: Title & Primary Actions */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              Chấm điểm & Chú thích trực tiếp lên bài
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                Canvas Mode
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Bài của: <span className="font-semibold text-slate-200">{authorName || 'Học sinh'}</span> 
              {postTitle ? ` • "${postTitle}"` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="Hoàn tác (Undo)"
          >
            <Undo className="w-4 h-4" />
            <span className="hidden sm:inline">Hoàn tác</span>
          </button>

          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition"
            title="Xóa mọi nét vẽ"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Xóa nét</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            title="Tải ảnh đã chú thích về máy"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Tải về</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Đang lưu...' : 'Lưu vào bài đăng'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toolbar: Color picker, Brush size, Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs">
        {/* Tools */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTool('pen')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
              activeTool === 'pen' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Bút viết</span>
          </button>

          <button
            onClick={() => setActiveTool('highlighter')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
              activeTool === 'highlighter' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Dạ quang</span>
          </button>

          <button
            onClick={() => setActiveTool('circle')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
              activeTool === 'circle' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Circle className="w-4 h-4" />
            <span>Khoanh tròn</span>
          </button>

          <button
            onClick={() => setActiveTool('rect')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
              activeTool === 'rect' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Square className="w-4 h-4" />
            <span>Khung vuông</span>
          </button>

          <button
            onClick={() => setActiveTool('eraser')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
              activeTool === 'eraser' ? 'bg-rose-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Tẩy</span>
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1">Màu:</span>
          {COLOR_PALETTE.map((c) => (
            <button
              key={c.hex}
              onClick={() => {
                setSelectedColor(c.hex);
                if (activeTool === 'eraser') setActiveTool('pen');
              }}
              className={`w-6 h-6 rounded-full border-2 transition transform hover:scale-110 ${
                selectedColor === c.hex ? 'border-white scale-110 shadow-md ring-2 ring-indigo-500' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => {
              setSelectedColor(e.target.value);
              if (activeTool === 'eraser') setActiveTool('pen');
            }}
            className="w-7 h-7 rounded-full bg-transparent cursor-pointer ml-1"
            title="Chọn màu khác"
          />
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl">
          <span className="text-slate-400 font-medium px-2">Cỡ nét:</span>
          {BRUSH_SIZES.map((b) => (
            <button
              key={b.size}
              onClick={() => setBrushSize(b.size)}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                brushSize === b.size ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
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
        className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-950/60 select-none relative"
      >
        {loadError && (
          <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-slate-900 border border-rose-500/30 text-center max-w-md">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <h3 className="text-sm font-bold text-white">Không thể tải ảnh vào Canvas</h3>
            <p className="text-xs text-slate-400">
              Ảnh từ tên miền ngoài bị chặn quyền truy cập trực tiếp do chính sách CORS. Bạn có thể tải lại ảnh bằng cách kéo thả trực tiếp tệp ảnh từ máy tính!
            </p>
          </div>
        )}

        {!imgLoaded && !loadError && (
          <div className="flex items-center gap-3 text-slate-400 text-sm">
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

      {/* Footer Info */}
      <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>💡 Mẹo: Hỗ trợ dùng chuột hoặc bút cảm ứng trên iPad/máy tính bảng để chấm bài thuận tiện nhất.</span>
        <span>Nhấn "Lưu vào bài đăng" sau khi vẽ xong để mọi người cùng xem</span>
      </div>
    </div>
  );
}

