import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Eye, 
  Maximize2, 
  Sparkles, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Layers, 
  Video,
  Camera,
  Film,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { CameraMovement, AspectRatio, ProviderId, Resolution } from '../types';

interface LivePreviewStageProps {
  prompt: string;
  enhancedPrompt?: string;
  provider: ProviderId;
  cameraMovement: CameraMovement;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  duration: number;
  motionStrength: number;
  imageUrl?: string;
  onInstantExport?: (videoUrl: string, thumbUrl: string) => void;
  lang: 'vi' | 'en';
}

export const LivePreviewStage: React.FC<LivePreviewStageProps> = ({
  prompt,
  enhancedPrompt,
  provider,
  cameraMovement,
  aspectRatio,
  resolution,
  duration,
  motionStrength,
  imageUrl,
  onInstantExport,
  lang,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeLut, setActiveLut] = useState<'cinema' | 'cyberpunk' | 'warm' | 'matrix'>('cinema');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const uploadedImageRef = useRef<HTMLImageElement | null>(null);

  // Load uploaded image if provided
  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      img.onload = () => {
        uploadedImageRef.current = img;
      };
    } else {
      uploadedImageRef.current = null;
    }
  }, [imageUrl]);

  // Dimensions based on Aspect Ratio
  const getCanvasDimensions = () => {
    switch (aspectRatio) {
      case '9:16':
        return { width: 360, height: 640 };
      case '1:1':
        return { width: 480, height: 480 };
      case '21:9':
        return { width: 700, height: 300 };
      case '4:3':
        return { width: 560, height: 420 };
      case '16:9':
      default:
        return { width: 640, height: 360 };
    }
  };

  const { width, height } = getCanvasDimensions();

  // Canvas Animation Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = currentTime;

    const renderFrame = () => {
      if (isPlaying) {
        time = (time + 0.03) % duration;
        setCurrentTime(time);
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Background Cinematic Gradient & Stars/Particles
      const gradient = ctx.createRadialGradient(
        width / 2 + Math.sin(time * 1.5) * 40,
        height / 2 + Math.cos(time * 1.2) * 30,
        20,
        width / 2,
        height / 2,
        Math.max(width, height)
      );

      if (activeLut === 'cyberpunk') {
        gradient.addColorStop(0, '#2b0938');
        gradient.addColorStop(0.5, '#0d0d26');
        gradient.addColorStop(1, '#020208');
      } else if (activeLut === 'matrix') {
        gradient.addColorStop(0, '#042111');
        gradient.addColorStop(0.6, '#021208');
        gradient.addColorStop(1, '#010502');
      } else if (activeLut === 'warm') {
        gradient.addColorStop(0, '#381c08');
        gradient.addColorStop(0.6, '#1a0d04');
        gradient.addColorStop(1, '#060301');
      } else {
        // Cinema Blue
        gradient.addColorStop(0, '#0c1a38');
        gradient.addColorStop(0.5, '#070b17');
        gradient.addColorStop(1, '#020308');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. 3D Perspective Grid / Motion Lines
      ctx.save();
      ctx.strokeStyle = activeLut === 'matrix' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 1;

      // Horizon line
      const horizonY = height * 0.65;
      const speedOffset = (time * motionStrength * 18) % 40;

      // Grid perspective lines
      for (let x = -width; x < width * 2; x += 50) {
        ctx.beginPath();
        ctx.moveTo(width / 2, horizonY - 40);
        ctx.lineTo(x + Math.sin(time) * 10, height);
        ctx.stroke();
      }

      // Horizontal ground bars
      for (let y = horizonY; y < height; y += 12) {
        const factor = (y - horizonY) / (height - horizonY);
        ctx.beginPath();
        ctx.moveTo(0, y + (speedOffset * factor) % 20);
        ctx.lineTo(width, y + (speedOffset * factor) % 20);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Render uploaded keyframe image with camera movement simulation
      if (uploadedImageRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.85;

        // Apply camera transforms
        let zoom = 1;
        let panX = 0;
        let panY = 0;
        let rotate = 0;

        const camType = cameraMovement.type;
        const camSpeed = cameraMovement.speed || 5;
        const progress = time / duration;

        if (camType === 'zoom_in') {
          zoom = 1 + progress * (camSpeed * 0.05);
        } else if (camType === 'zoom_out') {
          zoom = 1.3 - progress * (camSpeed * 0.05);
        } else if (camType === 'pan_left') {
          panX = (progress - 0.5) * 60 * (camSpeed / 5);
        } else if (camType === 'pan_right') {
          panX = -(progress - 0.5) * 60 * (camSpeed / 5);
        } else if (camType === 'tilt_up') {
          panY = (progress - 0.5) * 40 * (camSpeed / 5);
        } else if (camType === 'tilt_down') {
          panY = -(progress - 0.5) * 40 * (camSpeed / 5);
        } else if (camType === 'orbit_360') {
          panX = Math.sin(progress * Math.PI * 2) * 35;
          panY = Math.cos(progress * Math.PI * 2) * 15;
          rotate = Math.sin(progress * Math.PI * 2) * 0.04;
        }

        ctx.translate(width / 2 + panX, height / 2 + panY);
        ctx.rotate(rotate);
        ctx.scale(zoom, zoom);

        const img = uploadedImageRef.current;
        const imgAspect = img.width / img.height;
        let drawW = width * 0.85;
        let drawH = drawW / imgAspect;

        if (drawH > height * 0.85) {
          drawH = height * 0.85;
          drawW = drawH * imgAspect;
        }

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      } else {
        // 4. Procedural Subject & Energy Light Burst
        ctx.save();
        const centerX = width / 2 + Math.sin(time * 2) * (cameraMovement.type === 'pan_left' ? -20 : 15);
        const centerY = height * 0.45 + Math.cos(time * 1.8) * 10;

        // Glowing core sphere
        const coreGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          5,
          centerX,
          centerY,
          70 + Math.sin(time * 4) * 15
        );

        if (activeLut === 'cyberpunk') {
          coreGradient.addColorStop(0, '#f43f5e');
          coreGradient.addColorStop(0.4, '#a855f7');
          coreGradient.addColorStop(1, 'transparent');
        } else if (activeLut === 'matrix') {
          coreGradient.addColorStop(0, '#4ade80');
          coreGradient.addColorStop(0.5, '#16a34a');
          coreGradient.addColorStop(1, 'transparent');
        } else if (activeLut === 'warm') {
          coreGradient.addColorStop(0, '#fbbf24');
          coreGradient.addColorStop(0.5, '#ea580c');
          coreGradient.addColorStop(1, 'transparent');
        } else {
          coreGradient.addColorStop(0, '#60a5fa');
          coreGradient.addColorStop(0.5, '#3b82f6');
          coreGradient.addColorStop(1, 'transparent');
        }

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
        ctx.fill();

        // Kinetic Light Ring
        ctx.strokeStyle = activeLut === 'cyberpunk' ? '#ec4899' : '#60a5fa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 55 + Math.sin(time * 3) * 10, 22, time * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // 5. Dynamic Camera HUD & Overlays
      ctx.save();
      // Safe area box corners
      const pad = 24;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;

      // Top-Left Corner
      ctx.beginPath();
      ctx.moveTo(pad, pad + 15);
      ctx.lineTo(pad, pad);
      ctx.lineTo(pad + 15, pad);
      ctx.stroke();

      // Top-Right Corner
      ctx.beginPath();
      ctx.moveTo(width - pad - 15, pad);
      ctx.lineTo(width - pad, pad);
      ctx.lineTo(width - pad, pad + 15);
      ctx.stroke();

      // Bottom-Left Corner
      ctx.beginPath();
      ctx.moveTo(pad, height - pad - 15);
      ctx.lineTo(pad, height - pad);
      ctx.lineTo(pad + 15, height - pad);
      ctx.stroke();

      // Bottom-Right Corner
      ctx.beginPath();
      ctx.moveTo(width - pad - 15, height - pad);
      ctx.lineTo(width - pad, height - pad);
      ctx.lineTo(width - pad, height - pad - 15);
      ctx.stroke();

      // Center crosshair
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(width / 2 - 8, height / 2);
      ctx.lineTo(width / 2 + 8, height / 2);
      ctx.moveTo(width / 2, height / 2 - 8);
      ctx.lineTo(width / 2, height / 2 + 8);
      ctx.stroke();

      // HUD Text Info
      ctx.fillStyle = '#60a5fa';
      ctx.font = '10px monospace';
      ctx.fillText(`CAM: ${cameraMovement.type.toUpperCase()} | SPD: ${cameraMovement.speed}/10`, pad, pad + 12);
      ctx.fillText(`${provider.toUpperCase()} | ${resolution} | ${duration}s`, pad, pad + 24);

      // REC status
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(width - pad - 45, pad + 8, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(`LIVE ${time.toFixed(1)}s`, width - pad - 35, pad + 11);

      // Bottom prompt excerpt
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '11px sans-serif';
      const promptSnippet = prompt.length > 55 ? prompt.substring(0, 52) + '...' : prompt;
      ctx.fillText(`“${promptSnippet}”`, pad, height - pad - 6);

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, width, height, activeLut, cameraMovement, motionStrength, duration, prompt, provider, resolution]);

  // Instant Interactive Video Exporter via MediaRecorder
  const handleInstantExport = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsRecording(true);
      setExportSuccess(false);

      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4000000 });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);
        const thumbUrl = canvas.toDataURL('image/jpeg', 0.85);

        setRecordedBlob(blob);
        setRecordedVideoUrl(videoUrl);
        setIsRecording(false);
        setExportSuccess(true);

        if (onInstantExport) {
          onInstantExport(videoUrl, thumbUrl);
        }
      };

      recorder.start();

      // Record for 3.5 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 3500);
    } catch (err) {
      console.error('Export video error:', err);
      setIsRecording(false);
    }
  };

  const handleDownloadDirect = () => {
    if (!recordedVideoUrl && !canvasRef.current) return;

    if (recordedVideoUrl) {
      const a = document.createElement('a');
      a.href = recordedVideoUrl;
      a.download = `omnivideo_${provider}_${Date.now()}.webm`;
      a.click();
    } else if (canvasRef.current) {
      const imageUri = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imageUri;
      a.download = `omnivideo_preview_frame_${Date.now()}.png`;
      a.click();
    }
  };

  const t = {
    vi: {
      stageTitle: 'Mô Phỏng Trực Tiếp Góc Máy & Hiệu Ứng (Live Motion Stage)',
      stageDesc: 'Thao tác trực tiếp với chuyển động camera 3D, thử bộ lọc LUT và xuất video ngay lập tức.',
      play: 'Phát',
      pause: 'Tạm Dừng',
      restart: 'Phát Lại',
      renderClip: 'Xuất Thử Video Ngay (Instant WebM/MP4)',
      renderingClip: 'Đang ghi hình video canvas 60fps...',
      downloadBtn: 'Tải Video Clip Vừa Tạo',
      lutCinema: 'Cinema Teal-Blue',
      lutCyber: 'Cyberpunk Neon',
      lutWarm: 'Golden Hour',
      lutMatrix: 'Matrix Green',
      aspectLabel: 'Khung hình:',
      camLabel: 'Camera:',
    },
    en: {
      stageTitle: 'Live 3D Camera & Motion Simulator Stage',
      stageDesc: 'Interact directly with camera trajectories, switch LUT color grading and instantly export video.',
      play: 'Play',
      pause: 'Pause',
      restart: 'Restart',
      renderClip: 'Instant Canvas Video Export',
      renderingClip: 'Recording 60fps canvas video stream...',
      downloadBtn: 'Download Generated Video',
      lutCinema: 'Cinema Teal-Blue',
      lutCyber: 'Cyberpunk Neon',
      lutWarm: 'Golden Hour',
      lutMatrix: 'Matrix Green',
      aspectLabel: 'Aspect:',
      camLabel: 'Camera:',
    }
  }[lang];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">{t.stageTitle}</h4>
            <p className="text-[11px] text-slate-500">{t.stageDesc}</p>
          </div>
        </div>

        {/* LUT Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveLut('cinema')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              activeLut === 'cinema' ? 'bg-white text-blue-700 font-bold border border-slate-300 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.lutCinema}
          </button>
          <button
            type="button"
            onClick={() => setActiveLut('cyberpunk')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              activeLut === 'cyberpunk' ? 'bg-white text-pink-700 font-bold border border-slate-300 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.lutCyber}
          </button>
          <button
            type="button"
            onClick={() => setActiveLut('warm')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              activeLut === 'warm' ? 'bg-white text-amber-800 font-bold border border-slate-300 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.lutWarm}
          </button>
          <button
            type="button"
            onClick={() => setActiveLut('matrix')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              activeLut === 'matrix' ? 'bg-white text-emerald-800 font-bold border border-slate-300 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.lutMatrix}
          </button>
        </div>
      </div>

      {/* Main Canvas Stage Screen */}
      <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[300px] sm:min-h-[360px] shadow-inner group">
        
        {/* The HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="max-w-full max-h-[400px] object-contain rounded-xl"
        />

        {/* Center Play/Pause hover trigger */}
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white translate-x-0.5" />}
        </button>

        {/* Bottom Floating Timeline Controls */}
        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/80 backdrop-blur-md border border-white/15 rounded-xl p-2 flex items-center gap-3">
          
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
            title={isPlaying ? t.pause : t.play}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          </button>

          <button
            type="button"
            onClick={() => setCurrentTime(0)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
            title={t.restart}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Scrubber slider */}
          <div className="flex-1 flex items-center gap-2">
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={currentTime}
              onChange={(e) => {
                setCurrentTime(Number(e.target.value));
              }}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-400"
            />
            <span className="text-[11px] font-mono text-blue-300 whitespace-nowrap">
              {currentTime.toFixed(1)}s / {duration}s
            </span>
          </div>

        </div>

      </div>

      {/* Action Buttons: Instant Export / Download Video */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="text-slate-500 font-medium">{t.aspectLabel}</span>
          <span className="font-mono font-bold text-slate-800 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">{aspectRatio}</span>
          <span className="text-slate-500 font-medium">{t.camLabel}</span>
          <span className="font-mono font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">{cameraMovement.type}</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          
          <button
            type="button"
            id="instant-video-export-btn"
            disabled={isRecording}
            onClick={handleInstantExport}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-105 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isRecording ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{t.renderingClip}</span>
              </>
            ) : (
              <>
                <Film className="w-3.5 h-3.5" />
                <span>{t.renderClip}</span>
              </>
            )}
          </button>

          {(recordedVideoUrl || exportSuccess) && (
            <button
              type="button"
              id="download-recorded-video-btn"
              onClick={handleDownloadDirect}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-xs font-bold transition-all shadow-xs animate-fade-in"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.downloadBtn}</span>
            </button>
          )}

        </div>

      </div>

    </div>
  );
};
