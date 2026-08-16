import React, { useState, useEffect } from 'react';
import { 
  ProviderId, 
  VideoTask, 
  UserCredits, 
  ApiGatewayKeys, 
  StoryboardScene,
  VideoProject,
  AspectRatio 
} from './types';
import { PROVIDERS, SAMPLE_VIDEOS } from './data/providers';
import { Header, MainTabType } from './components/Header';
import { VeoStudio } from './components/VeoStudio';
import { VideoStudio } from './components/VideoStudio';
import { StoryboardBuilder } from './components/StoryboardBuilder';
import { RenderQueue } from './components/RenderQueue';
import { VideoLibrary } from './components/VideoLibrary';
import { ApiPlayground } from './components/ApiPlayground';
import { ProjectsManager } from './components/ProjectsManager';
import { ApiSettingsView } from './components/ApiSettingsView';
import { ApiKeysModal } from './components/ApiKeysModal';
import { BillingModal } from './components/BillingModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db, doc, setDoc, collection, onSnapshot, serverTimestamp, handleFirestoreError, OperationType } from './lib/firebase';

function MainApp() {
  const { user, userProfile, deductCredits, addCredits } = useAuth();

  const [activeTab, setActiveTab] = useState<MainTabType>('projects');
  const [activeProvider, setActiveProvider] = useState<ProviderId>('kling');
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  
  // Modals
  const [isApiKeysOpen, setIsApiKeysOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoTask | null>(null);

  // Studio initial parameters loaded from a project or remake
  const [studioInitialPrompt, setStudioInitialPrompt] = useState<string>('');
  const [studioInitialAspectRatio, setStudioInitialAspectRatio] = useState<AspectRatio>('16:9');

  // Fallback / guest user credits
  const [guestCredits, setGuestCredits] = useState<UserCredits>(() => {
    const saved = localStorage.getItem('omnivideo_credits');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      balance: 3200,
      totalGenerated: 14,
      planName: 'Pro Creator',
      monthlyQuota: 5000,
      renewalDate: '2026-09-01',
    };
  });

  const effectiveCredits: UserCredits = userProfile ? {
    balance: userProfile.credits,
    totalGenerated: userProfile.totalGenerated,
    planName: userProfile.planName,
    monthlyQuota: userProfile.monthlyQuota,
    renewalDate: userProfile.renewalDate || '2026-09-01',
  } : guestCredits;

  // API Gateway custom keys
  const [apiKeys, setApiKeys] = useState<ApiGatewayKeys>(() => {
    const saved = localStorage.getItem('omnivideo_apikeys');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      klingApiKey: '',
      seedanceApiKey: '',
      lumaApiKey: '',
      runwayApiKey: '',
      falApiKey: '',
      customWebhookUrl: '',
    };
  });

  // Task list
  const [tasks, setTasks] = useState<VideoTask[]>(() => {
    const saved = localStorage.getItem('omnivideo_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return SAMPLE_VIDEOS as unknown as VideoTask[];
  });

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync tasks with Firestore if user is logged in
  useEffect(() => {
    if (!user) return;

    try {
      const tasksCol = collection(db, 'users', user.uid, 'tasks');
      const unsubscribe = onSnapshot(tasksCol, (snapshot) => {
        if (!snapshot.empty) {
          const remoteTasks: VideoTask[] = [];
          snapshot.forEach(docSnap => {
            remoteTasks.push(docSnap.data() as VideoTask);
          });
          setTasks(prev => {
            const map = new Map<string, VideoTask>(prev.map(t => [t.id, t]));
            remoteTasks.forEach(t => map.set(t.id, { ...(map.get(t.id) || {}), ...t }));
            return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
          });
        }
      }, (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}/tasks`);
        } catch (e) {
          console.warn('Tasks sync error caught:', e);
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore tasks realtime sync warning:', e);
    }
  }, [user]);

  // Sync guest credits to local storage
  useEffect(() => {
    localStorage.setItem('omnivideo_credits', JSON.stringify(guestCredits));
  }, [guestCredits]);

  useEffect(() => {
    localStorage.setItem('omnivideo_apikeys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem('omnivideo_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Polling loop for active tasks
  useEffect(() => {
    const activeTasks = tasks.filter(t => t.status === 'queued' || t.status === 'processing' || t.status === 'rendering');
    if (activeTasks.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/tasks');
        if (!res.ok) return;
        const data = await res.json();
        if (data.tasks && Array.isArray(data.tasks)) {
          setTasks((prev) => {
            const map = new Map<string, VideoTask>(prev.map(t => [t.id, t]));
            data.tasks.forEach((t: VideoTask) => {
              const existing = map.get(t.id);
              map.set(t.id, existing ? { ...existing, ...t } : t);
            });
            return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
          });
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [tasks]);

  // Generate task handler
  const handleGenerate = async (taskPayload: any) => {
    const cost = taskPayload.duration === 15 ? 25 : taskPayload.duration === 10 ? 15 : 10;
    
    // Check credits
    if (effectiveCredits.balance < cost) {
      showToast(lang === 'vi' ? 'Không đủ Credits! Vui lòng nạp thêm.' : 'Insufficient credits! Please top up.');
      setIsBillingOpen(true);
      return;
    }

    setIsGenerating(true);
    try {
      // Deduct credits via AuthContext or Guest
      if (userProfile) {
        await deductCredits(cost);
      } else {
        setGuestCredits(prev => ({
          ...prev,
          balance: Math.max(0, prev.balance - cost),
          totalGenerated: prev.totalGenerated + 1,
        }));
      }

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskPayload,
          customApiKey: taskPayload.provider === 'kling' ? apiKeys.klingApiKey : taskPayload.provider === 'seedance' ? apiKeys.seedanceApiKey : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Khởi tạo video thất bại');
      }

      const data = await res.json();
      if (data.taskId) {
        const newTask: VideoTask = {
          id: data.taskId,
          provider: taskPayload.provider,
          model: taskPayload.model,
          mode: taskPayload.mode,
          prompt: taskPayload.prompt,
          enhancedPrompt: taskPayload.enhancedPrompt,
          negativePrompt: taskPayload.negativePrompt,
          imageUrl: taskPayload.imageUrl,
          lastFrameUrl: taskPayload.lastFrameUrl,
          aspectRatio: taskPayload.aspectRatio,
          resolution: taskPayload.resolution,
          duration: taskPayload.duration,
          fps: taskPayload.fps || 30,
          cfgScale: taskPayload.cfgScale || 7.5,
          motionStrength: taskPayload.motionStrength || 7,
          cameraMovement: taskPayload.cameraMovement,
          seed: taskPayload.seed,
          status: 'queued',
          progress: 10,
          currentStep: 'Khởi tạo tác vụ kết nối cluster AI...',
          createdAt: Date.now(),
          creditsCost: data.creditsCost || cost,
          logs: [`[${new Date().toLocaleTimeString()}] Pipeline started for ${taskPayload.provider.toUpperCase()}`],
        };

        setTasks(prev => [newTask, ...prev]);

        // Save to Firestore if user logged in
        if (user) {
          try {
            const taskRef = doc(db, 'users', user.uid, 'tasks', newTask.id);
            await setDoc(taskRef, {
              ...newTask,
              userId: user.uid,
              syncedAt: serverTimestamp()
            });
          } catch (e) {
            console.warn('Could not sync new task to Firestore:', e);
          }
        }

        showToast(`Đã gửi tác vụ tạo video ${taskPayload.provider.toUpperCase()} vào hàng đợi!`);
        setActiveTab('queue');
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message || 'Không thể tạo video'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Open Studio with project or scene
  const handleOpenStudioWithProject = (project: VideoProject, scene?: StoryboardScene) => {
    setActiveProvider(project.defaultProvider);
    if (scene) {
      setStudioInitialPrompt(scene.visualPrompt);
      setStudioInitialAspectRatio(project.aspectRatio);
      showToast(`Đã nạp ${scene.title} vào Studio!`);
    } else if (project.scenes.length > 0) {
      setStudioInitialPrompt(project.scenes[0].visualPrompt);
      setStudioInitialAspectRatio(project.aspectRatio);
      showToast(`Đã mở dự án "${project.title}" trong Studio!`);
    }
    setActiveTab('studio');
  };

  // Storyboard single scene render
  const handleGenerateScene = (scene: StoryboardScene) => {
    handleGenerate({
      provider: activeProvider,
      model: PROVIDERS.find(p => p.id === activeProvider)?.models[0].id || 'kling-v1-6-pro',
      mode: 'text2video',
      prompt: scene.visualPrompt,
      enhancedPrompt: scene.visualPrompt,
      duration: scene.duration || 5,
      aspectRatio: '16:9',
      resolution: '1080p',
      cameraMovement: { type: 'zoom_in', speed: 6, zoomAmount: 4 },
      seed: Math.floor(Math.random() * 900000 + 100000),
    });
  };

  // Remake existing prompt
  const handleRemake = (task: VideoTask) => {
    setActiveProvider(task.provider);
    setStudioInitialPrompt(task.prompt);
    setStudioInitialAspectRatio(task.aspectRatio);
    setActiveTab('studio');
    showToast('Đã nạp thông số prompt vào Studio!');
  };

  // Plan upgrade
  const handleUpgradePlan = (planName: UserCredits['planName'], addedCredits: number) => {
    if (userProfile) {
      addCredits(addedCredits, planName);
    } else {
      setGuestCredits(prev => ({
        ...prev,
        planName,
        balance: prev.balance + addedCredits,
        monthlyQuota: addedCredits,
      }));
    }
    showToast(`Đã nâng cấp lên gói ${planName} (+${addedCredits.toLocaleString()} Credits)!`);
  };

  const activeTasksCount = tasks.filter(t => t.status === 'processing' || t.status === 'rendering' || t.status === 'queued').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* Light Clean UI Subtle Ambient Background Glows */}
      <div className="fixed top-[-120px] left-[-120px] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-120px] right-[-120px] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/3 w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Top Navbar */}
      <div className="relative z-10">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          credits={effectiveCredits}
          activeProvider={activeProvider}
          setActiveProvider={setActiveProvider}
          onOpenApiKeys={() => setActiveTab('apiconfig')}
          onOpenBilling={() => setIsBillingOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          activeTasksCount={activeTasksCount}
          lang={lang}
          setLang={setLang}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        {activeTab === 'projects' && (
          <ProjectsManager
            onOpenStudioWithProject={handleOpenStudioWithProject}
            onSelectVideo={(t) => {
              setSelectedVideo(t);
              setActiveTab('library');
            }}
            lang={lang}
          />
        )}

        {activeTab === 'veo3' && (
          <VeoStudio
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            lang={lang}
            onOpenProjects={() => setActiveTab('projects')}
          />
        )}

        {activeTab === 'studio' && (
          <VideoStudio
            provider={activeProvider}
            setProvider={setActiveProvider}
            credits={effectiveCredits}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            lang={lang}
            initialPrompt={studioInitialPrompt}
            initialAspectRatio={studioInitialAspectRatio}
          />
        )}

        {activeTab === 'storyboard' && (
          <StoryboardBuilder
            onGenerateScene={handleGenerateScene}
            lang={lang}
          />
        )}

        {activeTab === 'queue' && (
          <RenderQueue
            tasks={tasks}
            onSelectVideo={(t) => {
              setSelectedVideo(t);
              setActiveTab('library');
            }}
            lang={lang}
          />
        )}

        {activeTab === 'library' && (
          <VideoLibrary
            tasks={tasks}
            selectedTask={selectedVideo}
            setSelectedTask={setSelectedVideo}
            onRemake={handleRemake}
            lang={lang}
          />
        )}

        {activeTab === 'apiconfig' && (
          <ApiSettingsView
            keys={apiKeys}
            setKeys={setApiKeys}
            lang={lang}
          />
        )}

        {activeTab === 'playground' && (
          <ApiPlayground lang={lang} />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-xs px-4 py-3 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center gap-2 border border-white/20 animate-fade-in">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <ApiKeysModal
        isOpen={isApiKeysOpen}
        onClose={() => setIsApiKeysOpen(false)}
        keys={apiKeys}
        setKeys={setApiKeys}
        lang={lang}
      />

      <BillingModal
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        credits={effectiveCredits}
        onUpgradePlan={handleUpgradePlan}
        lang={lang}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        lang={lang}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenBilling={() => setIsBillingOpen(true)}
        lang={lang}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
