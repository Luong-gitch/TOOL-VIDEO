import React, { useState } from 'react';
import { 
  ListTree, 
  Sparkles, 
  RefreshCw, 
  Play, 
  Pause,
  Layers, 
  Film, 
  Clock, 
  Camera, 
  Music, 
  Plus, 
  Trash2,
  Zap,
  ArrowRight,
  Edit3,
  Check,
  Eye,
  Sliders
} from 'lucide-react';
import { StoryboardScene, ProviderId } from '../types';

interface StoryboardBuilderProps {
  onGenerateScene: (scene: StoryboardScene) => void;
  lang: 'vi' | 'en';
}

export const StoryboardBuilder: React.FC<StoryboardBuilderProps> = ({
  onGenerateScene,
  lang,
}) => {
  const [script, setScript] = useState<string>(
    'Một nhà thám hiểm vũ trụ hạ cánh xuống một hành tinh phủ đầy pha lê tím phát quang. Anh ta phát hiện một cổ vật cổ đại trôi nổi phát ra sóng năng lượng bí ẩn. Khi chạm vào nó, không gian xung quanh biến đổi thành một cổng dịch chuyển đa chiều.'
  );
  const [targetProvider, setTargetProvider] = useState<ProviderId>('kling');
  const [mood, setMood] = useState<string>('Sci-Fi Epic & Cinematic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  const [scenes, setScenes] = useState<StoryboardScene[]>([
    {
      sceneNumber: 1,
      title: 'Hạ Cánh Khám Phá',
      description: 'Phi thuyền hạ cánh trên bề mặt hành tinh tinh thể tím.',
      visualPrompt: 'Cinematic wide establishing shot: High-tech exploration spaceship landing on surface of alien planet covered in towering luminescent violet crystals. Golden alien sunset, atmospheric purple mist, 35mm anamorphic camera panning slowly.',
      cameraAction: 'Pan right and slow zoom in toward the landing site',
      duration: 5,
      audioPrompt: 'Atmospheric sci-fi ambient synth with heavy distant bass',
    },
    {
      sceneNumber: 2,
      title: 'Phát Hiện Cổ Vật',
      description: 'Nhà thám hiểm tiếp cận khối cầu năng lượng bay lơ lửng.',
      visualPrompt: 'Medium shot tracking astronaut in reflective spacesuit approaching a floating glowing hyper-dimensional artifact hovering above crystal ground. Neon cyan energy particles swirling around.',
      cameraAction: 'Dolly forward following the astronaut steps',
      duration: 5,
      audioPrompt: 'High pitched pulsing energy frequencies',
    },
    {
      sceneNumber: 3,
      title: 'Kích Hoạt Cổng Không Gian',
      description: 'Cổ vật bùng nổ năng lượng, mở ra chiều không gian mới.',
      visualPrompt: 'Dynamic rotating shot: Touching the crystal artifact causes a blinding shockwave of chromatic lights. Reality bends and a vortex cosmic portal opens in the sky with nebulae vortex.',
      cameraAction: 'Fast orbit 360 degrees around subject with slight lens warp',
      duration: 10,
      audioPrompt: 'Orchestral climax with cosmic whoosh and impact',
    },
  ]);

  const t = {
    vi: {
      title: 'Phân Cảnh Storyboard AI (Script-to-Video Engine)',
      subtitle: 'Biến kịch bản hoặc ý tưởng thô thành chuỗi cảnh quay điện ảnh chi tiết chuẩn bị render trên Kling / Seedance.',
      scriptLabel: 'Nhập Kịch Bản Hoặc Câu Chuyện:',
      generateScenesBtn: 'Phân Cảnh Tự Động Với Gemini AI',
      generating: 'Đang phân tích cốt truyện & tạo shot list...',
      scenesTitle: 'Danh Sách Phân Cảnh (Shot List):',
      renderScene: 'Render Cảnh Này',
      renderAll: 'Batch Render Tất Cả Cảnh',
      scene: 'Cảnh',
      cameraLabel: 'Góc máy:',
      soundLabel: 'Âm thanh:',
      addScene: 'Thêm Cảnh Mới',
      playSequence: 'Phát Thử Kịch Bản',
      stopSequence: 'Dừng Phát',
      editPrompt: 'Prompt quay video:',
      durationLabel: 'Thời lượng:'
    },
    en: {
      title: 'AI Storyboard Studio (Script-to-Video Engine)',
      subtitle: 'Break down scripts into multi-shot cinematic sequences ready for Kling & Seedance video pipelines.',
      scriptLabel: 'Enter Script or Story Outline:',
      generateScenesBtn: 'Breakdown Script with Gemini AI',
      generating: 'Analyzing script & generating cinematic shot list...',
      scenesTitle: 'Scene Sequence (Shot List):',
      renderScene: 'Render Scene',
      renderAll: 'Batch Render All Scenes',
      scene: 'Scene',
      cameraLabel: 'Camera Angle:',
      soundLabel: 'Audio Design:',
      addScene: 'Add New Shot',
      playSequence: 'Preview Sequence',
      stopSequence: 'Stop Preview',
      editPrompt: 'Visual Video Prompt:',
      durationLabel: 'Duration:'
    }
  }[lang];

  const handleBreakdown = async () => {
    if (!script.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          targetProvider,
          totalScenes: 4,
          mood,
        }),
      });

      if (!res.ok) throw new Error('Storyboard generation failed');
      const data = await res.json();
      if (data.scenes && Array.isArray(data.scenes)) {
        setScenes(data.scenes);
      }
    } catch (err) {
      console.error('Storyboard error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddScene = () => {
    const nextNum = scenes.length + 1;
    const newScene: StoryboardScene = {
      sceneNumber: nextNum,
      title: `Cảnh ${nextNum}: Chuyển Tiếp Tiếp Theo`,
      description: 'Mô tả hành động của nhân vật hoặc bối cảnh tiếp diễn câu chuyện.',
      visualPrompt: 'Cinematic dynamic shot: Smooth camera transition capturing main subject, high detail, volumetric lighting, 8k render.',
      cameraAction: 'Dolly forward slow zoom',
      duration: 5,
      audioPrompt: 'Atmospheric cinematic transition tone',
    };
    setScenes([...scenes, newScene]);
  };

  const handleDeleteScene = (index: number) => {
    const updated = scenes.filter((_, i) => i !== index);
    setScenes(updated);
  };

  const handleUpdateScene = (index: number, field: keyof StoryboardScene, val: any) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], [field]: val };
    setScenes(updated);
  };

  // Play continuous sequence simulator
  const togglePlaySequence = () => {
    if (isPlayingSequence) {
      setIsPlayingSequence(false);
    } else {
      setIsPlayingSequence(true);
      setActiveSceneIndex(0);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-1.5 h-4 bg-amber-600 rounded-full"></span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <ListTree className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{t.title}</h2>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl">{t.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={targetProvider}
              onChange={(e) => setTargetProvider(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="kling">Target: Kling AI v1.6 Pro</option>
              <option value="seedance">Target: Seedance AI Cinema</option>
              <option value="luma">Target: Luma Ray 2</option>
              <option value="runway">Target: Runway Gen-3</option>
            </select>
          </div>
        </div>

        {/* Script Input */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-800 block">{t.scriptLabel}</label>
          <textarea
            id="storyboard-script-input"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white resize-none font-sans leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="toggle-sequence-play-btn"
                onClick={togglePlaySequence}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isPlayingSequence
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {isPlayingSequence ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlayingSequence ? t.stopSequence : t.playSequence}</span>
              </button>

              <button
                type="button"
                id="add-scene-btn"
                onClick={handleAddScene}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.addScene}</span>
              </button>
            </div>

            <button
              type="button"
              id="generate-storyboard-btn"
              disabled={isGenerating || !script.trim()}
              onClick={handleBreakdown}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-600 hover:brightness-105 text-white text-xs font-bold shadow-md shadow-amber-950/20 disabled:opacity-50 transition-all"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.generating}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>{t.generateScenesBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Scenes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-4 bg-amber-600 rounded-full"></span>
            <Film className="w-4 h-4 text-amber-600" />
            <span>{t.scenesTitle} ({scenes.length} Shots)</span>
          </h3>

          <button
            type="button"
            id="batch-render-all-scenes-btn"
            onClick={() => {
              scenes.forEach((s) => onGenerateScene(s));
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.renderAll}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenes.map((scene, idx) => {
            const isCurrentActive = isPlayingSequence && activeSceneIndex === idx;
            return (
              <div
                key={idx}
                className={`bg-white border rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all shadow-xs ${
                  isCurrentActive
                    ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold font-mono">
                      {t.scene} #{scene.sceneNumber || idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={scene.duration}
                        onChange={(e) => handleUpdateScene(idx, 'duration', Number(e.target.value))}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-[10px] text-slate-700 font-bold focus:outline-none"
                      >
                        <option value={5}>5s</option>
                        <option value={10}>10s</option>
                        <option value={15}>15s</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeleteScene(idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                        title="Delete Scene"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Editable Title */}
                  <input
                    type="text"
                    value={scene.title}
                    onChange={(e) => handleUpdateScene(idx, 'title', e.target.value)}
                    className="w-full bg-transparent border-b border-slate-200 hover:border-slate-400 focus:border-blue-500 text-sm font-bold text-slate-900 focus:outline-none py-0.5 tracking-tight"
                  />

                  {/* Editable Visual Prompt */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block">
                      {t.editPrompt}
                    </label>
                    <textarea
                      value={scene.visualPrompt}
                      onChange={(e) => handleUpdateScene(idx, 'visualPrompt', e.target.value)}
                      rows={3}
                      className="w-full bg-transparent text-[11px] text-slate-800 font-mono resize-none focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Editable Camera Action */}
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-50 px-2 py-1.5 rounded-lg border border-amber-200">
                    <Camera className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <input
                      type="text"
                      value={scene.cameraAction}
                      onChange={(e) => handleUpdateScene(idx, 'cameraAction', e.target.value)}
                      placeholder="Góc máy camera..."
                      className="w-full bg-transparent text-[11px] text-amber-950 font-medium focus:outline-none"
                    />
                  </div>

                  {/* Audio Prompt */}
                  <div className="flex items-center gap-1.5 text-[11px] text-indigo-900 bg-indigo-50 px-2 py-1.5 rounded-lg border border-indigo-200">
                    <Music className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <input
                      type="text"
                      value={scene.audioPrompt || ''}
                      onChange={(e) => handleUpdateScene(idx, 'audioPrompt', e.target.value)}
                      placeholder="Âm thanh / Thiết kế sound FX..."
                      className="w-full bg-transparent text-[11px] text-indigo-950 font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => onGenerateScene(scene)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{t.renderScene}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
