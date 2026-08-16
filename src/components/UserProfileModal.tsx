import React from 'react';
import { 
  X, 
  User, 
  Mail, 
  Zap, 
  ShieldCheck, 
  LogOut, 
  Crown, 
  Calendar, 
  CheckCircle, 
  Layers, 
  ExternalLink,
  Sparkles,
  CloudCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBilling: () => void;
  lang: 'vi' | 'en';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenBilling,
  lang,
}) => {
  const { user, userProfile, logout, isCloudSynced } = useAuth();

  if (!isOpen || !userProfile) return null;

  const t = {
    vi: {
      accountSettings: 'Hồ Sơ Nhà Sáng Tạo',
      planBadge: 'Gói Dịch Vụ',
      cloudSync: 'Đồng bộ Firestore',
      synced: 'Đã kết nối trực tiếp',
      offline: 'Lưu trữ cục bộ',
      creditsLeft: 'Credits Khả Dụng',
      totalGenerated: 'Video Đã Tạo',
      renewalDate: 'Chu kỳ gia hạn tiếp theo',
      upgradeBtn: 'Nâng Cấp Gói / Mua Thêm Credits',
      logoutBtn: 'Đăng Xuất Khỏi Thiết Bị',
      benefitsTitle: 'Quyền lợi tài khoản hiện tại',
      planFeatures: [
        'Kling AI v2.0 Pro & ByteDance Seedance Motion',
        'Tạo video chất lượng cao không gắn watermark',
        'Tải video trực tiếp định dạng MP4 H.264',
        'Bảo lưu tác vụ và kịch bản Storyboard trên đám mây'
      ]
    },
    en: {
      accountSettings: 'Creator Account Profile',
      planBadge: 'Current Plan',
      cloudSync: 'Firestore Cloud Sync',
      synced: 'Live Synchronized',
      offline: 'Local Storage',
      creditsLeft: 'Available Credits',
      totalGenerated: 'Videos Generated',
      renewalDate: 'Next Quota Renewal',
      upgradeBtn: 'Upgrade Plan / Top Up Credits',
      logoutBtn: 'Log Out of Account',
      benefitsTitle: 'Current Plan Benefits',
      planFeatures: [
        'Kling AI v2.0 Pro & ByteDance Seedance Motion',
        'High resolution export without watermark',
        'Direct MP4 H.264 video rendering pipeline',
        'Cloud storage for all tasks and storyboard scripts'
      ]
    }
  }[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0c0c14] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-blue-500/10 overflow-hidden space-y-6">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-profile-modal-btn"
          className="absolute top-5 right-5 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={userProfile.displayName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/50 shadow-lg shadow-blue-500/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl border-2 border-blue-500/40 shadow-lg shadow-blue-500/20">
                {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#0c0c14] flex items-center justify-center" title="Online">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white truncate">
                {userProfile.displayName || 'SaaS Creator'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                {userProfile.planName}
              </span>
            </div>
            <p className="text-xs text-white/50 truncate font-mono mt-0.5">
              {userProfile.email || user?.email}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{isCloudSynced ? t.synced : t.offline}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-black/40 rounded-2xl border border-white/5">
          <div className="p-3 bg-white/5 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block mb-1">
              {t.creditsLeft}
            </span>
            <div className="flex items-center gap-1.5 text-lg font-bold text-blue-400">
              <Zap className="w-4 h-4 fill-blue-400" />
              <span>{userProfile.credits.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block mb-1">
              {t.totalGenerated}
            </span>
            <div className="flex items-center gap-1.5 text-lg font-bold text-purple-400 font-mono">
              <Sparkles className="w-4 h-4" />
              <span>{userProfile.totalGenerated || 0}</span>
            </div>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">
            {t.benefitsTitle}
          </span>
          <div className="space-y-1.5 bg-black/20 p-3 rounded-xl border border-white/5">
            {t.planFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            id="profile-upgrade-btn"
            onClick={() => {
              onClose();
              onOpenBilling();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>{t.upgradeBtn}</span>
          </button>

          <button
            type="button"
            id="profile-logout-btn"
            onClick={async () => {
              await logout();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/60 hover:text-red-400 border border-white/5 hover:border-red-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logoutBtn}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
