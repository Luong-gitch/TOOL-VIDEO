import React, { useState } from 'react';
import { 
  Film, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  RotateCcw, 
  Sliders, 
  Maximize2, 
  X, 
  Clock, 
  Zap, 
  Filter, 
  Search,
  CheckCircle2
} from 'lucide-react';
import { VideoTask, ProviderId } from '../types';
import { SAMPLE_VIDEOS, PROVIDERS } from '../data/providers';

interface VideoLibraryProps {
  tasks: VideoTask[];
  selectedTask: VideoTask | null;
  setSelectedTask: (task: VideoTask | null) => void;
  onRemake: (task: VideoTask) => void;
  lang: 'vi' | 'en';
}

export const VideoLibrary: React.FC<VideoLibraryProps> = ({
  tasks,
  selectedTask,
  setSelectedTask,
  onRemake,
  lang,
}) => {
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [colorFilter, setColorFilter] = useState<'normal' | 'cyberpunk' | 'warm_cinema' | 'noir' | 'teal_orange'>('normal');
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Combine user tasks with high-quality sample showcase
  const completedUserTasks = tasks.filter(t => t.status === 'completed' && t.videoUrl);
  const allLibraryItems = [...completedUserTasks, ...SAMPLE_VIDEOS];

  const filteredItems = allLibraryItems.filter(item => {
    const matchProvider = filterProvider === 'all' || item.provider === filterProvider;
    const matchSearch = !searchQuery.trim() || 
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.enhancedPrompt && item.enhancedPrompt.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchProvider && matchSearch;
  });

  const t = {
    vi: {
      title: 'Thư Viện Video & Studio Trình Phát',
      subtitle: 'Xem lại, chỉnh tốc độ phát, áp dụng bộ lọc màu điện ảnh và xuất khẩu video.',
      searchPlaceholder: 'Tìm kiếm theo từ khóa prompt...',
      allProviders: 'Tất cả nền tảng',
      remake: 'Tái tạo (Remake Prompt)',
      download: 'Tải MP4',
      copyPrompt: 'Sao chép Prompt',
      copied: 'Đã sao chép!',
      filterPreset: 'Bộ Lọc Màu (Color Grading FX):',
      speed: 'Tốc độ phát:',
      empty: 'Không tìm thấy video nào phù hợp với bộ lọc.'
    },
    en: {
      title: 'Video Library & Player Studio',
      subtitle: 'Review, scrub frame-by-frame, apply cinematic color filters, and export video.',
      searchPlaceholder: 'Search prompts or styles...',
      allProviders: 'All Providers',
      remake: 'Remake Prompt',
      download: 'Download MP4',
      copyPrompt: 'Copy Prompt',
      copied: 'Copied!',
      filterPreset: 'Cinematic FX Color Filter:',
      speed: 'Playback Speed:',
      empty: 'No videos found matching your filters.'
    }
  }[lang];

  const copyPromptText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const getFilterStyle = () => {
    switch (colorFilter) {
      case 'cyberpunk':
        return 'contrast(125%) saturate(140%) hue-rotate(15deg)';
      case 'warm_cinema':
        return 'sepia(25%) contrast(110%) saturate(120%)';
      case 'noir':
        return 'grayscale(100%) contrast(140%)';
      case 'teal_orange':
        return 'contrast(120%) saturate(130%) hue-rotate(-10deg)';
      default:
        return 'none';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="library-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* Provider Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterProvider('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              filterProvider === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
          >
            {t.allProviders}
          </button>
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setFilterProvider(p.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                filterProvider === p.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
            >
              <span>{p.logo}</span>
              <span>{p.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-sm shadow-xs">
          {t.empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 hover:border-blue-500 rounded-2xl overflow-hidden group transition-all duration-200 hover:shadow-md flex flex-col justify-between"
            >
              <div
                className="relative aspect-video bg-slate-900 cursor-pointer overflow-hidden"
                onClick={() => setSelectedTask(item as any)}
              >
                <img
                  src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800'}
                  alt={item.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-70 group-hover:opacity-85 transition-opacity" />
                
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="bg-black/70 backdrop-blur-md text-[10px] text-white font-bold px-2 py-0.5 rounded-full border border-white/20 uppercase">
                    {item.provider}
                  </span>
                  <span className="bg-black/70 backdrop-blur-md text-[10px] text-blue-300 font-mono font-bold px-2 py-0.5 rounded-full border border-white/20">
                    {item.resolution}
                  </span>
                </div>

                <div className="absolute top-2 right-2">
                  <span className="bg-black/70 backdrop-blur-md text-[10px] text-white font-mono font-bold px-2 py-0.5 rounded-full border border-white/20">
                    {item.duration}s
                  </span>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white translate-x-0.5" />
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-800 font-semibold line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500 font-mono font-medium">
                    Seed: {item.seed}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onRemake(item as any)}
                      className="text-[11px] text-slate-600 hover:text-blue-600 font-bold flex items-center gap-1 transition-colors"
                      title="Load prompt into Studio"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Remake</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTask(item as any)}
                      className="text-xs px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all border border-slate-200"
                    >
                      Chi Tiết
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Video Modal Player with Color Grading & Controls */}
      {selectedTask && selectedTask.videoUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold uppercase border border-blue-200">
                  {selectedTask.provider} • {selectedTask.model}
                </span>
                <span className="text-xs text-slate-600 font-mono font-medium">
                  {selectedTask.aspectRatio} • {selectedTask.resolution} • {selectedTask.duration}s
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative bg-slate-950 flex items-center justify-center px-4 flex-1 min-h-[320px]">
              <video
                src={selectedTask.videoUrl}
                controls
                autoPlay
                loop
                style={{ filter: getFilterStyle() }}
                className="max-h-[50vh] w-auto max-w-full rounded-2xl shadow-lg border border-white/10"
              />
            </div>

            {/* Video Studio Controls & Actions */}
            <div className="p-5 space-y-4 bg-slate-50 overflow-y-auto border-t border-slate-200">
              
              {/* Color FX and Speed */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-700">{t.filterPreset}</span>
                  <div className="flex items-center gap-1">
                    {(['normal', 'cyberpunk', 'warm_cinema', 'noir', 'teal_orange'] as const).map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setColorFilter(f)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                          colorFilter === f
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {f === 'normal' ? 'Gốc' : f === 'cyberpunk' ? 'Cyberpunk' : f === 'warm_cinema' ? '35mm Gold' : f === 'noir' ? 'Noir' : 'Teal Orange'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">{t.speed}</span>
                  {[0.5, 1, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => setPlaybackRate(speed)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${
                        playbackRate === speed
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Text Display & Copy */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Prompt Chi Tiết:</span>
                  <button
                    type="button"
                    onClick={() => copyPromptText(selectedTask.enhancedPrompt || selectedTask.prompt)}
                    className="flex items-center gap-1 text-[11px] text-blue-600 font-bold hover:underline"
                  >
                    {copiedPrompt ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPrompt ? t.copied : t.copyPrompt}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 font-mono leading-relaxed">
                  {selectedTask.enhancedPrompt || selectedTask.prompt}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onRemake(selectedTask);
                    setSelectedTask(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.remake}</span>
                </button>

                <a
                  href={selectedTask.videoUrl}
                  download={`omnivideo_${selectedTask.id}.mp4`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-105 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.download}</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
