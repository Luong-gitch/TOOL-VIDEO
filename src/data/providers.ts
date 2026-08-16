import { ProviderConfig } from '../types';

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'kling',
    name: 'Kling AI (快手)',
    company: 'Kuaishou Technology',
    logo: '⚡',
    description: 'Nền tảng video AI vật lý chuyển động siêu thực hàng đầu thế giới với hỗ trợ camera 3D và thời lượng lên đến 10s.',
    models: [
      { id: 'kling-v1-6-pro', name: 'Kling v1.6 Pro Ultra', badge: 'Mới nhất', costMultiplier: 1.5, maxDuration: 10, resolutions: ['720p', '1080p'] },
      { id: 'kling-v1-5', name: 'Kling v1.5 High-Def', badge: 'Phổ biến', costMultiplier: 1.0, maxDuration: 10, resolutions: ['720p', '1080p'] },
      { id: 'kling-v1', name: 'Kling Standard Fast', costMultiplier: 0.7, maxDuration: 5, resolutions: ['720p'] },
    ],
    supportedModes: ['text2video', 'image2video', 'camera_director'],
    isCustomKeySet: false,
    endpointUrl: 'https://api.klingai.com/v1/videos',
    docUrl: 'https://klingai.org/api-docs'
  },
  {
    id: 'seedance',
    name: 'Seedance AI (ByteDance)',
    company: 'ByteDance & Seed Team',
    logo: '🌱',
    description: 'Chuyên gia chuyển động vũ đạo, motion retargeting nhân vật, đồng bộ nhịp điệu âm nhạc và hoạt ảnh 3D điện ảnh.',
    models: [
      { id: 'seedance-v2-cinema', name: 'Seedance Cinema 2.0', badge: 'Motion Pro', costMultiplier: 1.4, maxDuration: 15, resolutions: ['720p', '1080p'] },
      { id: 'seedance-dance-sync', name: 'Seedance Dance & Motion Sync', badge: 'Vũ đạo AI', costMultiplier: 1.2, maxDuration: 10, resolutions: ['720p', '1080p'] },
      { id: 'seedance-light', name: 'Seedance Turbo Fast', costMultiplier: 0.8, maxDuration: 5, resolutions: ['720p'] },
    ],
    supportedModes: ['text2video', 'image2video', 'dance_motion', 'camera_director'],
    isCustomKeySet: false,
    endpointUrl: 'https://api.seedance.ai/v1/generate',
    docUrl: 'https://seedance.ai/developer'
  },
  {
    id: 'luma',
    name: 'Luma Dream Machine',
    company: 'Luma AI',
    logo: '🪐',
    description: 'Công nghệ Ray 2 mang lại độ nhất quán nhân vật chân thực, ánh sáng volumetric và chuyển cảnh camera mượt mà.',
    models: [
      { id: 'luma-ray-2', name: 'Luma Ray 2', badge: 'Photoreal', costMultiplier: 1.3, maxDuration: 10, resolutions: ['720p', '1080p'] },
      { id: 'luma-dream-fast', name: 'Dream Machine 1.5 Turbo', costMultiplier: 0.9, maxDuration: 5, resolutions: ['720p'] },
    ],
    supportedModes: ['text2video', 'image2video', 'camera_director'],
    isCustomKeySet: false,
    endpointUrl: 'https://api.lumalabs.ai/dream-machine/v1/generations',
    docUrl: 'https://docs.lumalabs.ai'
  },
  {
    id: 'runway',
    name: 'Runway Gen-3 Alpha',
    company: 'RunwayML',
    logo: '🎬',
    description: 'Tiêu chuẩn điện ảnh Hollywood với Motion Brush, kiểm soát camera đa trục và chuyển động physics chuẩn xác.',
    models: [
      { id: 'gen3a_turbo', name: 'Gen-3 Alpha Turbo', badge: 'Fast High-Q', costMultiplier: 1.2, maxDuration: 10, resolutions: ['720p', '1080p'] },
      { id: 'gen3a_pro', name: 'Gen-3 Alpha Pro', badge: 'Cinema 4K', costMultiplier: 1.8, maxDuration: 10, resolutions: ['720p', '1080p', '4k'] },
    ],
    supportedModes: ['text2video', 'image2video', 'camera_director'],
    isCustomKeySet: false,
    endpointUrl: 'https://api.dev.runwayml.com/v1/tasks',
    docUrl: 'https://docs.runwayml.com'
  },
  {
    id: 'fal_hailuo',
    name: 'MiniMax HaiLuo (Fal.ai)',
    company: 'MiniMax & Fal AI',
    logo: '🌊',
    description: 'Mô hình T2V / I2V siêu biểu cảm khuôn mặt, chuyển động tự nhiên cho clip marketing và social media.',
    models: [
      { id: 'fal-minimax-video-01', name: 'Hailuo Video-01 HD', badge: 'Biểu cảm', costMultiplier: 1.1, maxDuration: 10, resolutions: ['720p', '1080p'] },
      { id: 'fal-wan-2-1', name: 'Wan 2.1 14B Video', badge: 'Mới Open-Weight', costMultiplier: 1.0, maxDuration: 5, resolutions: ['720p', '1080p'] },
    ],
    supportedModes: ['text2video', 'image2video'],
    isCustomKeySet: false,
    endpointUrl: 'https://fal.run/fal-ai/minimax-video',
    docUrl: 'https://fal.ai/models'
  },
  {
    id: 'gemini_veo',
    name: 'Google Gemini Veo',
    company: 'Google DeepMind',
    logo: '✨',
    description: 'Tích hợp mô hình video của Google với hiểu biết ngữ cảnh chi tiết, độ phân giải 1080p điện ảnh.',
    models: [
      { id: 'veo-3.1-generate-preview', name: 'Veo 3.1 Pro Cinema', badge: 'DeepMind', costMultiplier: 1.5, maxDuration: 10, resolutions: ['720p', '1080p'] },
      { id: 'veo-3.1-lite-generate-preview', name: 'Veo 3.1 Lite Fast', costMultiplier: 1.0, maxDuration: 5, resolutions: ['720p'] },
    ],
    supportedModes: ['text2video', 'image2video'],
    isCustomKeySet: false,
    endpointUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    docUrl: 'https://ai.google.dev/gemini-api/docs/video-generation'
  }
];

export const STYLE_PRESETS = [
  { id: 'cinematic', name: 'Điện ảnh 35mm', promptSuffix: ', cinematic 35mm anamorphic lens, shallow depth of field, blockbuster movie grading, masterpiece, 8k resolution, photorealistic volumetric lighting' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', promptSuffix: ', cyberpunk aesthetic, neon reflective rain puddles, holographic glitch lighting, octane render, futuristic cityscape' },
  { id: 'anime_manga', name: 'Anime Shinkai', promptSuffix: ', Makoto Shinkai anime style, vibrant sky, luminous cloud reflections, expressive keyframe anime movement, Studio Ghibli touch' },
  { id: 'hyperreal', name: 'Photoreal 8K', promptSuffix: ', ultra photorealistic, 8k uhd, dslr raw photo, natural skin texture, raytraced reflections, highly detailed realism' },
  { id: 'pixar_3d', name: '3D Hoạt hình Pixar', promptSuffix: ', Pixar 3D animation style, Disney lighting, subsurface scattering, cute expressive character design, cheerful vibrant atmosphere' },
  { id: 'dark_fantasy', name: 'Dark Fantasy Elden', promptSuffix: ', dark gothic fantasy, eerie mist, ember particles, dramatic chiaroscuro lighting, epic cinematic scale' },
  { id: 'retro_vhs', name: 'Retro VHS 90s', promptSuffix: ', 90s vintage VHS footage, nostalgic warm film grain, chromatic aberration, tape scanlines, retro aesthetic' },
  { id: 'drone_hyperlapse', name: 'Drone Hyperlapse', promptSuffix: ', high-speed FPV drone motion, sweeping aerial hyperlapse, fast dynamic motion blur, golden hour lighting' },
];

export const CAMERA_PRESETS = [
  { id: 'static', label: 'Tĩnh (Static Shot)', icon: 'Square', desc: 'Máy quay cố định tập trung vào chuyển động chủ thể' },
  { id: 'pan_right', label: 'Pan Phải (Pan Right)', icon: 'ArrowRight', desc: 'Quét ngang camera mượt mà từ trái sang phải' },
  { id: 'pan_left', label: 'Pan Trái (Pan Left)', icon: 'ArrowLeft', desc: 'Quét ngang camera từ phải sang trái' },
  { id: 'tilt_up', label: 'Tilt Lên (Tilt Up)', icon: 'ArrowUp', desc: 'Nâng góc nhìn máy quay từ dưới lên bầu trời' },
  { id: 'tilt_down', label: 'Tilt Xuống (Tilt Down)', icon: 'ArrowDown', desc: 'Hạ góc nhìn máy quay từ trên xuống' },
  { id: 'zoom_in', label: 'Zoom Vào (Dolly In)', icon: 'ZoomIn', desc: 'Tiến gần vào cảm xúc và chi tiết của nhân vật' },
  { id: 'zoom_out', label: 'Zoom Ra (Dolly Out)', icon: 'ZoomOut', desc: 'Mở rộng khung hình để lộ bối cảnh hùng vĩ' },
  { id: 'orbit_360', label: 'Xoay Quanh 360° (Orbit)', icon: 'RotateCw', desc: 'Xoay tròn điện ảnh xung quanh chủ thể chính' },
  { id: 'dynamic_fpv', label: 'Bay Dynamic FPV', icon: 'Compass', desc: 'Góc bay drone siêu tốc độ mạo hiểm uốn lượn' }
];

export const SAMPLE_VIDEOS = [
  {
    id: 'sample-kling-1',
    provider: 'kling' as const,
    model: 'kling-v1-6-pro',
    mode: 'text2video' as const,
    prompt: 'A cyberpunk female warrior walking through futuristic Neo Saigon in heavy rain, holographic neon dragons glowing in the sky, 35mm anamorphic camera tracking backward.',
    enhancedPrompt: 'Cinematic wide shot: An augmented cyberpunk female warrior with glowing neon cyber-katana strides through rain-soaked streets of Neo Saigon. Volumetric cyan and magenta light reflections in puddles, giant holographic cyber-dragons soaring among skyscrapers. 35mm anamorphic lens, slow motion 48fps, masterwork.',
    aspectRatio: '16:9' as const,
    resolution: '1080p' as const,
    duration: 10 as const,
    fps: 30,
    cfgScale: 7.5,
    motionStrength: 7,
    cameraMovement: { type: 'zoom_out' as const, speed: 6, zoomAmount: -4 },
    seed: 884129,
    status: 'completed' as const,
    progress: 100,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    createdAt: Date.now() - 1000 * 60 * 45,
    completedAt: Date.now() - 1000 * 60 * 42,
    creditsCost: 15,
    logs: ['[Kling API] Task submitted to cluster #4', '[Kling GPU] Diffusion step 50/50 finished', '[Kling Video] Encoding MP4 1080p 60fps']
  },
  {
    id: 'sample-seedance-1',
    provider: 'seedance' as const,
    model: 'seedance-dance-sync',
    mode: 'dance_motion' as const,
    prompt: 'An astronaut breakdancing smoothly on the dusty surface of Mars with Earth visible in the star-filled cosmic background, zero-gravity particle dust.',
    enhancedPrompt: 'Seedance Motion Retargeting: Astronaut in high-detail SpaceX suit performing fluid popping and breakdance motions on red Martian soil. Tiny particles of red dust float in low gravity, illuminated by twin moons and a shimmering blue Earth on the horizon. Dynamic camera rotation with rhythm lock.',
    aspectRatio: '9:16' as const,
    resolution: '1080p' as const,
    duration: 10 as const,
    fps: 30,
    cfgScale: 8.0,
    motionStrength: 9,
    cameraMovement: { type: 'orbit_360' as const, speed: 8, zoomAmount: 0 },
    seed: 339102,
    status: 'completed' as const,
    progress: 100,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop&q=80',
    createdAt: Date.now() - 1000 * 60 * 120,
    completedAt: Date.now() - 1000 * 60 * 116,
    creditsCost: 18,
    logs: ['[Seedance Core] Analyzing human keypoints & tempo', '[Seedance Motion] Retargeting 3D skeleton to Mars biome', '[Seedance Video] Render completed successfully']
  },
  {
    id: 'sample-luma-1',
    provider: 'luma' as const,
    model: 'luma-ray-2',
    mode: 'text2video' as const,
    prompt: 'A golden mechanical pocket watch exploding in slow motion, thousands of tiny gears and clockwork springs floating in mid-air with golden dust and light beams.',
    enhancedPrompt: 'Luma Ray 2 Photoreal: Close-up macro slow motion shot of an antique 19th-century Swiss pocket watch gently disassembling in mid-air. Polished brass cogs, ruby jewels, and delicate escapement wheels orbit in zero gravity. Golden hour sunshine creating glistening bokeh and lens flares.',
    aspectRatio: '16:9' as const,
    resolution: '1080p' as const,
    duration: 5 as const,
    fps: 30,
    cfgScale: 7.0,
    motionStrength: 6,
    cameraMovement: { type: 'zoom_in' as const, speed: 5, zoomAmount: 6 },
    seed: 940124,
    status: 'completed' as const,
    progress: 100,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
    createdAt: Date.now() - 1000 * 60 * 200,
    completedAt: Date.now() - 1000 * 60 * 198,
    creditsCost: 12,
    logs: ['[Luma Ray] Initializing 3D Gaussian splat volume', '[Luma Ray] Rendering volumetric ray marching', '[Luma Video] Ready for download']
  }
];
