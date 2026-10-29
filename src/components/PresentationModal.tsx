'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Edit3, Sparkles, 
  Trash2, Undo, RotateCw, Save, Download, 
  Maximize2, Minimize2, Check, RefreshCw
} from 'lucide-react';
import { PostItem } from '@/types/padlet';
import confetti from 'canvas-confetti';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: PostItem[];
  initialPostId?: string;
  onSaveAnnotation: (postId: string, annotatedImageUrl: string) => Promise<void>;
}

const COLOR_PALETTE = [
  { name: 'Đỏ chấm điểm', hex: '#ef4444' },
  { name: 'Xanh lá chuẩn', hex: '#22c55e' },
  { name: 'Xanh dương', hex: '#3b82f6' },
  { name: 'Vàng chú ý', hex: '#eab308' },
  { name: 'Tím ghi chú', hex: '#a855f7' },
  { name: 'Đen', hex: '#0f172a' },
  { name: 'Trắng', hex: '#ffffff' },
];

export default function PresentationModal({
  isOpen,
  onClose,
  posts,
  initialPostId,
  onSaveAnnotation,
}: PresentationModalProps) {
  // Filter only posts that have media (images)
  const mediaPosts = posts.filter((p) => p.media_url);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTool, setActiveTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [selectedColor, setSelectedColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(6);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270 degrees
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);

  // Set initial post index
  useEffect(() => {
    if (!isOpen) return;
    if (initialPostId) {
      const idx = mediaPosts.findIndex((p) => p.id === initialPostId);
      if (idx !== -1) setCurrentIndex(idx);
    } else {
      setCurrentIndex(0);
    }
  }, [isOpen, initialPostId, mediaPosts.length]);

  const currentPost = mediaPosts[currentIndex] || null;

  // Initialize canvas with post image and rotation
  useEffect(() => {
    if (!currentPost || !isOpen) return;

    setHasChanges(false);
    setHistory([]);
    setRotation(0);

    const targetUrl = currentPost.annotated_image_url || currentPost.media_url || '';
    if (!targetUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = targetUrl;

    img.onload = () => {
      baseImgRef.current = img;
      renderImageToCanvas(img, 0);
    };
  }, [currentIndex, isOpen, currentPost?.id]);

  const renderImageToCanvas = (img: HTMLImageElement, rot: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isSideways = rot === 90 || rot === 270;
    const nw = img.naturalWidth || 1200;
    const nh = img.naturalHeight || 900;

    canvas.width = isSideways ? nh : nw;
    canvas.height = isSideways ? nw : nh;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Handle rotation around center
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.drawImage(img, -nw / 2, -nh / 2, nw, nh);
    ctx.restore();

    // Initial snapshot
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([snap]);
  };

  const handleRotate = () => {
    if (!baseImgRef.current) return;
    const nextRot = (rotation + 90) % 360;
    setRotation(nextRot);
    renderImageToCanvas(baseImgRef.current, nextRot);
    setHasChanges(true);
  };

  const saveHistoryStep = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-12), snap]);
    setHasChanges(true);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextHistory = [...history];
    nextHistory.pop();
    const prev = nextHistory[nextHistory.length - 1];
    if (prev) {
      ctx.putImageData(prev, 0, 0);
      setHistory(nextHistory);
    }
  };

  const handleClear = () => {
    if (!baseImgRef.current) return;
    renderImageToCanvas(baseImgRef.current, rotation);
  };

  // Convert touch/pointer coordinates
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
    setIsDrawing(true);

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
  };

  const drawMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveHistoryStep();
  };

  const handleSave = async () => {
    if (!currentPost || !canvasRef.current) return;
    setIsSaving(true);
    try {
      // Export as optimized JPEG (under 300KB) for lightning-fast save!
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.86);
      await onSaveAnnotation(currentPost.id, dataUrl);
      setHasChanges(false);

      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.1 },
      });
    } catch (err) {
      console.error('Lỗi lưu bài chấm:', err);
      alert('Không thể lưu bài chấm. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < mediaPosts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, mediaPosts.length]);

  if (!isOpen || mediaPosts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 truncate">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30 shrink-0">
            {currentIndex + 1}
          </div>
          <div className="truncate">
            <h2 className="text-xs sm:text-sm font-bold flex items-center gap-2 truncate">
              <span className="truncate">{currentPost.author_name}</span>
              {currentPost.title && (
                <span className="text-slate-400 text-xs hidden sm:inline truncate">
                  • {currentPost.title}
                </span>
              )}
            </h2>
            <span className="text-[10px] text-slate-400">
              Bài {currentIndex + 1} / {mediaPosts.length}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Rotate 90deg button (Crucial for vertical student photos!) */}
          <button
            onClick={handleRotate}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Xoay ảnh 90 độ"
          >
            <RotateCw className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Xoay ảnh</span>
          </button>

          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Hoàn tác nét vẽ"
          >
            <Undo className="w-4 h-4" />
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition"
            title="Xóa mọi nét vẽ"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Save Annotation */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
            title="Lưu lại nét vẽ chấm bài này"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">Lưu bài chấm</span>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Workspace (Filmstrip Thumbnails + Center Stage) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Filmstrip Navigator (like Padlet in user's screenshot) */}
        <div className="w-16 sm:w-20 bg-slate-900/90 border-r border-slate-800 flex flex-col items-center py-3 gap-2 overflow-y-auto shrink-0 custom-scrollbar">
          {mediaPosts.map((post, idx) => (
            <button
              key={post.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl overflow-hidden border-2 transition relative flex flex-col items-center justify-center p-0.5 ${
                idx === currentIndex
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105 shadow-md bg-slate-800'
                  : 'border-slate-800 hover:border-slate-600 bg-slate-950/60 opacity-60 hover:opacity-100'
              }`}
              title={`Bài ${idx + 1}: ${post.author_name}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.annotated_image_url || post.media_url}
                alt={post.author_name}
                className="w-full h-full object-cover rounded-lg"
              />
              <span className="absolute bottom-0.5 right-1 text-[9px] font-bold bg-slate-950/90 px-1 rounded text-white shadow">
                {String(idx + 1).padStart(2, '0')}
              </span>
            </button>
          ))}
        </div>

        {/* Center Presentation Stage */}
        <div 
          ref={containerRef}
          className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-950/70 overflow-hidden relative touch-none"
        >
          {/* Previous Post Arrow */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 shadow-xl flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed transition transform active:scale-90"
            title="Bài trước đó (Mũi tên trái)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Post Arrow */}
          <button
            onClick={handleNext}
            disabled={currentIndex === mediaPosts.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 shadow-xl flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed transition transform active:scale-90"
            title="Bài tiếp theo (Mũi tên phải)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Canvas Projection Surface */}
          <canvas
            ref={canvasRef}
            onPointerDown={startDraw}
            onPointerMove={drawMove}
            onPointerUp={endDraw}
            onPointerLeave={endDraw}
            className="max-w-[92%] max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-slate-800 bg-white cursor-crosshair touch-none"
          />
        </div>
      </div>

      {/* Floating Bottom Toolbar (Clean, Touch-Friendly on Phones & Tablets) */}
      <div className="bg-slate-900/95 border-t border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 backdrop-blur-md">
        {/* Tools Selector */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTool('pen')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition ${
              activeTool === 'pen' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Bút viết</span>
          </button>

          <button
            onClick={() => setActiveTool('highlighter')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition ${
              activeTool === 'highlighter' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Dạ quang</span>
          </button>

          <button
            onClick={() => setActiveTool('eraser')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition ${
              activeTool === 'eraser' ? 'bg-rose-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Tẩy</span>
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c.hex}
              onClick={() => {
                setSelectedColor(c.hex);
                if (activeTool === 'eraser') setActiveTool('pen');
              }}
              className={`w-6 h-6 rounded-full border-2 transition transform hover:scale-110 shrink-0 ${
                selectedColor === c.hex
                  ? 'border-white scale-110 shadow ring-2 ring-indigo-500'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl">
          {[3, 6, 12, 20].map((sz, i) => (
            <button
              key={sz}
              onClick={() => setBrushSize(sz)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                brushSize === sz ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {['Mảnh', 'Vừa', 'Dày', 'Lớn'][i]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
