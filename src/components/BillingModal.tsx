import React from 'react';
import { 
  X, 
  Zap, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Crown, 
  Layers, 
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { UserCredits } from '../types';
import { useAuth } from '../context/AuthContext';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: UserCredits;
  onUpgradePlan: (planName: UserCredits['planName'], addedCredits: number) => void;
  lang: 'vi' | 'en';
}

export const BillingModal: React.FC<BillingModalProps> = ({
  isOpen,
  onClose,
  credits,
  onUpgradePlan,
  lang,
}) => {
  const { userProfile, addCredits } = useAuth();
  if (!isOpen) return null;

  const currentPlan = userProfile?.planName || credits.planName;
  const currentBalance = userProfile?.credits ?? credits.balance;
  const currentMonthlyQuota = userProfile?.monthlyQuota ?? credits.monthlyQuota;

  const PLANS = [
    {
      name: 'Starter' as const,
      price: 'Miễn phí',
      priceEn: 'Free',
      monthlyCredits: 1000,
      badge: 'Cơ bản',
      popular: false,
      features: [
        '1,000 Credits / Tháng (~70 video 720p)',
        'Mô hình Kling v1 & Seedance Light',
        'Thời lượng tối đa 5s / video',
        'Tốc độ hàng đợi tiêu chuẩn',
        'AI Prompt Copilot cơ bản',
      ],
      featuresEn: [
        '1,000 Credits / Month (~70 720p videos)',
        'Kling v1 & Seedance Light models',
        'Max 5s video duration',
        'Standard queue processing',
        'Basic AI Prompt Copilot',
      ],
    },
    {
      name: 'Pro Creator' as const,
      price: '490.000 đ / tháng',
      priceEn: '$19 / month',
      monthlyCredits: 5000,
      badge: 'Khuyên Dùng',
      popular: true,
      features: [
        '5,000 Credits / Tháng (~350 video 1080p)',
        'Mở khóa Kling v1.6 Pro & Seedance Cinema 2.0',
        'Video 10s & Motion Brush 3D',
        'Ưu tiên GPU Cluster cấp 1 (Không chờ đợi)',
        'Prompt Copilot Gemini 3.7 Flash',
        'Xuất không Watermark 1080p 60fps',
      ],
      featuresEn: [
        '5,000 Credits / Month (~350 1080p videos)',
        'Unlock Kling v1.6 Pro & Seedance Cinema',
        '10s video length & 3D Camera Controls',
        'Tier-1 Priority GPU Pipeline (Fast)',
        'Gemini 3.7 Flash Prompt Copilot',
        'Commercial License & No Watermark',
      ],
    },
    {
      name: 'Studio' as const,
      price: '1.490.000 đ / tháng',
      priceEn: '$59 / month',
      monthlyCredits: 18000,
      badge: 'Production',
      popular: false,
      features: [
        '18,000 Credits / Tháng (~1,200 video HD/4K)',
        'Mở khóa toàn bộ: Kling 1.6, Seedance, Luma, Runway',
        'Batch Rendering 10 video song song',
        'Xuất 4K CinemaScope 21:9',
        'REST API & Webhooks Access (50 req/s)',
        'Hỗ trợ kỹ thuật 24/7 dedicated',
      ],
      featuresEn: [
        '18,000 Credits / Month (~1,200 HD/4K videos)',
        'Full Pipeline: Kling 1.6, Seedance, Luma, Runway',
        '10 concurrent batch generations',
        '4K Ultra-HD & CinemaScope 21:9',
        'Direct REST API & Webhook Gateway',
        'Dedicated 24/7 Priority Support',
      ],
    },
  ];

  const t = {
    vi: {
      title: 'Bảng Giá & Gói Dịch Vụ SaaS Thương Mại',
      subtitle: 'Nâng cấp hạn mức để mở khóa các mô hình video AI mạnh mẽ nhất của Kling và Seedance.',
      currentPlan: 'Gói hiện tại:',
      currentBalance: 'Số dư Credits:',
      monthlyQuota: 'Hạn mức tháng:',
      choosePlan: 'Chọn Gói Này',
      activePlan: 'Đang Sử Dụng',
      instantTopup: 'Nạp Nhanh (+2,500 Credits - 250k đ)',
      topupSuccess: 'Nạp credits thành công!',
    },
    en: {
      title: 'Commercial SaaS Subscription Plans',
      subtitle: 'Upgrade your quota to unlock flagship Kling AI 1.6 Pro and Seedance Cinema models.',
      currentPlan: 'Current Plan:',
      currentBalance: 'Credits Balance:',
      monthlyQuota: 'Monthly Quota:',
      choosePlan: 'Upgrade Plan',
      activePlan: 'Current Active',
      instantTopup: 'Instant Top-Up (+2,500 Credits)',
      topupSuccess: 'Top-up successful!',
    }
  }[lang];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0c0c14] border border-white/10 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl shadow-blue-500/10 space-y-6 max-h-[92vh] overflow-y-auto relative">
        
        {/* Ambient glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{t.title}</h3>
              <p className="text-xs text-white/50">{t.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Balance Bar */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Zap className="w-6 h-6 fill-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">{t.currentPlan}</span>
                <span className="text-xs font-bold text-white px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30">
                  {currentPlan}
                </span>
              </div>
              <p className="text-sm font-bold text-blue-400 mt-1 font-mono">
                {currentBalance.toLocaleString()} / {currentMonthlyQuota.toLocaleString()} Credits khả dụng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              addCredits(2500);
              onUpgradePlan(currentPlan, 2500);
            }}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-blue-300 font-semibold text-xs border border-blue-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5 fill-blue-400" />
            <span>{t.instantTopup}</span>
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.name;
            return (
              <div
                key={plan.name}
                className={`bg-black/40 rounded-2xl p-6 border flex flex-col justify-between space-y-5 relative transition-all ${
                  plan.popular
                    ? 'border-blue-500/60 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/30 bg-blue-950/10'
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow-lg shadow-blue-500/30">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                    {!plan.popular && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/50 font-medium">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-xl font-extrabold text-white">
                      {lang === 'vi' ? plan.price : plan.priceEn}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-white/5 space-y-2.5">
                    {(lang === 'vi' ? plan.features : plan.featuresEn).map((f, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-white/70 leading-relaxed">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    disabled={isCurrent}
                    onClick={() => {
                      addCredits(plan.monthlyCredits, plan.name);
                      onUpgradePlan(plan.name, plan.monthlyCredits);
                      onClose();
                    }}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-white/5 text-white/30 cursor-default'
                        : plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 active:scale-95'
                        : 'bg-white/10 hover:bg-white/15 text-white active:scale-95'
                    }`}
                  >
                    {isCurrent ? t.activePlan : t.choosePlan}
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
