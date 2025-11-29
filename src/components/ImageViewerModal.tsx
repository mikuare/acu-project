import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize2, Minimize2, X } from 'lucide-react';
import { useState } from 'react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex: number;
}

const ImageViewerModal = ({ isOpen, onClose, images, initialIndex }: ImageViewerModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [fitToScreen, setFitToScreen] = useState(true);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1);
    setFitToScreen(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1);
    setFitToScreen(true);
  };

  const handleZoomIn = () => {
    setFitToScreen(false);
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setFitToScreen(false);
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleFitToScreen = () => {
    setFitToScreen(true);
    setZoom(1);
  };

  const handleActualSize = () => {
    setFitToScreen(false);
    setZoom(1);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(images[currentIndex]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `project-image-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 m-0 border-0">
        <div className="relative bg-black w-full h-full flex items-center justify-center overflow-auto">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black/90 text-white rounded-full"
            onClick={onClose}
            title="Close"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 z-20 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Control Buttons */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2 bg-black/80 rounded-lg p-2 shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5 || fitToScreen}
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-white text-sm min-w-[60px] text-center font-medium">
              {fitToScreen ? 'Fit' : `${Math.round(zoom * 100)}%`}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-white/30 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 text-xs px-2"
              onClick={handleActualSize}
              title="View Actual Size (100%)"
            >
              <Maximize2 className="w-3 h-3 mr-1" />
              Actual
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 text-xs px-2"
              onClick={handleFitToScreen}
              title="Fit to Screen"
            >
              <Minimize2 className="w-3 h-3 mr-1" />
              Fit
            </Button>
            <div className="w-px h-6 bg-white/30 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleDownload}
              title="Download Image"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white"
                onClick={handleNext}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Image */}
          <div className="w-full h-full flex items-center justify-center p-16">
            <img
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className={`transition-all duration-200 ${fitToScreen ? 'object-contain max-w-full max-h-full' : 'object-none'
                }`}
              style={fitToScreen ? {} : {
                transform: `scale(${zoom})`,
                cursor: zoom > 1 ? 'move' : 'default'
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewerModal;

