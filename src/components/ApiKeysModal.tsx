import React, { useState } from 'react';
import { 
  X, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Radio, 
  Server,
  Zap,
  Globe
} from 'lucide-react';
import { ApiGatewayKeys, ProviderId } from '../types';
import { PROVIDERS } from '../data/providers';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  keys: ApiGatewayKeys;
  setKeys: (keys: ApiGatewayKeys) => void;
  lang: 'vi' | 'en';
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({
  isOpen,
  onClose,
  keys,
  setKeys,
  lang,
}) => {
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: { valid: boolean; message: string; latency?: number } }>({});

  if (!isOpen) return null;

  const handleTestKey = async (providerId: ProviderId, apiKey: string) => {
    setTestingProvider(providerId);
    try {
      const res = await fetch('/api/gateway/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId, apiKey }),
      });
      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [providerId]: {
          valid: data.valid,
          message: data.message,
          latency: data.latencyMs,
        },
      }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [providerId]: {
          valid: false,
          message: 'Không thể kết nối đến máy chủ Gateway',
        },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const t = {
    vi: {
      title: 'Quản Lý Kết Nối API Gateway & Cụm Máy Chủ',
      subtitle: 'Kết nối trực tiếp API của Kling AI, Seedance AI, Luma AI và Runway để chạy tác vụ render không giới hạn.',
      sharedCluster: 'Sử Dụng Cụm SaaS Cloud (Mặc định)',
      sharedDesc: 'Tự động định tuyến qua pool máy chủ GPU của OmniVideo SaaS (tính theo Credits).',
      byokTitle: 'Hoặc Kết Nối Custom API Key Trực Tiếp (BYOK):',
      testBtn: 'Kiểm Tra Kết Nối',
      testing: 'Đang ping...',
      saveClose: 'Lưu & Đóng Cấu Hình',
      webhookTitle: 'Webhook URL Nhận Kết Quả Tự Động (Tùy chọn):',
    },
    en: {
      title: 'API Gateway & Cluster Settings',
      subtitle: 'Connect Kling AI, Seedance AI, Luma and Runway APIs for high-throughput video pipelines.',
      sharedCluster: 'Use OmniVideo SaaS Cloud Cluster (Default)',
      sharedDesc: 'Automatically routed via OmniVideo SaaS GPU cluster (billed via credits).',
      byokTitle: 'Or Connect Custom Direct API Keys (BYOK):',
      testBtn: 'Test Connection',
      testing: 'Pinging...',
      saveClose: 'Save & Close',
      webhookTitle: 'Custom Webhook Callback URL (Optional):',
    }
  }[lang];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{t.title}</h3>
              <p className="text-xs text-slate-500">{t.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Default SaaS Cluster Mode Card */}
        <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-indigo-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
          <Server className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{t.sharedCluster}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                Active • 99.9% Uptime
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{t.sharedDesc}</p>
          </div>
        </div>

        {/* Direct Provider Key Inputs */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            {t.byokTitle}
          </label>

          {/* Kling AI Input */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <span>⚡</span>
                <span>Kling AI (Kuaishou) API Secret</span>
              </div>
              <a
                href="https://klingai.org"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-600 hover:underline flex items-center gap-0.5 font-bold"
              >
                Lấy Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                value={keys.klingApiKey}
                onChange={(e) => setKeys({ ...keys, klingApiKey: e.target.value })}
                placeholder="kling_sec_live_xxxxxxxxxxxxxxxx"
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                disabled={testingProvider === 'kling' || !keys.klingApiKey}
                onClick={() => handleTestKey('kling', keys.klingApiKey)}
                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-800 disabled:opacity-40 transition-colors"
              >
                {testingProvider === 'kling' ? t.testing : t.testBtn}
              </button>
            </div>

            {testResults['kling'] && (
              <div className={`text-[11px] p-2 rounded flex items-center gap-1.5 ${testResults['kling'].valid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                {testResults['kling'].valid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                <span>{testResults['kling'].message} {testResults['kling'].latency && `(${testResults['kling'].latency}ms)`}</span>
              </div>
            )}
          </div>

          {/* Seedance AI Input */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <span>🌱</span>
                <span>Seedance AI (ByteDance / Motion Sync) API Key</span>
              </div>
              <a
                href="https://seedance.ai"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-700 hover:underline flex items-center gap-0.5 font-bold"
              >
                Lấy Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                value={keys.seedanceApiKey}
                onChange={(e) => setKeys({ ...keys, seedanceApiKey: e.target.value })}
                placeholder="seedance_live_auth_xxxxxxxxxxxx"
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                disabled={testingProvider === 'seedance' || !keys.seedanceApiKey}
                onClick={() => handleTestKey('seedance', keys.seedanceApiKey)}
                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-800 disabled:opacity-40 transition-colors"
              >
                {testingProvider === 'seedance' ? t.testing : t.testBtn}
              </button>
            </div>

            {testResults['seedance'] && (
              <div className={`text-[11px] p-2 rounded flex items-center gap-1.5 ${testResults['seedance'].valid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                {testResults['seedance'].valid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                <span>{testResults['seedance'].message} {testResults['seedance'].latency && `(${testResults['seedance'].latency}ms)`}</span>
              </div>
            )}
          </div>

          {/* Webhook Input */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.webhookTitle}</span>
            </label>
            <input
              type="url"
              value={keys.customWebhookUrl}
              onChange={(e) => setKeys({ ...keys, customWebhookUrl: e.target.value })}
              placeholder="https://your-domain.com/api/webhooks/video-completed"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

        </div>

        {/* Actions */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-105 text-white font-bold text-xs shadow-xs transition-all"
          >
            {t.saveClose}
          </button>
        </div>

      </div>
    </div>
  );
};
