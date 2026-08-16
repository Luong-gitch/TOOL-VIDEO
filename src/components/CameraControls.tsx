import React from 'react';
import { CameraMovement } from '../types';
import { CAMERA_PRESETS } from '../data/providers';
import { 
  Square, 
  ArrowRight, 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Compass,
  Sliders,
  Video
} from 'lucide-react';

interface CameraControlsProps {
  camera: CameraMovement;
  onChange: (camera: CameraMovement) => void;
  lang: 'vi' | 'en';
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  camera,
  onChange,
  lang
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'pan_right': return <ArrowRight className="w-4 h-4" />;
      case 'pan_left': return <ArrowLeft className="w-4 h-4" />;
      case 'tilt_up': return <ArrowUp className="w-4 h-4" />;
      case 'tilt_down': return <ArrowDown className="w-4 h-4" />;
      case 'zoom_in': return <ZoomIn className="w-4 h-4" />;
      case 'zoom_out': return <ZoomOut className="w-4 h-4" />;
      case 'orbit_360': return <RotateCw className="w-4 h-4" />;
      case 'dynamic_fpv': return <Compass className="w-4 h-4" />;
      default: return <Square className="w-4 h-4" />;
    }
  };

  const t = {
    vi: {
      title: 'Đạo Diễn Camera 3D (Kling / Seedance / Runway)',
      movement: 'Góc Chuyển Động',
      speed: 'Tốc độ di chuyển camera',
      zoom: 'Mức độ Zoom / Phóng đại',
      subtext: 'Điều khiển góc máy quay chuẩn điện ảnh giúp video không bị rung lắc và giữ vững nét nhân vật.'
    },
    en: {
      title: '3D Camera Director (Kling / Seedance / Runway)',
      movement: 'Camera Motion Vector',
      speed: 'Camera Movement Speed',
      zoom: 'Zoom / Dolly Strength',
      subtext: 'Cinematic camera trajectory controls to maintain consistent character anatomy and optical realism.'
    }
  }[lang];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t.title}</h4>
            <p className="text-[11px] text-slate-500">{t.subtext}</p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200 font-mono">
          {CAMERA_PRESETS.find(p => p.id === camera.type)?.label || camera.type}
        </span>
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
        {CAMERA_PRESETS.map((preset) => {
          const isSelected = camera.type === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              id={`camera-preset-${preset.id}`}
              onClick={() => onChange({ ...camera, type: preset.id as any })}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-xs ring-1 ring-blue-500/30'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={preset.desc}
            >
              <div className={`mb-1.5 p-1.5 rounded-lg ${isSelected ? 'text-blue-600 bg-blue-100' : 'text-slate-400'}`}>
                {getIcon(preset.id)}
              </div>
              <span className="text-[11px] font-semibold leading-tight line-clamp-1">{preset.label.split(' ')[0]}</span>
              <span className="text-[9px] text-slate-500 line-clamp-1">{preset.label.split('(')[1]?.replace(')', '') || ''}</span>
            </button>
          );
        })}
      </div>

      {/* Sliders for Speed & Zoom Amount */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-medium">{t.speed}:</span>
            <span className="font-mono font-bold text-blue-700">{camera.speed} / 10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={camera.speed}
            onChange={(e) => onChange({ ...camera, speed: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-medium">{t.zoom}:</span>
            <span className="font-mono font-bold text-purple-700">
              {camera.zoomAmount > 0 ? `+${camera.zoomAmount}` : camera.zoomAmount}
            </span>
          </div>
          <input
            type="range"
            min="-10"
            max="10"
            step="1"
            value={camera.zoomAmount}
            onChange={(e) => onChange({ ...camera, zoomAmount: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>
      </div>
    </div>
  );
};
