import React from 'react';
import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Terminal, 
  Download, 
  Play, 
  ExternalLink,
  Film,
  Zap,
  RotateCcw
} from 'lucide-react';
import { VideoTask } from '../types';

interface RenderQueueProps {
  tasks: VideoTask[];
  onSelectVideo: (task: VideoTask) => void;
  lang: 'vi' | 'en';
}

export const RenderQueue: React.FC<RenderQueueProps> = ({
  tasks,
  onSelectVideo,
  lang,
}) => {
  const t = {
    vi: {
      title: 'Hàng Đợi Render & Tác Vụ GPU Cluster',
      subtitle: 'Theo dõi tiến trình sinh video trực tiếp trên cụm máy chủ Kling & Seedance AI',
      empty: 'Chưa có tác vụ nào trong hàng đợi. Hãy tạo video mới trong Studio!',
      queued: 'Chờ xử lý',
      processing: 'Đang khởi tạo',
      rendering: 'Đang khuếch tán (Rendering)',
      completed: 'Hoàn tất',
      failed: 'Thất bại',
      preview: 'Xem video',
      download: 'Tải MP4',
      logs: 'Nhật ký Cluster',
      tasksCount: 'Tác vụ'
    },
    en: {
      title: 'Active Render Queue & Cluster Workloads',
      subtitle: 'Monitor real-time video generation pipelines on Kling & Seedance GPU clusters',
      empty: 'No tasks in the render queue. Create a new video in the Studio!',
      queued: 'Queued',
      processing: 'Initializing',
      rendering: 'Diffusion Rendering',
      completed: 'Completed',
      failed: 'Failed',
      preview: 'Preview Video',
      download: 'Download MP4',
      logs: 'Cluster Logs',
      tasksCount: 'Tasks'
    }
  }[lang];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{t.title}</h2>
            <p className="text-xs text-slate-500">{t.subtitle}</p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold">
          {tasks.length} {t.tasksCount}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <Film className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm text-slate-500">{t.empty}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isFinished = task.status === 'completed';
            const isRunning = task.status === 'processing' || task.status === 'rendering' || task.status === 'queued';

            return (
              <div
                key={task.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 transition-all hover:border-slate-300 shadow-xs"
              >
                {/* Task Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      {task.provider.toUpperCase()} • {task.model}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(task.createdAt).toLocaleTimeString()}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {task.aspectRatio} | {task.duration}s | {task.resolution}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-700 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-blue-600 text-blue-600" />
                      {task.creditsCost} Credits
                    </span>

                    {task.status === 'completed' && (
                      <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {t.completed}
                      </span>
                    )}

                    {isRunning && (
                      <span className="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-300 font-bold">
                        <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                        {task.status === 'rendering' ? t.rendering : t.processing} ({task.progress}%)
                      </span>
                    )}

                    {task.status === 'failed' && (
                      <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-300 font-bold">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        {t.failed}
                      </span>
                    )}
                  </div>
                </div>

                {/* Prompt Details */}
                <div>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {task.enhancedPrompt || task.prompt}
                  </p>
                </div>

                {/* Progress Bar (if in progress) */}
                {isRunning && (
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                        {task.currentStep || 'Đang tính toán khung hình...'}
                      </span>
                      <span className="font-mono text-blue-700 font-bold">{task.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.max(task.progress, 5)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Logs Terminal */}
                {task.logs && task.logs.length > 0 && (
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1 font-mono text-[10px] text-slate-300 max-h-24 overflow-y-auto">
                    {task.logs.map((log, lIdx) => (
                      <div key={lIdx} className="flex items-center gap-2">
                        <Terminal className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                        <span className="truncate">{log}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Task Actions */}
                {isFinished && task.videoUrl && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Hoàn thành lúc {task.completedAt ? new Date(task.completedAt).toLocaleTimeString() : ''}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectVideo(task)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{t.preview}</span>
                      </button>

                      <a
                        href={task.videoUrl}
                        download={`omnivideo_${task.id}.mp4`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition-all"
                      >
                        <Download className="w-3 h-3 text-slate-600" />
                        <span>{t.download}</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
