import React, { useState, useEffect, useRef } from 'react';
import { Camera, QrCode, Upload, AlertCircle, CheckCircle2, RefreshCw, Search, Loader2, ShieldCheck } from 'lucide-react';
import jsQR from 'jsqr';

export default function QrScannerComponent({ onAnalyze, isLoading }) {
  const [isMobile, setIsMobile] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  const [decodedText, setDecodedText] = useState('');
  const [isImageDecoding, setIsImageDecoding] = useState(false);
  const [imageError, setImageError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  // Check device capability (touch / mobile viewport / mobile UserAgent)
  useEffect(() => {
    const checkCapability = () => {
      const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
      const isMobileWidth = window.innerWidth <= 768;
      const isMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      setIsMobile(hasTouch || isMobileWidth || isMobileUA);
    };

    checkCapability();
    window.addEventListener('resize', checkCapability);
    return () => {
      window.removeEventListener('resize', checkCapability);
      stopCamera();
    };
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Start live rear camera preview (facingMode: environment)
  const startCamera = async () => {
    setCameraError('');
    setImageError('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionState('denied');
      setCameraError('Live camera scanning on mobile browsers requires an HTTPS connection or Localhost. Please upload a QR image below.');
      return;
    }

    try {
      const constraints = {
        video: { facingMode: { ideal: 'environment' } }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setPermissionState('granted');
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      stopCamera();
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setCameraError('Camera permission was denied. You can upload a QR image instead below.');
      } else {
        setPermissionState('denied');
        setCameraError('Unable to access camera device. Please upload a QR image instead below.');
      }
    }
  };


  // Live video frame QR scanner loop
  const scanFrame = () => {
    const video = videoRef.current;
    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvasRef.current = canvas;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data && code.data.trim()) {
        stopCamera();
        setDecodedText(code.data.trim());
        return;
      }
    }

    if (streamRef.current) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
    }
  };

  // Uploaded Image QR decoding
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopCamera();
    setIsImageDecoding(true);
    setImageError('');
    setDecodedText('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        setIsImageDecoding(false);
        if (code && code.data && code.data.trim()) {
          setDecodedText(code.data.trim());
        } else {
          setImageError("We couldn't detect a readable QR code in this image. Try another image.");
        }
      };
      img.onerror = () => {
        setIsImageDecoding(false);
        setImageError("Invalid or corrupted image file.");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleScanAgain = () => {
    setDecodedText('');
    setImageError('');
    if (isMobile) {
      startCamera();
    }
  };

  const handleSubmitAnalysis = () => {
    if (!decodedText.trim() || isLoading) return;
    onAnalyze(decodedText.trim(), 'url');
  };

  return (
    <div className="space-y-6">
      {/* 1. Mobile Camera Experience */}
      {isMobile ? (
        <div className="space-y-5">
          {/* Header */}
          <div className="text-center space-y-1">
            <h4 className="text-base font-bold text-[#0F172A]">Scan QR Code</h4>
            <p className="text-xs text-[#64748B]">
              Point your camera at a QR code. We'll analyze the destination before you open it.
            </p>
          </div>

          {/* Camera Scanner Viewport / Frame */}
          {!decodedText && (
            <div className="space-y-4">
              {permissionState === 'prompt' && !isScanning && (
                <div className="border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] rounded-2xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#2563EB] mx-auto shadow-2xs">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#0F172A]">Camera access required</p>
                    <p className="text-xs text-[#64748B]">Allow camera access to scan QR codes safely.</p>
                  </div>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all inline-flex items-center space-x-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Enable Camera</span>
                  </button>
                </div>
              )}

              {permissionState === 'denied' && (
                <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs font-medium text-[#DC2626] text-center space-y-1">
                  <AlertCircle className="w-5 h-5 mx-auto text-[#DC2626]" />
                  <p className="font-bold">Camera access unavailable</p>
                  <p className="text-[#991B1B]">{cameraError || "Camera access is unavailable. You can upload a QR image instead below."}</p>
                </div>
              )}


              {isScanning && (
                <div className="relative w-full max-w-sm mx-auto aspect-square bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Center Scanning Frame with Corner Guides */}
                  <div className="absolute inset-0 border-[40px] border-black/50 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-white/80 rounded-xl relative">
                      {/* Corner Accents */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#2563EB] rounded-tl" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#2563EB] rounded-tr" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#2563EB] rounded-bl" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#2563EB] rounded-br" />
                    </div>
                  </div>
                </div>
              )}

              {isScanning && (
                <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-[#2563EB]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                  <span>Scanning for QR code...</span>
                </div>
              )}

              {/* OR Separator */}
              <div className="flex items-center space-x-3 py-2">
                <div className="flex-1 h-px bg-[#E2E8F0]" />
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">OR</span>
                <div className="flex-1 h-px bg-[#E2E8F0]" />
              </div>
            </div>
          )}

          {/* Upload Section on Mobile */}
          {!decodedText && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Upload QR Image
              </label>

              <label className="border border-[#E2E8F0] hover:border-[#2563EB]/50 bg-[#F8FAFC] hover:bg-[#EFF6FF]/40 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#2563EB]">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">Upload a QR code</p>
                    <p className="text-[11px] text-[#64748B]">Choose an image from your gallery</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#2563EB] text-white">
                  Choose Image
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageUpload}
                  disabled={isImageDecoding}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      ) : (
        /* 2. Desktop Experience (No Camera, Drag & Drop Only) */
        <div className="space-y-4">
          {!decodedText && (
            <div className="space-y-2">
              <div className="text-center space-y-1 pb-2">
                <h4 className="text-base font-bold text-[#0F172A]">Analyze QR Code</h4>
                <p className="text-xs text-[#64748B]">Upload a QR-code image to analyze its destination.</p>
              </div>

              <label className="border-2 border-dashed border-[#E2E8F0] hover:border-[#2563EB]/60 bg-[#F8FAFC] hover:bg-[#EFF6FF]/30 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#2563EB] shadow-2xs">
                  <QrCode className="w-7 h-7" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#0F172A]">Drop QR image here</p>
                  <p className="text-xs text-[#64748B]">or click to browse from device</p>
                </div>

                <span className="text-xs font-semibold px-4 py-2 rounded-xl bg-[#2563EB] text-white shadow-sm hover:bg-blue-700 transition-all">
                  Choose QR Image
                </span>

                <span className="text-[11px] text-[#94A3B8]">Supports PNG, JPG, JPEG, or WEBP</span>

                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageUpload}
                  disabled={isImageDecoding}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Progress / Error Feedbacks */}
      {isImageDecoding && (
        <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-medium text-[#2563EB]">
          <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
          <span>Decoding QR Code image locally...</span>
        </div>
      )}

      {imageError && (
        <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs font-medium text-[#DC2626]">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
          <span>{imageError}</span>
        </div>
      )}

      {/* 3. Decoded QR Result State (Never Auto-Navigating) */}
      {decodedText && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#16A34A] flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>QR Code Detected</span>
            </span>
            <span className="text-[10px] font-mono text-[#64748B]">Decoded Safely</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              Extracted Destination
            </span>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 text-xs font-mono text-[#0F172A] break-all select-all shadow-2xs font-bold">
              {decodedText}
            </div>
          </div>

          {/* Result Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={handleSubmitAnalysis}
              disabled={isLoading}
              className="flex-1 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-xl shadow-sm disabled:opacity-50 transition-all flex items-center justify-center space-x-2 text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing QR Link...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Analyze QR Link →</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleScanAgain}
              className="px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] font-semibold text-xs transition-all flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Scan Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
