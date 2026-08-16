import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'vi' | 'en';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, lang }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const t = {
    vi: {
      titleSignIn: 'Đăng nhập vào OmniVideo AI',
      titleSignUp: 'Tạo tài khoản SaaS Creator',
      subtitleSignIn: 'Truy cập không giới hạn các mô hình Kling v2, Seedance, Runway Gen-3 và hàng đợi render đám mây.',
      subtitleSignUp: 'Nhận ngay 200 Credits miễn phí khởi tạo video AI khi đăng ký tài khoản mới!',
      googleBtn: 'Tiếp tục với Google',
      orEmail: 'Hoặc đăng nhập qua Email',
      orSignUpEmail: 'Hoặc đăng ký tài khoản mới',
      emailLabel: 'Địa chỉ Email',
      passLabel: 'Mật khẩu',
      nameLabel: 'Tên nhà sáng tạo / Studio',
      signInBtn: 'Đăng Nhập',
      signUpBtn: 'Đăng Ký & Nhận 200 Credits',
      noAccount: 'Chưa có tài khoản?',
      haveAccount: 'Đã có tài khoản?',
      switchSignUp: 'Đăng ký nhận quà ngay',
      switchSignIn: 'Đăng nhập tại đây',
      bonusBadge: 'TẶNG 200 CREDITS MIỄN PHÍ',
      benefits: [
        'Đồng bộ đám mây toàn bộ video render qua Firebase Firestore',
        'Sử dụng các mô hình AI mới nhất: Seedance Motion & Kling 2.0',
        'Xuất video chất lượng cao 1080p / 4K không watermark'
      ]
    },
    en: {
      titleSignIn: 'Sign In to OmniVideo AI',
      titleSignUp: 'Create Creator SaaS Account',
      subtitleSignIn: 'Access unlimited Kling v2, Seedance, Runway Gen-3 and cloud video pipelines.',
      subtitleSignUp: 'Get 200 Free Welcome Credits upon creating your SaaS creator account today!',
      googleBtn: 'Continue with Google',
      orEmail: 'Or sign in with Email',
      orSignUpEmail: 'Or register with Email',
      emailLabel: 'Email Address',
      passLabel: 'Password',
      nameLabel: 'Creator or Studio Name',
      signInBtn: 'Sign In',
      signUpBtn: 'Sign Up & Claim 200 Credits',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      switchSignUp: 'Sign up for free bonus',
      switchSignIn: 'Sign in here',
      bonusBadge: 'FREE 200 CREDITS BONUS',
      benefits: [
        'Cloud-synced video generation via Firebase Firestore',
        'Unlock latest flagship models: Seedance & Kling 2.0',
        'Export crisp 1080p & 4K cinematic videos without watermark'
      ]
    }
  }[lang];

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đăng nhập Google không thành công.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'signin') {
        await signInWithEmail(email, password);
      } else {
        if (!email || !password) {
          throw new Error('Vui lòng điền đầy đủ email và mật khẩu');
        }
        await signUpWithEmail(email, password, displayName || 'Creator');
      }
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email hoặc mật khẩu không chính xác.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email này đã được đăng ký. Vui lòng chuyển sang Đăng nhập.');
      } else if (err.code === 'auth/weak-password') {
        setError('Mật khẩu cần ít nhất 6 ký tự.');
      } else {
        setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Background glow accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-100 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-auth-modal-btn"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Content */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.bonusBadge}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {tab === 'signin' ? t.titleSignIn : t.titleSignUp}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {tab === 'signin' ? t.subtitleSignIn : t.subtitleSignUp}
          </p>
        </div>

        {/* Google One-Click OAuth Button */}
        <button
          type="button"
          id="google-oauth-signin-btn"
          disabled={loading}
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 font-bold text-sm transition-all shadow-xs active:scale-98 disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{t.googleBtn}</span>
        </button>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-500 font-mono font-medium">
              {tab === 'signin' ? t.orEmail : t.orSignUpEmail}
            </span>
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.nameLabel}</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  id="auth-name-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ví dụ: Alex Studio / Visual Labs"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.emailLabel}</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                id="auth-email-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.passLabel}</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                id="auth-password-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="auth-submit-btn"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-105 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Đang xử lý...</span>
              </span>
            ) : (
              <>
                <span>{tab === 'signin' ? t.signInBtn : t.signUpBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Benefits list (signup mode) */}
        {tab === 'signup' && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
            {t.benefits.map((b, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer switch tabs */}
        <div className="mt-5 text-center text-xs text-slate-500">
          {tab === 'signin' ? (
            <span>
              {t.noAccount}{' '}
              <button
                type="button"
                id="switch-to-signup-btn"
                onClick={() => { setTab('signup'); setError(null); }}
                className="text-blue-600 font-bold hover:underline ml-1"
              >
                {t.switchSignUp}
              </button>
            </span>
          ) : (
            <span>
              {t.haveAccount}{' '}
              <button
                type="button"
                id="switch-to-signin-btn"
                onClick={() => { setTab('signin'); setError(null); }}
                className="text-blue-600 font-bold hover:underline ml-1"
              >
                {t.switchSignIn}
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
