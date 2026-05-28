// components/PaperSizeTutorialModal.js
"use client";
import { useState, useEffect } from "react";

const PaperSizeTutorialModal = ({
  isOpen,
  onClose,
  onConfirm,
  paperSize,
  printerName,
}) => {
  const [videoUrl, setVideoUrl] = useState(
    "https://www.youtube.com/watch?v=wNauXqjr5LE",
  );

  const getTutorialUrl = (size, printer) => {
    const tutorials = {
      A4: {
        default: "https://www.youtube.com/watch?v=wNauXqjr5LE",
        canon: "https://www.youtube.com/watch?v=wNauXqjr5LE",
        epson: "https://www.youtube.com/watch?v=wNauXqjr5LE",
      },
      F4: {
        default: "https://www.youtube.com/watch?v=wNauXqjr5LE",
        canon: "https://www.youtube.com/watch?v=wNauXqjr5LE",
        epson: "https://www.youtube.com/watch?v=wNauXqjr5LE",
      },
      Letter: {
        default: "https://www.youtube.com/watch?v=wNauXqjr5LE",
      },
      Legal: {
        default: "https://www.youtube.com/watch?v=wNauXqjr5LE",
      },
    };

    const tutorial = tutorials[size] || tutorials.A4;
    const printerLower = printer?.toLowerCase() || "";

    if (printerLower.includes("canon") && tutorial.canon) {
      return tutorial.canon;
    }
    if (printerLower.includes("epson") && tutorial.epson) {
      return tutorial.epson;
    }
    return tutorial.default;
  };

  useEffect(() => {
    if (isOpen && paperSize) {
      const url = getTutorialUrl(paperSize, printerName);
      setVideoUrl(url);
    }
  }, [isOpen, paperSize, printerName]);

  if (!isOpen) return null;

  // Extract YouTube video ID untuk embed dengan parameter yang tepat
  const getYouTubeEmbedUrl = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;

    if (videoId) {
      // ✅ Tambahkan parameter untuk kontrol dan tampilan yang lebih baik
      // 'fs=1' = enable fullscreen
      // 'modestbranding=1' = minimal YouTube branding
      // 'rel=0' = no related videos
      // 'controls=1' = show controls
      // 'playsinline=1' = play inline on mobile
      return `https://www.youtube.com/embed/${videoId}?fs=1&modestbranding=1&rel=0&controls=1&playsinline=1`;
    }
    return url;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="relative bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:w-full sm:max-w-3xl mx-auto">
          {/* Drag indicator */}
          <div className="sm:hidden flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="bg-white flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex-1 pr-2">
              <h3 className="text-base font-semibold text-gray-900">
                Tutorial Mengganti Kertas {paperSize}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Putar HP ke mode landscape untuk tampilan lebih luas
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors p-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Video Container - Dengan rasio yang lebih fleksibel */}
          <div className="bg-black flex justify-center items-center">
            <div className="relative w-full" style={{ maxWidth: "100%" }}>
              {/* Gunakan min-height untuk portrait video */}
              <div className="relative" style={{ minHeight: "400px" }}>
                <iframe
                  src={getYouTubeEmbedUrl(videoUrl)}
                  title={`Tutorial mengganti kertas ${paperSize}`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  frameBorder="0"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                ></iframe>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 rounded-b-2xl sm:rounded-b-xl border-t border-gray-200 p-4">
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="px-4 py-3 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Tutup
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                ✓ Saya sudah mengganti kertas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperSizeTutorialModal;
