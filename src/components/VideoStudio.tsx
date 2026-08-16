import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  Sliders, 
  Play, 
  Zap, 
  RefreshCw, 
  Video, 
  Music, 
  Eye, 
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Settings2
} from 'lucide-react';
import { 
  ProviderId, 
  VideoMode, 
  AspectRatio, 
  Resolution, 
  Duration, 
  CameraMovement,
  UserCredits 
} from '../types';
import { PROVIDERS, SAMPLE_VIDEOS } from '../data/providers';
import { PromptCopilot } from './PromptCopilot';
import { CameraControls } from './CameraControls';
import { LivePreviewStage } from './LivePreviewStage';

interface VideoStudioProps {
  provider: ProviderId;
  setProvider: (p: ProviderId) => void;
  credits: UserCredits;
  onGenerate: (taskData: any) => Promise<void>;
  isGenerating: boolean;
  lang: 'vi' | 'en';
  initialPrompt?: string;
  initialAspectRatio?: AspectRatio;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({
  provider,
  setProvider,
  credits,
  onGenerate,
  isGenerating,
  lang,
  initialPrompt,
  initialAspectRatio,
}) => {
  const currentProviderConfig = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];
  
  // State
  const [mode, setMode] = useState<VideoMode>('text2video');
  const [model, setModel] = useState<string>(currentProviderConfig.models[0].id);
  const [prompt, setPrompt] = useState<string>(
    initialPrompt || 'Một nữ chiến binh cyberpunk với thanh katana ánh sáng rực rỡ bước qua con phố mưa đêm Sài Gòn 2077, phản chiếu đèn neon hologram...'
  );
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('blurry, low quality, distorted anatomy, morphing hands, bad lighting, jittery camera');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [lastFrameUrl, setLastFrameUrl] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(initialAspectRatio || '16:9');

  React.useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  React.useEffect(() => {
    if (initialAspectRatio) {
      setAspectRatio(initialAspectRatio);
    }
  }, [initialAspectRatio]);
  const [resolution, setResolution] = useState<Resolution>('1080p');
  const [duration, setDuration] = useState<Duration>(5);
  const [fps, setFps] = useState<number>(30);
  const [motionStrength, setMotionStrength] = useState<number>(7);
  const [cfgScale, setCfgScale] = useState<number>(7.5);
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 900000 + 100000));
  const [camera, setCamera] = useState<CameraMovement>({
    type: 'zoom_in',
    speed: 5,
    zoomAmount: 4
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync model when provider changes
  React.useEffect(() => {
    const p = PROVIDERS.find(x => x.id === provider);
    if (p && p.models.length > 0) {
      setModel(p.models[0].id);
    }
  }, [provider]);

  // Handle image upload via base64 or url
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isLastFrame = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (isLastFrame) {
          setLastFrameUrl(reader.result as string);
        } else {
          setImageUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Cost calculation
  const baseCost = duration === 15 ? 25 : duration === 10 ? 15 : 10;
  const resolutionMultiplier = resolution === '4k' ? 2 : resolution === '1080p' ? 1.2 : 1;
  const currentModelObj = currentProviderConfig.models.find(m => m.id === model);
  const modelMultiplier = currentModelObj ? currentModelObj.costMultiplier : 1.0;
  const totalCost = Math.round(baseCost * resolutionMultiplier * modelMultiplier);

  const t = {
    vi: {
      modeT2V: 'Văn Bản Sang Video (T2V)',
      modeI2V: 'Ảnh Sang Video (I2V)',
      modeDance: 'Vũ Đạo & Motion (Seedance)',
      modeCamera: 'Đạo Diễn Camera',
      selectProvider: 'Nền Tảng AI & Mô Hình:',
      uploadFirstFrame: 'Tải Ảnh Bắt Đầu (Start Frame)',
      uploadLastFrame: 'Ảnh Kết Thúc (End Frame - Keyframe)',
      aspectRatio: 'Tỷ lệ khung hình',
      duration: 'Thời lượng',
      resolution: 'Độ phân giải',
      motionStrength: 'Cường độ chuyển động (Motion Dynamics):',
      advancedTitle: 'Tham Số Nâng Cao (CFG, Seed, FPS)',
      generateBtn: 'Khởi Tạo Video',
      estimatedCost: 'Chi phí:',
      balance: 'Số dư khả dụng:',
      presetsTitle: 'Mẫu Prompt Mẫu Đặc Sắc (1-Click Load):',
      dropzoneDesc: 'Kéo thả ảnh hoặc nhấp để chọn JPG/PNG'
    },
    en: {
      modeT2V: 'Text to Video (T2V)',
      modeI2V: 'Image to Video (I2V)',
      modeDance: 'Dance & Motion (Seedance)',
      modeCamera: 'Camera Director',
      selectProvider: 'AI Engine & Model Pipeline:',
      uploadFirstFrame: 'Upload Start Frame',
      uploadLastFrame: 'Upload End Frame (Keyframe)',
      aspectRatio: 'Aspect Ratio',
      duration: 'Duration',
      resolution: 'Resolution',
      motionStrength: 'Motion Dynamics Strength:',
      advancedTitle: 'Advanced Parameters (CFG, Seed, FPS)',
      generateBtn: 'Generate Video Now',
      estimatedCost: 'Cost:',
      balance: 'Available Balance:',
      presetsTitle: 'Featured Cinematic Presets (1-Click):',
      dropzoneDesc: 'Drag & drop image or click to browse JPG/PNG'
    }
  }[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    await onGenerate({
      provider,
      model,
      mode,
      prompt,
      enhancedPrompt: enhancedPrompt || prompt,
      negativePrompt,
      imageUrl: mode !== 'text2video' ? imageUrl : undefined,
      lastFrameUrl: mode === 'image2video' ? lastFrameUrl : undefined,
      aspectRatio,
      resolution,
      duration,
      fps,
      cfgScale,
      motionStrength,
      cameraMovement: camera,
      seed,
    });
  };

  const loadSamplePrompt = (sample: typeof SAMPLE_VIDEOS[0]) => {
    setPrompt(sample.prompt);
    setEnhancedPrompt(sample.enhancedPrompt);
    setProvider(sample.provider);
    setDuration(sample.duration);
    setAspectRatio(sample.aspectRatio);
    setResolution(sample.resolution);
    setMotionStrength(sample.motionStrength);
    setCamera(sample.cameraMovement);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Creation Mode Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 border border-slate-200 rounded-2xl overflow-x-auto">
        <button
          type="button"
          id="mode-t2v-btn"
          onClick={() => setMode('text2video')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            mode === 'text2video'
              ? 'bg-white text-blue-700 border border-slate-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>{t.modeT2V}</span>
        </button>

        <button
          type="button"
          id="mode-i2v-btn"
          onClick={() => setMode('image2video')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            mode === 'image2video'
              ? 'bg-white text-purple-700 border border-slate-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-purple-600" />
          <span>{t.modeI2V}</span>
        </button>

        <button
          type="button"
          id="mode-dance-btn"
          onClick={() => {
            setMode('dance_motion');
            setProvider('seedance');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            mode === 'dance_motion'
              ? 'bg-white text-emerald-800 border border-slate-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Music className="w-4 h-4 text-emerald-600" />
          <span>{t.modeDance}</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-200">Special</span>
        </button>

        <button
          type="button"
          id="mode-camera-btn"
          onClick={() => setMode('camera_director')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            mode === 'camera_director'
              ? 'bg-white text-indigo-700 border border-slate-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Video className="w-4 h-4 text-indigo-600" />
          <span>{t.modeCamera}</span>
        </button>
      </div>

      {/* Main Studio Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Prompt, Images, Director Controls */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Interactive Live Preview & Real-Time Motion Stage */}
          <LivePreviewStage
            prompt={prompt}
            enhancedPrompt={enhancedPrompt}
            provider={provider}
            cameraMovement={camera}
            aspectRatio={aspectRatio}
            resolution={resolution}
            duration={duration}
            motionStrength={motionStrength}
            imageUrl={imageUrl}
            onInstantExport={(videoUrl, thumbUrl) => {
              console.log('Instant export video generated:', videoUrl);
            }}
            lang={lang}
          />

          {/* Provider & Model Selection Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 p-4 opacity-5 font-mono text-[52px] leading-none select-none pointer-events-none text-slate-900">
              PIPELINE
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div>
                <label className="text-[11px] font-bold text-slate-800 uppercase tracking-widest block flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                  {t.selectProvider}
                </label>
                <p className="text-xs text-slate-600 mt-1">{currentProviderConfig.description}</p>
              </div>

              {/* Provider dropdown/tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {PROVIDERS.map((p) => {
                  const active = p.id === provider;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      id={`select-provider-${p.id}`}
                      onClick={() => setProvider(p.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        active
                          ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span>{p.logo}</span>
                      <span>{p.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Model Select Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 relative z-10">
              {currentProviderConfig.models.map((m) => {
                const isSelected = model === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    id={`model-card-${m.id}`}
                    onClick={() => setModel(m.id)}
                    className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 text-slate-900 shadow-xs ring-1 ring-blue-500/30'
                        : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">{m.name}</span>
                      {m.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold border border-blue-200">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Max {m.maxDuration}s</span>
                      <span className="text-blue-700 font-bold">{m.costMultiplier}x Credits</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Upload Area (for I2V or Dance mode) */}
          {(mode === 'image2video' || mode === 'dance_motion') && (
            <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-purple-600 rounded-full"></span>
                  <Upload className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {mode === 'dance_motion' ? 'Ảnh Nhân Vật / Pose Vũ Đạo (Seedance)' : 'Keyframes Ảnh Đầu Vào'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">JPG, PNG, WebP (Max 15MB)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Frame Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t.uploadFirstFrame}
                  </label>
                  <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center transition-all bg-slate-50 hover:bg-white flex flex-col items-center justify-center min-h-[140px] group cursor-pointer">
                    <input
                      type="file"
                      id="first-frame-file-input"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {imageUrl ? (
                      <div className="relative w-full h-28 rounded-lg overflow-hidden border border-slate-200">
                        <img src={imageUrl} alt="First Frame" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 bg-slate-900/80 text-[10px] text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                          ✓ Đã tải
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mb-1.5 transition-colors" />
                        <p className="text-xs text-slate-700 font-semibold">{t.dropzoneDesc}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Ảnh khởi đầu video</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Last Frame Upload (End Keyframe) */}
                {mode === 'image2video' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      {t.uploadLastFrame}
                    </label>
                    <div className="relative border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl p-4 text-center transition-all bg-slate-50 hover:bg-white flex flex-col items-center justify-center min-h-[140px] group cursor-pointer">
                      <input
                        type="file"
                        id="last-frame-file-input"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      {lastFrameUrl ? (
                        <div className="relative w-full h-28 rounded-lg overflow-hidden border border-slate-200">
                          <img src={lastFrameUrl} alt="Last Frame" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 right-1 bg-slate-900/80 text-[10px] text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold">
                            ✓ Keyframe End
                          </span>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-purple-600 mb-1.5 transition-colors" />
                          <p className="text-xs text-slate-700 font-semibold">Tùy chọn Keyframe kết thúc</p>
                          <p className="text-[10px] text-slate-500 mt-1">Khóa khung hình chuyển cảnh</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Prompt Copilot Component */}
          <PromptCopilot
            prompt={prompt}
            setPrompt={setPrompt}
            enhancedPrompt={enhancedPrompt}
            setEnhancedPrompt={setEnhancedPrompt}
            negativePrompt={negativePrompt}
            setNegativePrompt={setNegativePrompt}
            provider={provider}
            cameraMovement={camera}
            duration={duration}
            mode={mode}
            lang={lang}
          />

          {/* Camera Controls */}
          <CameraControls
            camera={camera}
            onChange={setCamera}
            lang={lang}
          />

          {/* Sample Prompts Preview / Gallery */}
          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-widest text-slate-600 font-bold block">
              {t.presetsTitle}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_VIDEOS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => loadSamplePrompt(sample)}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-blue-400 bg-white p-2.5 cursor-pointer transition-all hover:shadow-md shadow-xs"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                    <img
                      src={sample.thumbnailUrl}
                      alt={sample.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-1 left-1 bg-slate-900/80 backdrop-blur-md text-[10px] text-white px-2 py-0.5 rounded font-mono">
                      {sample.provider.toUpperCase()}
                    </span>
                    <span className="absolute bottom-1 right-1 bg-blue-600 text-[10px] text-white px-2 py-0.5 rounded font-mono font-bold">
                      {sample.duration}s
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed group-hover:text-blue-900">
                    {sample.prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Format, Duration, Quality, Advanced & Submit */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 sticky top-20">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                <Settings2 className="w-4 h-4 text-blue-600" />
                Cấu Hình Video
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                {resolution} • {duration}s
              </span>
            </div>

            {/* Aspect Ratio Selection */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-2">
                {t.aspectRatio}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['16:9', '9:16', '1:1', '4:3', '21:9'] as AspectRatio[]).map((ar) => {
                  const isSelected = aspectRatio === ar;
                  return (
                    <button
                      key={ar}
                      type="button"
                      id={`ar-btn-${ar.replace(':', '-')}`}
                      onClick={() => setAspectRatio(ar)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-mono">{ar}</span>
                      <span className="text-[9px] text-slate-500 font-normal">
                        {ar === '16:9' ? 'Cinema' : ar === '9:16' ? 'TikTok' : ar === '1:1' ? 'Vuông' : ar === '21:9' ? 'UltraWide' : '4:3'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Selector */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-2">
                {t.duration}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([5, 10, 15] as Duration[]).map((d) => {
                  const isSelected = duration === d;
                  const isSupported = d <= (currentModelObj?.maxDuration || 10);
                  return (
                    <button
                      key={d}
                      type="button"
                      id={`duration-btn-${d}s`}
                      disabled={!isSupported}
                      onClick={() => setDuration(d)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition-all ${
                        !isSupported
                          ? 'opacity-30 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                          : isSelected
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-sm font-bold">{d}s</span>
                      <span className="text-[9px] text-slate-500 font-mono">{d * fps} f</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resolution Selector */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-2">
                {t.resolution}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['720p', '1080p', '4k'] as Resolution[]).map((res) => {
                  const isSelected = resolution === res;
                  const isSupported = currentModelObj?.resolutions.includes(res);
                  return (
                    <button
                      key={res}
                      type="button"
                      id={`res-btn-${res}`}
                      disabled={!isSupported}
                      onClick={() => setResolution(res)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        !isSupported
                          ? 'opacity-30 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                          : isSelected
                          ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {res.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Motion Dynamics Strength */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">{t.motionStrength}</span>
                <span className="font-mono font-bold text-blue-700">{motionStrength} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={motionStrength}
                onChange={(e) => setMotionStrength(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Tĩnh tại & cinematic</span>
                <span>Vũ đạo & biến động cao</span>
              </div>
            </div>

            {/* Advanced Accordion */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                id="toggle-advanced-btn"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.advancedTitle}</span>
                </div>
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
              </button>

              {showAdvanced && (
                <div className="p-4 bg-white space-y-3.5 border-t border-slate-200 text-xs">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-slate-600 font-medium">CFG Scale (Độ bám prompt):</span>
                      <span className="font-mono font-bold text-blue-700">{cfgScale}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="15.0"
                      step="0.5"
                      value={cfgScale}
                      onChange={(e) => setCfgScale(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-slate-600 font-medium">FPS Render:</span>
                      <span className="font-mono font-bold text-blue-700">{fps} FPS</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[24, 30].map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFps(f)}
                          className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${fps === f ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                          {f} FPS {f === 24 ? '(Cinematic)' : '(Smooth)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-slate-600 font-medium">Seed:</span>
                      <button
                        type="button"
                        onClick={() => setSeed(Math.floor(Math.random() * 900000 + 100000))}
                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-mono font-bold"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Random
                      </button>
                    </div>
                    <input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 focus:bg-white rounded-lg px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cost & Submit CTA */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{t.estimatedCost}</span>
                <div className="flex items-center gap-1.5 font-bold text-blue-700 text-sm">
                  <Zap className="w-4 h-4 fill-blue-600 text-blue-600" />
                  <span>{totalCost} Credits</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 font-mono">
                <span>{t.balance}</span>
                <span className="text-slate-800 font-bold">{credits.balance.toLocaleString()} Credits</span>
              </div>

              <button
                type="submit"
                id="submit-generate-video-btn"
                disabled={isGenerating || !prompt.trim() || credits.balance < totalCost}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-bold text-sm tracking-wide shadow-md shadow-blue-500/20 hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 text-white"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang khởi tạo pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>{t.generateBtn.toUpperCase()} ({totalCost} CREDITS)</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </form>

    </div>
  );
};
