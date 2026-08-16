export type ProviderId = 'kling' | 'seedance' | 'luma' | 'runway' | 'fal_hailuo' | 'gemini_veo';

export type VideoMode = 'text2video' | 'image2video' | 'dance_motion' | 'camera_director' | 'storyboard';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '21:9';

export type Resolution = '720p' | '1080p' | '4k';

export type Duration = 5 | 10 | 15;

export type VideoStatus = 'queued' | 'processing' | 'rendering' | 'completed' | 'failed';

export interface CameraMovement {
  type: 'static' | 'pan_left' | 'pan_right' | 'tilt_up' | 'tilt_down' | 'zoom_in' | 'zoom_out' | 'roll_cw' | 'roll_ccw' | 'orbit_360' | 'dynamic_fpv';
  speed: number; // 1 - 10
  zoomAmount: number; // -10 to +10
}

export interface VideoTask {
  id: string;
  provider: ProviderId;
  model: string;
  mode: VideoMode;
  prompt: string;
  enhancedPrompt?: string;
  negativePrompt?: string;
  imageUrl?: string;
  lastFrameUrl?: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  duration: Duration;
  fps: number;
  cfgScale: number;
  motionStrength: number;
  cameraMovement: CameraMovement;
  seed: number;
  status: VideoStatus;
  progress: number;
  currentStep?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  createdAt: number;
  completedAt?: number;
  creditsCost: number;
  logs: string[];
}

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  company: string;
  logo: string;
  description: string;
  models: {
    id: string;
    name: string;
    badge?: string;
    costMultiplier: number;
    maxDuration: Duration;
    resolutions: Resolution[];
  }[];
  supportedModes: VideoMode[];
  isCustomKeySet: boolean;
  endpointUrl: string;
  docUrl: string;
}

export interface StoryboardScene {
  sceneNumber: number;
  title: string;
  description: string;
  visualPrompt: string;
  cameraAction: string;
  duration: number;
  audioPrompt?: string;
  generatedTaskId?: string;
}

export interface UserCredits {
  balance: number;
  totalGenerated: number;
  planName: 'Starter' | 'Pro Creator' | 'Studio' | 'Enterprise';
  monthlyQuota: number;
  renewalDate: string;
}

export interface ApiGatewayKeys {
  klingApiKey: string;
  seedanceApiKey: string;
  lumaApiKey: string;
  runwayApiKey: string;
  falApiKey: string;
  customWebhookUrl: string;
}

export interface VideoProject {
  id: string;
  title: string;
  description: string;
  category: 'commercial' | 'social_shorts' | 'film_trailer' | 'music_video' | 'anime' | 'education';
  aspectRatio: AspectRatio;
  defaultProvider: ProviderId;
  scenes: StoryboardScene[];
  clips: VideoTask[];
  createdAt: number;
  updatedAt: number;
  thumbnailUrl?: string;
  status: 'draft' | 'in_progress' | 'completed';
}
