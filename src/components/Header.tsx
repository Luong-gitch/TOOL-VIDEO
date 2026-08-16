import React from 'react';
import { 
  Sparkles, 
  Key, 
  Code2, 
  CreditCard, 
  Layers, 
  Film, 
  ListTree, 
  Globe,
  Sliders,
  Zap,
  Activity,
  User as UserIcon,
  LogIn,
  FolderKanban
} from 'lucide-react';
import { UserCredits, ProviderId } from '../types';
import { PROVIDERS } from '../data/providers';
import { useAuth } from '../context/AuthContext';

export type MainTabType = 'projects' | 'veo3' | 'studio' | 'storyboard' | 'queue' | 'library' | 'apiconfig' | 'playground';

interface HeaderProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  credits: UserCredits;
  activeProvider: ProviderId;
  setActiveProvider: (id: ProviderId) => void;
  onOpenApiKeys: () => void;
  onOpenBilling: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  activeTasksCount: number;
  lang: 'vi' | 'en';
  setLang: (lang: 'vi' | 'en') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  credits,
  activeProvider,
  setActiveProvider,
  onOpenApiKeys,
  onOpenBilling,
  onOpenAuth,
  onOpenProfile,
  activeTasksCount,
  lang,
  setLang,
}) => {
  const { user, userProfile } = useAuth();
  const currentProvider = PROVIDERS.find(p => p.id === activeProvider) || PROVIDERS[0];

  const t = {
    vi: {
      projects: 'Dự Án Video',
      veo3: 'Veo 3 AI (T2V / I2V)',
      studio: 'Studio Kling/Seedance',
      storyboard: 'Storyboard Script',
      queue: 'Hàng Đợi Render',
      library: 'Thư Viện Video',
      apiconfig: 'Cấu Hình API',
      playground: 'API SaaS Gateway',
      credits: 'Credits',
      upgrade: 'Nâng cấp',
      apiKeys: 'Cấu hình API Keys',
      activeStatus: 'Sẵn sàng',
      login: 'Đăng Nhập / Đăng Ký'
    },
    en: {
      projects: 'Video Projects',
      veo3: 'Veo 3 AI (T2V/I2V)',
      studio: 'Kling/Seedance Studio',
      storyboard: 'Storyboard AI',
      queue: 'Render Queue',
      library: 'Video Library',
      apiconfig: 'API Config',
      playground: 'SaaS API Hub',
      credits: 'Credits',
      upgrade: 'Upgrade',
      apiKeys: 'API Keys Gateway',
      activeStatus: 'Ready',
      login: 'Sign In / Register'
    }
  }[lang];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 lg:px-8 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Provider Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('projects')}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              <div className="w-3.5 h-3.5 bg-white rounded-sm rotate-45 transform"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  OmniVideo
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  SaaS Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-500 tracking-wider font-mono">Seedance, Veo 3 & Kling AI</p>
            </div>
          </div>

          {/* Quick Provider Pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-full p-1">
            {PROVIDERS.slice(0, 4).map((p) => {
              const isSelected = p.id === activeProvider;
              return (
                <button
                  key={p.id}
                  id={`provider-btn-${p.id}`}
                  onClick={() => setActiveProvider(p.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-white text-blue-700 border border-slate-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title={p.description}
                >
                  <span>{p.logo}</span>
                  <span className="truncate max-w-[80px]">{p.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-100/90 rounded-xl border border-slate-200">
          
          <button
            id="tab-btn-projects"
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'projects'
                ? 'bg-white text-amber-800 border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.projects}</span>
          </button>

          <button
            id="tab-btn-veo3"
            onClick={() => setActiveTab('veo3')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'veo3'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <Film className={`w-3.5 h-3.5 ${activeTab === 'veo3' ? 'text-white' : 'text-blue-600'}`} />
            <span>{t.veo3}</span>
            <span className={`text-[9px] px-1 py-0.2 rounded font-mono uppercase font-bold ${
              activeTab === 'veo3' ? 'bg-white/20 text-white' : 'bg-blue-200 text-blue-800'
            }`}>New</span>
          </button>

          <button
            id="tab-btn-studio"
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'studio'
                ? 'bg-white text-blue-700 border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.studio}</span>
          </button>

          <button
            id="tab-btn-storyboard"
            onClick={() => setActiveTab('storyboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'storyboard'
                ? 'bg-white text-purple-700 border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ListTree className="w-3.5 h-3.5 text-purple-600" />
            <span>{t.storyboard}</span>
          </button>

          <button
            id="tab-btn-queue"
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap relative ${
              activeTab === 'queue'
                ? 'bg-white text-emerald-700 border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.queue}</span>
            {activeTasksCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                {activeTasksCount}
              </span>
            )}
          </button>

          <button
            id="tab-btn-library"
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'library'
                ? 'bg-white text-indigo-700 border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.library}</span>
          </button>

          <button
            id="tab-btn-apiconfig"
            onClick={() => setActiveTab('apiconfig')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'apiconfig'
                ? 'bg-white text-blue-700 border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.apiconfig}</span>
          </button>

          <button
            id="tab-btn-playground"
            onClick={() => setActiveTab('playground')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'playground'
                ? 'bg-white text-amber-700 border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.playground}</span>
          </button>
        </nav>

        {/* Right Actions: API Keys, Credits & Language */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Status Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{t.activeStatus}</span>
          </div>

          {/* Language Toggle */}
          <button
            id="lang-toggle-btn"
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Đổi ngôn ngữ / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'vi' ? '🇻🇳 VN' : '🇺🇸 EN'}</span>
          </button>

          {/* API Keys Button */}
          <button
            id="api-keys-btn"
            onClick={() => setActiveTab('apiconfig')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
            title="Cấu hình & Test API Keys Kling, Seedance, Luma"
          >
            <Key className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Cấu Hình API</span>
          </button>

          {/* Credits & Plan Pill */}
          <button
            id="billing-modal-btn"
            onClick={onOpenBilling}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-xs text-slate-800 transition-all shadow-xs group hover:bg-slate-50"
          >
            <div className="flex items-center gap-1.5 text-slate-800">
              <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
              <span className="font-bold text-blue-700">{(userProfile?.credits ?? credits.balance).toLocaleString()}</span>
            </div>
            <span className="text-slate-400 text-[10px] hidden lg:inline font-medium">| {userProfile?.planName ?? credits.planName}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-bold border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              +
            </span>
          </button>

          {/* User Account / Google Sign-In Trigger */}
          {user ? (
            <button
              id="header-user-profile-btn"
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-all group shadow-xs"
              title="Xem hồ sơ & tài khoản"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={userProfile?.displayName || 'User'}
                  className="w-6 h-6 rounded-lg object-cover border border-blue-400"
                />
              ) : (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center">
                  {(userProfile?.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-bold text-slate-800 max-w-[90px] truncate hidden sm:inline">
                {userProfile?.displayName || user.displayName || 'Creator'}
              </span>
            </button>
          ) : (
            <button
              id="header-login-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-105 text-white font-bold text-xs transition-all shadow-sm shadow-blue-500/20 active:scale-95 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.login}</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
