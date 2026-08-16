import React, { useState } from 'react';
import { Sparkles, Wand2, RefreshCw, Copy, Check, Info, ShieldAlert } from 'lucide-react';
import { STYLE_PRESETS } from '../data/providers';
import { ProviderId, CameraMovement } from '../types';

interface PromptCopilotProps {
  prompt: string;
  setPrompt: (val: string) => void;
  enhancedPrompt: string;
  setEnhancedPrompt: (val: string) => void;
  negativePrompt: string;
  setNegativePrompt: (val: string) => void;
  provider: ProviderId;
  cameraMovement: CameraMovement;
  duration: number;
  mode: string;
  lang: 'vi' | 'en';
}

export const PromptCopilot: React.FC<PromptCopilotProps> = ({
  prompt,
  setPrompt,
  enhancedPrompt,
  setEnhancedPrompt,
  negativePrompt,
  setNegativePrompt,
  provider,
  cameraMovement,
  duration,
  mode,
  lang,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [directorAdvice, setDirectorAdvice] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const t = {
    vi: {
      title: 'AI Prompt Copilot (Gemini 3.7 Flash)',
      enhanceBtn: 'Mở rộng Prompt Điện Ảnh',
      enhancing: 'Đang tối ưu hóa với Gemini...',
      styles: 'Phong cách nghệ thuật & Ánh sáng:',
      directorNote: 'Lời khuyên đạo diễn AI:',
      negativeTitle: 'Negative Prompt (Ngăn biến dạng):',
      placeholder: 'Ví dụ: Một phi hành gia lướt ván qua các vành đai sao Thổ trong cơn bão bụi lấp lánh ánh kim...',
      useThis: 'Dùng prompt này',
      copy: 'Sao chép'
    },
    en: {
      title: 'AI Prompt Copilot (Gemini 3.7 Flash)',
      enhanceBtn: 'Magic Enhance Prompt',
      enhancing: 'Optimizing with Gemini AI...',
      styles: 'Visual Style & Lighting Presets:',
      directorNote: 'AI Director Insights:',
      negativeTitle: 'Negative Prompt (Avoid Artifacts):',
      placeholder: 'e.g. An astronaut surfing through Saturn rings during a sparkling stardust storm...',
      useThis: 'Use this prompt',
      copy: 'Copy'
    }
  }[lang];

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/gemini/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPrompt: prompt,
          provider,
          style: selectedStyle,
          cameraMovement,
          duration,
          mode,
        }),
      });

      if (!res.ok) throw new Error('Enhancement failed');
      const data = await res.json();
      if (data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt);
      }
      if (data.negativePrompt) {
        setNegativePrompt(data.negativePrompt);
      }
      if (data.cameraDirectorAdvice) {
        setDirectorAdvice(data.cameraDirectorAdvice);
      }
    } catch (err) {
      console.error('Enhancement error:', err);
      // Fallback
      const styleObj = STYLE_PRESETS.find(s => s.id === selectedStyle);
      const fallback = `${prompt}${styleObj ? styleObj.promptSuffix : ', 8k cinematic lighting, photorealistic'}`;
      setEnhancedPrompt(fallback);
    } finally {
      setIsEnhancing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-800 uppercase tracking-widest block flex items-center gap-2">
          <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>{t.title}</span>
        </label>
      </div>

      {/* Style Chips */}
      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
          {t.styles}
        </label>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STYLE_PRESETS.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                id={`style-btn-${style.id}`}
                onClick={() => setSelectedStyle(style.id)}
                className={`text-xs px-3 py-1 rounded-full border font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {style.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Raw Prompt Input with Enhance Button */}
      <div className="relative">
        <textarea
          id="raw-prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t.placeholder}
          rows={3}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white resize-none transition-all"
        />

        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-slate-500 font-mono">
            {prompt.length} ký tự
          </span>

          <button
            type="button"
            id="enhance-prompt-btn"
            disabled={isEnhancing || !prompt.trim()}
            onClick={handleEnhance}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-105 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isEnhancing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{t.enhancing}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>{t.enhanceBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Enhanced Prompt Display (if available) */}
      {enhancedPrompt && (
        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
              <Wand2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Prompt Chuyên Nghiệp ({provider.toUpperCase()} Tuned)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(enhancedPrompt)}
                className="text-[11px] text-slate-700 hover:text-slate-900 flex items-center gap-1.5 bg-white border border-slate-300 px-2.5 py-1 rounded-lg transition-colors font-medium shadow-xs"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Đã chép' : t.copy}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-900 leading-relaxed font-mono bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
            {enhancedPrompt}
          </p>

          {directorAdvice && (
            <div className="flex items-start gap-2 text-[11px] text-blue-900 bg-white border border-blue-200 p-2.5 rounded-lg">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-600" />
              <span><strong>{t.directorNote}</strong> {directorAdvice}</span>
            </div>
          )}
        </div>
      )}

      {/* Negative Prompt Collapsible */}
      <div className="pt-1">
        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
          <span>{t.negativeTitle}</span>
        </label>
        <input
          type="text"
          id="negative-prompt-input"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder="blurry, distorted, bad anatomy, jittery frames, morphing..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
        />
      </div>
    </div>
  );
};
