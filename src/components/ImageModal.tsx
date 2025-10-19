'use client';

import { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  productName?: string;
}

export default function ImageModal({ 
  isOpen, 
  onClose, 
  imageSrc, 
  imageAlt, 
  productName 
}: ImageModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleRotate();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `${productName || 'product-image'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-250 flex items-center justify-center" style={{zIndex: '10002'}}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#00000033] bg-opacity-90"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 max-w-[95vw] max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white rounded-t-lg">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {productName || 'Product Image'}
            </h3>
            <p className="text-sm text-gray-500">
              Zoom: {Math.round(zoom * 100)}% | Rotation: {rotation}°
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleRotate}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="Rotate (R)"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="Download Image"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={resetView}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="Reset View"
            >
              Reset
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Image Container */}
        <div 
          className="relative bg-gray-100 rounded-b-lg overflow-hidden flex items-center justify-center"
          style={{ 
            width: '80vw', 
            height: '70vh',
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            className="max-w-none transition-transform duration-200 select-none"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transformOrigin: 'center center'
            }}
            draggable={false}
          />
        </div>
        
        {/* Footer with keyboard shortcuts */}
        <div className="px-4 py-2 bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            Keyboard shortcuts: <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> Close | 
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs mx-1">+/-</kbd> Zoom | 
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">R</kbd> Rotate
          </p>
        </div>
      </div>
    </div>
  );
}
