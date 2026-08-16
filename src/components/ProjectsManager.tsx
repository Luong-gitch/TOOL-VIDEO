import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Play, 
  Trash2, 
  Film, 
  Sparkles, 
  Clock, 
  Layers, 
  Share2, 
  Copy, 
  Check, 
  ArrowRight, 
  ChevronRight, 
  Eye, 
  Sliders, 
  ExternalLink,
  Zap,
  Tag,
  CheckCircle2,
  FolderOpen,
  Edit3,
  ListTree
} from 'lucide-react';
import { VideoProject, VideoTask, StoryboardScene, ProviderId, AspectRatio } from '../types';
import { PROVIDERS, SAMPLE_VIDEOS } from '../data/providers';
import { db, doc, setDoc, deleteDoc, collection, onSnapshot, serverTimestamp, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface ProjectsManagerProps {
  onOpenStudioWithProject: (project: VideoProject, scene?: StoryboardScene) => void;
  onSelectVideo: (task: VideoTask) => void;
  lang: 'vi' | 'en';
}

const DEFAULT_PROJECTS: VideoProject[] = [
  {
    id: 'proj_cyberpunk_cinema_01',
    title: 'Phim Ngắn: Cyberpunk City 2088',
    description: 'Dự án trailer điện ảnh khoa học viễn tưởng với những cảnh rượt đuổi mô tô ánh sáng và thành phố đêm mưa neon.',
    category: 'film_trailer',
    aspectRatio: '16:9',
    defaultProvider: 'kling',
    status: 'in_progress',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000 * 4,
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
    scenes: [
      {
        sceneNumber: 1,
        title: 'Toàn cảnh thành phố Neon',
        description: 'Drone lướt qua các tòa nhà chọc trời phản chiếu ánh sáng ba chiều.',
        visualPrompt: 'Cinematic wide establishing shot of Neo Tokyo in 2088, towering holographic billboards, flying spinners in rain, neon blue and magenta reflections, 8k resolution, 35mm anamorphic.',
        cameraAction: 'Dolly forward slow tilt down',
        duration: 5,
        audioPrompt: 'Cyberpunk ambient synth with deep atmospheric drone',
      },
      {
        sceneNumber: 2,
        title: 'Nhân vật chính xuất hiện',
        description: 'Cận cảnh chiến binh cyborg trên xe môtô phát quang.',
        visualPrompt: 'Medium tracking shot of a futuristic cyber warrior in glowing carbon suit riding a high-speed light motorcycle on wet asphalt, glowing purple headlights, speed trails.',
        cameraAction: 'Side tracking shot matching high speed',
        duration: 5,
        audioPrompt: 'Heavy electronic bassline with revving electric motor',
      },
      {
        sceneNumber: 3,
        title: 'Kích hoạt cổng lượng tử',
        description: 'Vụ nổ ánh sáng xé toạc bầu trời.',
        visualPrompt: 'Dynamic camera orbit: Portal opening in the sky with chromatic aberration and lightning shockwave, high detail volumetric lighting.',
        cameraAction: 'Fast 360 orbit around sky vortex',
        duration: 10,
        audioPrompt: 'Sub-bass impact explosion and rising orchestral strings',
      },
    ],
    clips: [SAMPLE_VIDEOS[0] as unknown as VideoTask, SAMPLE_VIDEOS[1] as unknown as VideoTask],
  },
  {
    id: 'proj_commercial_perfume_02',
    title: 'TVC Quảng Cáo: Nước Hoa Tinh Thể Aura',
    description: 'Chiến dịch video quảng cáo thương mại sang trọng cho sản phẩm nước hoa cao cấp định dạng TikTok Shorts & Reels.',
    category: 'commercial',
    aspectRatio: '9:16',
    defaultProvider: 'seedance',
    status: 'completed',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 3600000 * 12,
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    scenes: [
      {
        sceneNumber: 1,
        title: 'Giọt sương pha lê',
        description: 'Cận cảnh chai nước hoa pha lê tỏa sáng với những giọt nước vàng óng.',
        visualPrompt: 'Extreme macro slow motion: Golden luxury perfume bottle with geometric crystal facets standing on liquid obsidian, water droplets splashing in golden hour backlight, hyper-detailed, Vogue style.',
        cameraAction: 'Ultra slow zoom in with shallow depth of field',
        duration: 5,
        audioPrompt: 'Elegant crystal chime with soft luxury ambient piano',
      },
      {
        sceneNumber: 2,
        title: 'Vũ điệu lụa và hoa',
        description: 'Dải lụa mềm bay lượn cùng những cánh hoa hồng phát quang.',
        visualPrompt: 'Cinematic 9:16 vertical shot: Floating silk fabric dancing gracefully around blooming golden roses, shimmering particle dust, studio lighting, 60fps fluid motion.',
        cameraAction: 'Slow upward pedestal movement',
        duration: 5,
        audioPrompt: 'Airy cinematic strings and ambient harp',
      },
    ],
    clips: [SAMPLE_VIDEOS[2] as unknown as VideoTask],
  },
  {
    id: 'proj_music_video_space_03',
    title: 'Music Video: Neon Odyssey',
    description: 'Hành trình xuyên không gian giữa các thiên hà và hố đen vũ trụ với phong cách thị giác IMAX.',
    category: 'music_video',
    aspectRatio: '21:9',
    defaultProvider: 'runway',
    status: 'draft',
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 86400000 * 1,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
    scenes: [
      {
        sceneNumber: 1,
        title: 'Vượt qua vành đai sao Thổ',
        description: 'Phi thuyền lướt sát những tảng băng phát sáng.',
        visualPrompt: 'IMAX 21:9 wide aspect ratio: Spaceship gliding through shimmering ice rings of Saturn, deep cosmos backdrop with radiant nebula, photorealistic Unreal Engine 5 render.',
        cameraAction: 'Slow barrel roll alongside spaceship wing',
        duration: 10,
        audioPrompt: 'Epic space synth symphony inspired by Interstellar',
      },
    ],
    clips: [SAMPLE_VIDEOS[3] as unknown as VideoTask],
  },
];

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  onOpenStudioWithProject,
  onSelectVideo,
  lang,
}) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<VideoProject[]>(() => {
    const saved = localStorage.getItem('omnivideo_projects');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_PROJECTS;
  });

  const [activeProject, setActiveProject] = useState<VideoProject | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // New Project Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<VideoProject['category']>('film_trailer');
  const [newAspect, setNewAspect] = useState<AspectRatio>('16:9');
  const [newProvider, setNewProvider] = useState<ProviderId>('kling');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('omnivideo_projects', JSON.stringify(projects));
  }, [projects]);

  // Sync to Firestore if user logged in
  useEffect(() => {
    if (!user) return;
    try {
      const projCol = collection(db, 'users', user.uid, 'projects');
      const unsubscribe = onSnapshot(projCol, (snap) => {
        if (!snap.empty) {
          const remoteProjects: VideoProject[] = [];
          snap.forEach(d => remoteProjects.push(d.data() as VideoProject));
          setProjects(prev => {
            const map = new Map<string, VideoProject>(prev.map(p => [p.id, p]));
            remoteProjects.forEach(p => map.set(p.id, { ...(map.get(p.id) || {}), ...p }));
            return Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
          });
        }
      }, (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}/projects`);
        } catch (e) {
          console.warn('Projects sync error caught:', e);
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore projects sync warning:', e);
    }
  }, [user]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProj: VideoProject = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: newTitle,
      description: newDesc || 'Dự án video AI với kịch bản đa phân cảnh và hiệu ứng camera.',
      category: newCategory,
      aspectRatio: newAspect,
      defaultProvider: newProvider,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
      scenes: [
        {
          sceneNumber: 1,
          title: 'Cảnh 1: Khởi Đầu Dự Án',
          description: 'Mô tả bối cảnh mở màn của câu chuyện.',
          visualPrompt: `Cinematic wide shot establishing scene for ${newTitle}, volumetric lighting, photorealistic 8k.`,
          cameraAction: 'Dolly forward slow zoom',
          duration: 5,
          audioPrompt: 'Atmospheric cinematic intro score',
        }
      ],
      clips: [],
    };

    setProjects(prev => [newProj, ...prev]);
    setIsCreatingProject(false);
    setNewTitle('');
    setNewDesc('');
    setActiveProject(newProj);

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'projects', newProj.id), {
          ...newProj,
          userId: user.uid,
          syncedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('Could not save project to Firestore:', err);
      }
    }
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(lang === 'vi' ? 'Bạn có chắc chắn muốn xóa dự án này?' : 'Are you sure you want to delete this project?')) return;

    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (activeProject?.id === projectId) {
      setActiveProject(null);
    }

    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'projects', projectId));
      } catch (err) {
        console.warn('Could not delete from Firestore:', err);
      }
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    const matchQuery = !searchQuery.trim() || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const t = {
    vi: {
      title: 'Trung Tâm Quản Lý Dự Án Video (Projects Workspace)',
      subtitle: 'Quản lý toàn bộ kịch bản, shot list, dòng thời gian timeline và tài nguyên render của từng dự án.',
      createBtn: '+ Tạo Dự Án Mới',
      searchPlaceholder: 'Tìm kiếm tên dự án hoặc nội dung...',
      allCategories: 'Tất Cả Thể Loại',
      catFilm: 'Phim & Trailer',
      catCommercial: 'TVC Thương Mại',
      catShorts: 'Social Shorts / TikTok',
      catMusic: 'Music Video',
      catAnime: 'Anime & 3D',
      openWorkspace: 'Mở Dự Án & Timeline',
      delete: 'Xóa',
      scenesCount: 'Phân cảnh',
      clipsCount: 'Clips Render',
      backToList: '← Quay lại danh sách dự án',
      projectTimeline: 'Dòng Thời Gian & Phân Cảnh (Timeline & Shots)',
      renderInStudio: 'Render Cảnh Này Trong Studio',
      addScene: '+ Thêm Phân Cảnh Mới',
      createModalTitle: 'Khởi Tạo Dự Án Video Mới',
      projTitleLabel: 'Tên Dự Án:',
      projDescLabel: 'Mô Tả Dự Án / Ý Tưởng:',
      categoryLabel: 'Thể Loại Dự Án:',
      aspectLabel: 'Tỷ Lệ Khung Hình:',
      providerLabel: 'Nền Tảng AI Mặc Định:',
      cancel: 'Hủy',
      confirmCreate: 'Tạo & Bắt Đầu Dự Án'
    },
    en: {
      title: 'Video Projects Workspace & Production Hub',
      subtitle: 'Manage multi-shot sequences, storyboards, timelines, and rendered video assets per project.',
      createBtn: '+ Create New Project',
      searchPlaceholder: 'Search projects by title or content...',
      allCategories: 'All Categories',
      catFilm: 'Film & Trailer',
      catCommercial: 'Commercial TVC',
      catShorts: 'Social Shorts / TikTok',
      catMusic: 'Music Video',
      catAnime: 'Anime & 3D',
      openWorkspace: 'Open Project & Timeline',
      delete: 'Delete',
      scenesCount: 'Scenes',
      clipsCount: 'Clips',
      backToList: '← Back to Projects List',
      projectTimeline: 'Project Timeline & Storyboard Shots',
      renderInStudio: 'Render Shot in Studio',
      addScene: '+ Add New Scene',
      createModalTitle: 'Create New Video Project',
      projTitleLabel: 'Project Title:',
      projDescLabel: 'Description / Story Concept:',
      categoryLabel: 'Project Category:',
      aspectLabel: 'Aspect Ratio:',
      providerLabel: 'Default AI Provider:',
      cancel: 'Cancel',
      confirmCreate: 'Create & Open Project'
    }
  }[lang];

  return (
    <div className="space-y-6">
      
      {/* If a Project is selected, show the Project Workspace View */}
      {activeProject ? (
        <div className="space-y-6 animate-fade-in">
          
          {/* Project Workspace Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <button
                type="button"
                id="back-to-projects-list-btn"
                onClick={() => setActiveProject(null)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
              >
                <span>{t.backToList}</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold uppercase border border-blue-200">
                  {activeProject.defaultProvider.toUpperCase()}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                  {activeProject.aspectRatio}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                  activeProject.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {activeProject.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <FolderOpen className="w-6 h-6 text-amber-600" />
                  <span>{activeProject.title}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                  {activeProject.description}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  id="project-open-studio-btn"
                  onClick={() => onOpenStudioWithProject(activeProject)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-105 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mở Trực Tiếp Trong Studio</span>
                </button>
              </div>
            </div>

          </div>

          {/* Project Timeline & Shot List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-4 bg-amber-600 rounded-full"></span>
                <ListTree className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {t.projectTimeline} ({activeProject.scenes.length} {t.scenesCount})
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  const newScene: StoryboardScene = {
                    sceneNumber: activeProject.scenes.length + 1,
                    title: `Cảnh ${activeProject.scenes.length + 1}: Chuyển cảnh tiếp diễn`,
                    description: 'Mô tả diễn biến tiếp theo của kịch bản.',
                    visualPrompt: 'Cinematic continuation shot, 8k resolution, smooth motion.',
                    cameraAction: 'Slow pan right',
                    duration: 5,
                  };
                  const updated = { ...activeProject, scenes: [...activeProject.scenes, newScene], updatedAt: Date.now() };
                  setActiveProject(updated);
                  setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 transition-all font-bold"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.addScene}</span>
              </button>
            </div>

            {/* Scenes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProject.scenes.map((scene, sIdx) => (
                <div
                  key={sIdx}
                  className="bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-2xl p-4.5 space-y-3 flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono font-bold border border-amber-300">
                        Shot #{scene.sceneNumber} • {scene.duration}s
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono font-bold">
                        {activeProject.aspectRatio}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">{scene.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{scene.description}</p>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block">Prompt:</span>
                      <p className="text-[11px] text-slate-800 font-mono line-clamp-3 leading-relaxed">
                        {scene.visualPrompt}
                      </p>
                    </div>

                    <div className="text-[11px] text-amber-900 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1.5 font-medium">
                      <Sliders className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">{scene.cameraAction}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onOpenStudioWithProject(activeProject, scene)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{t.renderInStudio}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      ) : (
        /* Project Hub List View */
        <div className="space-y-6 animate-fade-in">
          
          {/* Top Header & New Project Button */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="w-1.5 h-4 bg-amber-600 rounded-full"></span>
                <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{t.title}</h2>
              </div>
              <p className="text-xs text-slate-500">{t.subtitle}</p>
            </div>

            <button
              type="button"
              id="create-new-project-btn"
              onClick={() => setIsCreatingProject(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-600 hover:brightness-105 text-white font-bold text-xs shadow-xs active:scale-95 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{t.createBtn}</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="w-full sm:w-80">
              <input
                type="text"
                id="search-projects-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {[
                { id: 'all', label: t.allCategories },
                { id: 'film_trailer', label: t.catFilm },
                { id: 'commercial', label: t.catCommercial },
                { id: 'social_shorts', label: t.catShorts },
                { id: 'music_video', label: t.catMusic },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    filterCategory === cat.id
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setActiveProject(project)}
                className="bg-white border border-slate-200 hover:border-amber-500 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-md flex flex-col justify-between"
              >
                {/* Card Top Banner / Thumbnail */}
                <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                  <img
                    src={project.thumbnailUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800'}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-black/80 backdrop-blur-md text-[10px] text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase">
                      {project.defaultProvider}
                    </span>
                    <span className="bg-black/80 backdrop-blur-md text-[10px] text-white font-mono font-bold px-2 py-0.5 rounded-full border border-white/20">
                      {project.aspectRatio}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white backdrop-blur-md transition-colors"
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors tracking-tight line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px] font-medium">
                      <span>{project.scenes.length} {t.scenesCount}</span>
                      <span>•</span>
                      <span>{project.clips.length} {t.clipsCount}</span>
                    </div>

                    <span className="text-amber-600 font-bold flex items-center gap-1 text-xs group-hover:translate-x-1 transition-transform">
                      <span>{t.openWorkspace}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* Create Project Modal */}
      {isCreatingProject && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-amber-600" />
                <span>{t.createModalTitle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingProject(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">{t.projTitleLabel}</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Phim Ngắn Cyberpunk 2088..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">{t.projDescLabel}</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Mô tả ngắn gọn về cốt truyện hoặc phong cách hình ảnh..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 resize-none focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">{t.categoryLabel}</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value="film_trailer">Phim / Trailer</option>
                    <option value="commercial">TVC Quảng Cáo</option>
                    <option value="social_shorts">TikTok / Shorts</option>
                    <option value="music_video">Music Video</option>
                    <option value="anime">Anime & 3D</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">{t.aspectLabel}</label>
                  <select
                    value={newAspect}
                    onChange={(e) => setNewAspect(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value="16:9">16:9 (Ngang Cinema)</option>
                    <option value="9:16">9:16 (Dọc TikTok/Reels)</option>
                    <option value="1:1">1:1 (Vuông Instagram)</option>
                    <option value="21:9">21:9 (UltraWide IMAX)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">{t.providerLabel}</label>
                <select
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                >
                  <option value="kling">Kling AI (Kuaishou)</option>
                  <option value="seedance">Seedance AI (ByteDance)</option>
                  <option value="luma">Luma Dream Machine (Ray 2)</option>
                  <option value="runway">Runway Gen-3 Alpha</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingProject(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 transition-all font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:brightness-105 text-white font-bold text-xs shadow-xs transition-all"
                >
                  {t.confirmCreate}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
