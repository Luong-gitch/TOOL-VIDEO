import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Film, 
  Image as ImageIcon, 
  Type as TypeIcon, 
  Wand2, 
  Layers, 
  Sliders, 
  Play, 
  Download, 
  RefreshCw, 
  Check, 
  Copy, 
  Camera, 
  Cpu, 
  Video, 
  Compass, 
  ArrowRight, 
  ShieldCheck, 
  Maximize2, 
  Zap,
  Info,
  Clock,
  Eye,
  Plus,
  FolderKanban
} from 'lucide-react';
import { AspectRatio, Resolution, Duration, CameraMovement, VideoTask } from '../types';

interface VeoStudioProps {
  onGenerate: (taskData: any) => Promise<void>;
  isGenerating: boolean;
  lang: 'vi' | 'en';
  onSaveToProject?: (video: Partial<VideoTask>) => void;
  onOpenProjects?: () => void;
}

type VeoMode = 'text2video' | 'image2video';

const VEO_MODELS = [
  {
    id: 'veo-3.1-generate-preview',
    name: 'Veo 3.1 Pro Cinema',
    badge: 'DeepMind Ultra 4K',
    desc: 'Mô hình video điện ảnh thế hệ mới nhất của Google DeepMind với vật lý ánh sáng, đổ bóng ray-tracing và độ phân giải 1080p/4K.',
    resolutions: ['720p', '1080p', '4k'] as Resolution[],
    cost: 15,
  },
  {
    id: 'veo-3.1-lite-generate-preview',
    name: 'Veo 3.1 Lite Fast',
    badge: 'Fast HD',
    desc: 'Tối ưu tốc độ render nhanh, độ trễ thấp, phù hợp tạo clip social media và preview kịch bản thời gian thực.',
    resolutions: ['720p', '1080p'] as Resolution[],
    cost: 10,
  }
];

const VEO_STYLES = [
  { id: 'cinematic', name: 'Điện ảnh Anamorphic 35mm', suffix: ', cinematic 35mm anamorphic lens, shallow depth of field, blockbuster movie grading, masterpiece, 8k resolution, photorealistic volumetric lighting' },
  { id: 'photoreal', name: 'Photoreal 8K Raw', suffix: ', ultra photorealistic, 8k uhd, dslr raw photo, natural skin texture, raytraced reflections, highly detailed realism' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon Matrix', suffix: ', cyberpunk aesthetic, neon reflective rain puddles, holographic glitch lighting, octane render, futuristic cityscape' },
  { id: 'anime_shinkai', name: 'Anime Makoto Shinkai', suffix: ', Makoto Shinkai anime style, vibrant sky, luminous cloud reflections, expressive keyframe anime movement, Studio Ghibli touch' },
  { id: 'pixar_3d', name: 'Pixar 3D Animation', suffix: ', Pixar 3D animation style, Disney lighting, subsurface scattering, cute expressive character design, cheerful vibrant atmosphere' },
  { id: 'dark_fantasy', name: 'Dark Gothic Fantasy', suffix: ', dark gothic fantasy, eerie mist, ember particles, dramatic chiaroscuro lighting, epic cinematic scale' },
  { id: 'retro_vhs', name: 'Retro VHS 90s Film', suffix: ', 90s vintage VHS footage, nostalgic warm film grain, chromatic aberration, tape scanlines, retro aesthetic' },
  { id: 'drone_fpv', name: 'FPV Drone Hyperlapse', suffix: ', high-speed FPV drone motion, sweeping aerial hyperlapse, fast dynamic motion blur, golden hour lighting' },
];

const SAMPLE_STARTER_IMAGES = [
  {
    label: 'Cyberpunk Warrior',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    prompt: 'The cyberpunk warrior ignites her glowing katana, rain droplets steam off the glowing blade, neon city signs flicker in the wet reflection.'
  },
  {
    label: 'Astronaut on Mars',
    url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop&q=80',
    prompt: 'The astronaut steps forward across Martian red sand, low-gravity dust particles floating upward, twin moons glowing softly in the starry sky.'
  },
  {
    label: 'Golden Pocket Watch',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
    prompt: 'The antique golden pocket watch slowly disassembles in zero gravity, cogs and gears revolving gently with golden lens flares.'
  },
  {
    label: 'Futuristic Sports Car',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
    prompt: 'The aerodynamic sports car accelerates along the coastal highway at sunset, tail lights leaving streaks of red light trails.'
  },
  {
    label: 'Floating Fantasy Island',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    prompt: 'Waterfalls cascade from the floating island into the sky, clouds swirl around lush glowing flora in slow motion.'
  }
];

const VEO_PRESETS_GALLERY = [
  {
    title: 'Phim Ngắn Cyberpunk Sài Gòn 2088',
    mode: 'text2video' as VeoMode,
    prompt: 'Một nữ thám tử cyborg mặc áo măng tô dạ quang bước qua khu chợ đêm Sài Gòn ngập tràn ánh đèn hologram tiếng Việt, mưa rào phản chiếu ánh neon tím và vàng, camera trượt ngang theo bước chân.',
    aspectRatio: '16:9' as AspectRatio,
    resolution: '1080p' as Resolution,
    duration: 10 as Duration,
    thumb: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    style: 'cyberpunk'
  },
  {
    title: 'TVC Quảng Cáo Nước Hoa Pha Lê',
    mode: 'image2video' as VeoMode,
    prompt: 'Chai nước hoa pha lê xoay chậm 360 độ giữa hàng ngàn giọt sương mai phát sáng, những cánh hoa hồng nhung bay lượn trong làn gió mượt mà, ánh sáng studio mềm mại.',
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
    aspectRatio: '9:16' as AspectRatio,
    resolution: '1080p' as Resolution,
    duration: 5 as Duration,
    thumb: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
    style: 'cinematic'
  },
  {
    title: 'Thiên Nhiên Kỳ Vĩ Rừng Amazon FPV',
    mode: 'text2video' as VeoMode,
    prompt: 'Cú bay drone FPV siêu tốc lướt qua tán rừng nhiệt đới mù sương buổi sớm, đàn chim hồng hạc vút bay qua dòng sông ngập tràn ánh nắng vàng rực rỡ.',
    aspectRatio: '16:9' as AspectRatio,
    resolution: '1080p' as Resolution,
    duration: 10 as Duration,
    thumb: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
    style: 'drone_fpv'
  }
];

export const VeoStudio: React.FC<VeoStudioProps> = ({
  onGenerate,
  isGenerating,
  lang,
  onSaveToProject,
  onOpenProjects
}) => {
  const [mode, setMode] = useState<VeoMode>('text2video');
  const [model, setModel] = useState<string>('veo-3.1-generate-preview');
  
  // Prompt & Settings
  const [prompt, setPrompt] = useState<string>(
    'Một nữ chiến binh cyberpunk với thanh katana ánh sáng rực rỡ bước qua con phố mưa đêm Sài Gòn 2088, phản chiếu đèn neon hologram...'
  );
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>(
    'blurry, low quality, distorted anatomy, morphing hands, bad lighting, jittery camera, artifacts'
  );
  const [selectedStyle, setSelectedStyle] = useState<string>('cinematic');
  
  // Image to Video inputs
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80');
  const [lastFrameUrl, setLastFrameUrl] = useState<string>('');
  const [useLastFrame, setUseLastFrame] = useState<boolean>(false);
  
  // Format parameters
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<Resolution>('1080p');
  const [duration, setDuration] = useState<Duration>(5);
  const [fps, setFps] = useState<number>(30);
  const [motionStrength, setMotionStrength] = useState<number>(7);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 999999));
  
  // Camera movement
  const [cameraType, setCameraType] = useState<CameraMovement['type']>('zoom_in');
  const [cameraSpeed, setCameraSpeed] = useState<number>(6);
  
  // States
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activePlaybackSpeed, setActivePlaybackSpeed] = useState<number>(1);
  const [videoLoop, setVideoLoop] = useState<boolean>(true);
  
  // Video player ref
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Last rendered result state for instant viewing
  const [currentVideoResult, setCurrentVideoResult] = useState<{
    videoUrl: string;
    thumbnailUrl: string;
    title: string;
    prompt: string;
  }>({
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    title: 'Veo 3.1 Pro Cinema Render',
    prompt: 'Cyberpunk katana warrior walking in rain-slicked futuristic streets, 35mm anamorphic cinema lens, 48fps slow motion.'
  });

  const selectedModelConfig = VEO_MODELS.find(m => m.id === model) || VEO_MODELS[0];
  const creditsCost = duration === 10 ? selectedModelConfig.cost * 1.5 : selectedModelConfig.cost;

  // Enhance prompt with Gemini
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/gemini/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPrompt: prompt,
          provider: 'gemini_veo',
          style: selectedStyle,
          cameraMovement: { type: cameraType, speed: cameraSpeed, zoomAmount: 0 },
          duration,
          mode
        })
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt);
      }
      if (data.negativePrompt) {
        setNegativePrompt(data.negativePrompt);
      }
    } catch (e) {
      console.error('Enhance prompt error:', e);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Submit generate task
  const handleGenerateClick = async () => {
    const finalPrompt = enhancedPrompt || (prompt + (VEO_STYLES.find(s => s.id === selectedStyle)?.suffix || ''));
    
    await onGenerate({
      provider: 'gemini_veo',
      model,
      mode,
      prompt: finalPrompt,
      enhancedPrompt: enhancedPrompt || undefined,
      negativePrompt,
      imageUrl: mode === 'image2video' ? imageUrl : undefined,
      lastFrameUrl: (mode === 'image2video' && useLastFrame) ? lastFrameUrl : undefined,
      aspectRatio,
      resolution,
      duration,
      fps,
      cfgScale: 7.5,
      motionStrength,
      cameraMovement: {
        type: cameraType,
        speed: cameraSpeed,
        zoomAmount: cameraType === 'zoom_in' ? 5 : cameraType === 'zoom_out' ? -5 : 0
      },
      seed,
    });
  };

  // Quick load preset
  const handleLoadPreset = (preset: typeof VEO_PRESETS_GALLERY[0]) => {
    setMode(preset.mode);
    setPrompt(preset.prompt);
    setAspectRatio(preset.aspectRatio);
    setResolution(preset.resolution);
    setDuration(preset.duration);
    setSelectedStyle(preset.style);
    if (preset.imageUrl) {
      setImageUrl(preset.imageUrl);
    }
  };

  // Copy prompt
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(enhancedPrompt || prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Change video speed
  const handleSpeedChange = (speed: number) => {
    setActivePlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Banner for Veo 3 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 shadow-lg">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute right-36 -bottom-16 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                Google DeepMind Veo 3
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/20 text-white/90 font-mono border border-white/10">
                veo-3.1-generate-preview
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 font-bold border border-emerald-300/30">
                T2V & I2V Engine Active
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Google Veo 3 Video AI Studio</span>
            </h1>
            
            <p className="text-sm text-white/90 leading-relaxed font-normal">
              Khởi tạo video điện ảnh độ phân giải 1080p / 4K với công nghệ mô phỏng vật lý và ánh sáng volumetric từ Google DeepMind Veo 3. Hỗ trợ chuyển thể từ văn bản (Text to Video) và chuyển động từ ảnh tĩnh (Image to Video).
            </p>
          </div>

          {/* Quick Stats / Action Pill */}
          <div className="flex items-center gap-3 self-start lg:self-auto bg-black/30 border border-white/20 rounded-xl p-3 backdrop-blur-md">
            <div className="text-right">
              <div className="text-xs text-white/70 font-mono">Chi phí ước tính</div>
              <div className="text-lg font-bold text-amber-300 flex items-center justify-end gap-1">
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>{creditsCost} Credits</span>
              </div>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <button
              id="veo-generate-header-btn"
              onClick={handleGenerateClick}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-sm hover:bg-slate-100 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-700" />
                  <span>Đang Render...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-blue-900 text-blue-900" />
                  <span>Render Video Veo 3</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs (Text to Video vs Image to Video) */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-black/25 p-1.5 rounded-xl border border-white/15 backdrop-blur-md">
            <button
              id="veo-tab-t2v"
              onClick={() => setMode('text2video')}
              className={`flex items-center gap-2.5 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mode === 'text2video'
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <TypeIcon className="w-4 h-4" />
              <span>1. Text to Video (T2V)</span>
            </button>
            <button
              id="veo-tab-i2v"
              onClick={() => setMode('image2video')}
              className={`flex items-center gap-2.5 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mode === 'image2video'
                  ? 'bg-white text-purple-900 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>2. Image to Video (I2V)</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-white/80 font-medium">
              <Cpu className="w-3.5 h-3.5 text-white" />
              <span>DeepMind Veo 3 Cluster</span>
            </div>
            <div className="h-4 w-px bg-white/20"></div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>1080p / 4K Native HDR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Generator Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Model Selection */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Phiên Bản Mô Hình Veo 3</span>
              </label>
              <span className="text-xs text-slate-500 font-medium">Google DeepMind API</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VEO_MODELS.map((m) => {
                const isSelected = model === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all relative ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500/30'
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-slate-900">{m.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{m.desc}</p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Độ phân giải: {m.resolutions.join(', ')}</span>
                      <span className="text-amber-700 font-bold">{m.cost} credits</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Mode Specific Input */}
          {mode === 'image2video' && (
            <div className="bg-white border border-purple-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <span>Ảnh Đầu Vào (Starting Frame Image)</span>
                </label>
                <span className="text-xs text-slate-500 font-mono">JPG, PNG, WebP (Max 20MB)</span>
              </div>

              {/* Image URL / Input */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Dán đường dẫn ảnh URL (https://...)"
                    className="flex-1 bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors"
                  />
                  <button
                    onClick={() => {
                      const rand = SAMPLE_STARTER_IMAGES[Math.floor(Math.random() * SAMPLE_STARTER_IMAGES.length)];
                      setImageUrl(rand.url);
                      setPrompt(rand.prompt);
                    }}
                    className="px-3 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-300 text-xs font-bold hover:bg-purple-100 transition-all whitespace-nowrap"
                  >
                    Ảnh Mẫu Ngẫu Nhiên
                  </button>
                </div>

                {/* Preview and Samples Gallery */}
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {SAMPLE_STARTER_IMAGES.map((sample, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setImageUrl(sample.url);
                        setPrompt(sample.prompt);
                      }}
                      className={`cursor-pointer rounded-lg overflow-hidden border relative group aspect-video transition-all ${
                        imageUrl === sample.url ? 'border-purple-600 ring-2 ring-purple-600/30' : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={sample.url} alt={sample.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center p-1 transition-opacity text-[10px] text-center text-white font-semibold">
                        {sample.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optional Last Frame interpolation */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-700 font-semibold flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useLastFrame}
                        onChange={(e) => setUseLastFrame(e.target.checked)}
                        className="rounded border-slate-300 bg-white text-purple-600 focus:ring-0"
                      />
                      <span>Thêm Khung Hình Kết Thúc (Last Frame Morphing Interpolation)</span>
                    </label>
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold border border-purple-200">Chuyển cảnh mượt</span>
                  </div>

                  {useLastFrame && (
                    <input
                      type="text"
                      value={lastFrameUrl}
                      onChange={(e) => setLastFrameUrl(e.target.value)}
                      placeholder="Nhập URL ảnh kết thúc (để tạo chuyển động biến hình liền mạch)..."
                      className="w-full bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Prompt & Prompt Copilot */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-blue-600" />
                <span>{mode === 'text2video' ? 'Mô Tả Kịch Bản Video (Text Prompt)' : 'Hướng Dẫn Chuyển Động (Motion Guidance Prompt)'}</span>
              </label>
              
              <div className="flex items-center gap-2">
                <button
                  id="veo-enhance-btn"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || !prompt.trim()}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-blue-600 ${isEnhancing ? 'animate-spin' : ''}`} />
                  <span>{isEnhancing ? 'Đang Tối Ưu...' : 'Gemini 3.7 Copilot'}</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder={
                  mode === 'text2video'
                    ? 'Nhập mô tả chi tiết: nhân vật, bối cảnh, ánh sáng, góc quay camera và chuyển động điện ảnh...'
                    : 'Mô tả cách ảnh bắt đầu chuyển động: nước chảy, tóc bay, nhân vật mỉm cười, camera lùi lại...'
                }
                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none resize-none leading-relaxed transition-colors"
              />
              <div className="absolute right-3 bottom-3 text-[10px] text-slate-400 font-mono">
                {prompt.length} ký tự
              </div>
            </div>

            {/* Enhanced Prompt Preview Card if available */}
            {enhancedPrompt && (
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-blue-900 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Đã tối ưu chuẩn cú pháp Veo 3 DeepMind:
                  </span>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 bg-white border border-blue-200 px-2 py-0.5 rounded font-semibold"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>
                <p className="text-slate-800 leading-relaxed italic">{enhancedPrompt}</p>
              </div>
            )}

            {/* Visual Style Presets */}
            <div className="space-y-2 pt-2">
              <label className="text-xs text-slate-600 font-semibold">Phong Cách Thị Giác Veo 3:</label>
              <div className="flex flex-wrap gap-1.5">
                {VEO_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedStyle === style.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Prompt Collapsible */}
            <div className="pt-2">
              <details className="group">
                <summary className="text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer flex items-center gap-1.5 select-none">
                  <Sliders className="w-3 h-3 text-slate-500" />
                  <span>Tùy chỉnh Negative Prompt (Loại trừ lỗi tạo video)</span>
                </summary>
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none"
                  />
                </div>
              </details>
            </div>
          </div>

          {/* Section 4: Video Format & Motion Controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xs">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Thông Số Khung Hình & Camera Vật Lý</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 font-medium">Tỷ lệ khung hình:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['16:9', '9:16', '1:1', '21:9'] as AspectRatio[]).map((ar) => (
                    <button
                      key={ar}
                      onClick={() => setAspectRatio(ar)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        aspectRatio === ar
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 font-medium">Độ phân giải:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['720p', '1080p', '4k'] as Resolution[]).map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        resolution === res
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 font-medium">Thời lượng:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {([5, 10] as Duration[]).map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setDuration(dur)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        duration === dur
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {dur}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Camera Motion Selection */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>Chuyển Động Máy Quay (Director Path):</span>
                </label>
                <span className="text-xs text-blue-700 font-mono font-bold">Tốc độ: {cameraSpeed}/10</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: 'zoom_in', label: 'Zoom Vào (Dolly In)' },
                  { id: 'zoom_out', label: 'Zoom Ra (Dolly Out)' },
                  { id: 'pan_right', label: 'Pan Quét Phải' },
                  { id: 'pan_left', label: 'Pan Quét Trái' },
                  { id: 'orbit_360', label: 'Xoay 360° (Orbit)' },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setCameraType(cam.id as any)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-center transition-all ${
                      cameraType === cam.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                    <span>Độ mạnh chuyển động (Motion):</span>
                    <span className="text-slate-900 font-mono font-bold">{motionStrength}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={motionStrength}
                    onChange={(e) => setMotionStrength(Number(e.target.value))}
                    className="w-full accent-blue-600 bg-slate-200 h-1.5 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                    <span>Tốc độ camera:</span>
                    <span className="text-slate-900 font-mono font-bold">{cameraSpeed}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={cameraSpeed}
                    onChange={(e) => setCameraSpeed(Number(e.target.value))}
                    className="w-full accent-indigo-600 bg-slate-200 h-1.5 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Generate Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Thời gian render: ~45 - 90 giây</span>
              </div>

              <button
                id="veo-submit-main-btn"
                onClick={handleGenerateClick}
                disabled={isGenerating || !prompt.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-105 active:scale-95 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Đang Xử Lý Veo 3...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Tạo Video {mode === 'text2video' ? 'Text to Video' : 'Image to Video'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Video Player & Showcase (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Player / Showcase Screen */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-0">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Màn Hình Xem Video Veo 3</span>
              </div>
              <span className="text-[10px] text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded font-bold border border-blue-200">
                1080p H.264
              </span>
            </div>

            {/* Video Player Display */}
            <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden group">
              <video
                ref={videoRef}
                src={currentVideoResult.videoUrl}
                poster={currentVideoResult.thumbnailUrl}
                controls
                autoPlay
                muted
                loop={videoLoop}
                className="w-full h-full object-cover"
              />
              
              {isGenerating && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/40 animate-pulse">
                    <RefreshCw className="w-6 h-6 text-white animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">Google Veo 3 Đang Render...</div>
                    <p className="text-xs text-white/80">Khởi tạo trường lượng tử khuếch tán ánh sáng DeepMind...</p>
                  </div>
                  <div className="w-48 bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse w-3/4 rounded-full"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls & Actions */}
            <div className="p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-600 font-medium">Tốc độ phát:</span>
                  {[0.5, 1, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        activePlaybackSpeed === spd
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={currentVideoResult.videoUrl}
                    download="veo3_render.mp4"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tải Video MP4</span>
                  </a>
                </div>
              </div>

              {/* Prompt Info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Prompt đang hiển thị:</div>
                <p className="line-clamp-2 text-slate-800 italic">{currentVideoResult.prompt}</p>
              </div>
            </div>
          </div>

          {/* Preset Showcase Templates (1-Click Try) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Mẫu Thử Nghiệm Nhanh Veo 3 (1-Click Load)</span>
              </label>
              <span className="text-[10px] text-amber-700 font-mono font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Curated Presets</span>
            </div>

            <div className="space-y-2.5">
              {VEO_PRESETS_GALLERY.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLoadPreset(preset)}
                  className="group flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 cursor-pointer transition-all"
                >
                  <img
                    src={preset.thumb}
                    alt={preset.title}
                    className="w-16 h-12 rounded-lg object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{preset.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold ${
                        preset.mode === 'text2video' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {preset.mode === 'text2video' ? 'T2V' : 'I2V'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">{preset.prompt}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* DeepMind Veo 3 Technical Architecture Specs */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-xs space-y-2 text-slate-700">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Thông Số Kiến Trúc Google Veo 3:</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
              <li>Mô hình Transformer Diffusion 3D liên tục (Continuous Spatiotemporal Diffusion).</li>
              <li>Bảo toàn độ nhất quán nhân vật và camera nhiều góc quay chuẩn xác.</li>
              <li>Hỗ trợ xử lý trực tiếp qua <strong>@google/genai SDK</strong> trên môi trường Cloud Run an toàn.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};
