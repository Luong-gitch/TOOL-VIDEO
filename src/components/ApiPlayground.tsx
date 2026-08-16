import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Terminal, 
  Send, 
  Copy, 
  Check, 
  Play, 
  CheckCircle2, 
  Layers, 
  FileCode, 
  Webhook, 
  Key,
  ExternalLink,
  Activity,
  Sparkles,
  Zap
} from 'lucide-react';
import { ProviderId } from '../types';
import { PROVIDERS } from '../data/providers';

interface ApiPlaygroundProps {
  lang: 'vi' | 'en';
}

const PRESET_ENDPOINTS = [
  {
    name: '1. Khởi Tạo Video (T2V/I2V Video Pipeline)',
    endpoint: '/api/generate-video',
    method: 'POST',
    body: {
      provider: 'kling',
      model: 'kling-v1-6-pro',
      mode: 'text2video',
      prompt: 'A cinematic drone shot flying over ancient stone temples in misty sunrise, 8k resolution',
      duration: 5,
      aspectRatio: '16:9',
      resolution: '1080p',
      cameraMovement: { type: 'zoom_in', speed: 6 },
    },
  },
  {
    name: '2. AI Prompt Enhancer (Gemini 3.7 Flash)',
    endpoint: '/api/gemini/enhance-prompt',
    method: 'POST',
    body: {
      rawPrompt: 'Cyberpunk street runner with glowing katana in neon rain',
      provider: 'seedance',
      style: 'cyberpunk',
      duration: 5,
      cameraMovement: { type: 'orbit_360', speed: 5 },
    },
  },
  {
    name: '3. Phân Cảnh Script-to-Storyboard',
    endpoint: '/api/gemini/storyboard',
    method: 'POST',
    body: {
      script: 'Một nhà du hành phát hiện tinh thể tím trên hành tinh xa xôi và kích hoạt cổng vũ trụ',
      targetProvider: 'kling',
      totalScenes: 3,
      mood: 'Epic Sci-Fi',
    },
  },
  {
    name: '4. Kiểm Tra Tình Trạng Gateway & Health Check',
    endpoint: '/api/health',
    method: 'GET',
    body: null,
  },
  {
    name: '5. Danh Sách Render Tasks',
    endpoint: '/api/tasks',
    method: 'GET',
    body: null,
  },
  {
    name: '6. Xác Thực API Key Tùy Biến',
    endpoint: '/api/gateway/test-key',
    method: 'POST',
    body: {
      provider: 'kling',
      apiKey: 'kling_live_sec_9948271049281',
    },
  },
];

export const ApiPlayground: React.FC<ApiPlaygroundProps> = ({ lang }) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [provider, setProvider] = useState<ProviderId>('kling');
  const [endpoint, setEndpoint] = useState<string>(PRESET_ENDPOINTS[0].endpoint);
  const [httpMethod, setHttpMethod] = useState<'POST' | 'GET'>('POST');
  const [rawBody, setRawBody] = useState<string>(JSON.stringify(PRESET_ENDPOINTS[0].body, null, 2));
  const [activeSnippetLang, setActiveSnippetLang] = useState<'curl' | 'node' | 'python'>('curl');
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [snippets, setSnippets] = useState<{ curl: string; nodeJs: string; python: string }>({
    curl: '',
    nodeJs: '',
    python: '',
  });

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const p = PRESET_ENDPOINTS[index];
    setEndpoint(p.endpoint);
    setHttpMethod(p.method as any);
    setRawBody(p.body ? JSON.stringify(p.body, null, 2) : '');
    setResponseOutput(null);
    setResponseStatus(null);
    setLatencyMs(null);
  };

  // Fetch code snippets when params change
  useEffect(() => {
    fetch('/api/gateway/developer-snippet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        prompt: 'A cinematic drone shot flying over ancient stone temples in misty sunrise',
        duration: 5,
      }),
    })
      .then((r) => r.json())
      .then((d) => setSnippets(d))
      .catch((e) => console.error(e));
  }, [provider]);

  const handleExecute = async () => {
    setIsExecuting(true);
    setResponseOutput(null);
    setResponseStatus(null);
    setLatencyMs(null);
    const start = performance.now();

    try {
      let parsedBody: any = undefined;
      if (httpMethod === 'POST' && rawBody.trim()) {
        try {
          parsedBody = JSON.parse(rawBody);
        } catch (err) {
          setResponseOutput(JSON.stringify({ error: 'Lỗi định dạng cú pháp JSON' }, null, 2));
          setIsExecuting(false);
          return;
        }
      }

      const res = await fetch(endpoint, {
        method: httpMethod,
        headers: { 'Content-Type': 'application/json' },
        body: httpMethod === 'POST' && parsedBody ? JSON.stringify(parsedBody) : undefined,
      });

      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setResponseStatus(res.status);

      const data = await res.json();
      setResponseOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setResponseStatus(500);
      setResponseOutput(JSON.stringify({ error: err.message || 'Lỗi thực thi kết nối API' }, null, 2));
    } finally {
      setIsExecuting(false);
    }
  };

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const t = {
    vi: {
      title: 'SaaS API Gateway Playground & Developer Hub',
      subtitle: 'Tương tác trực tiếp với API Video AI (Kling, Seedance, Luma, Runway, Gemini) trong thời gian thực.',
      requestTab: 'Gửi Request Thử Nghiệm Trực Tiếp',
      codeTab: 'Code Mẫu Tích Hợp (SDK / cURL)',
      sendBtn: 'Thực Thi API Request',
      executing: 'Đang gửi request...',
      responseTitle: 'Phản Hồi Từ Gateway:',
      presets: 'Chọn Endpoint Mẫu Sẵn Có:',
      docs: 'Tài Liệu API',
    },
    en: {
      title: 'SaaS API Gateway Playground & Developer Hub',
      subtitle: 'Interact directly with multi-provider AI Video APIs (Kling, Seedance, Luma, Runway, Gemini) in real time.',
      requestTab: 'Interactive Live API Request',
      codeTab: 'Integration Snippets (SDK / cURL)',
      sendBtn: 'Execute API Request',
      executing: 'Executing request...',
      responseTitle: 'Gateway Live Response:',
      presets: 'Select Preset API Endpoint:',
      docs: 'API Docs',
    }
  }[lang];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Code2 className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{t.title}</h2>
          </div>
          <p className="text-xs text-slate-500">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://klingai.org/api-docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200"
          >
            <span>Kling Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://seedance.ai/developer"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200"
          >
            <span>Seedance Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Preset Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">
          {t.presets}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {PRESET_ENDPOINTS.map((preset, idx) => {
            const isSelected = selectedPresetIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                id={`preset-api-btn-${idx}`}
                onClick={() => handleSelectPreset(idx)}
                className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-900 border-indigo-300 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span className="truncate">{preset.name}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${preset.method === 'POST' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {preset.method}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Request & Response Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Endpoint Input & Payload Editor */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                {t.requestTab}
              </span>
              <span className="text-[11px] text-slate-500 font-mono font-bold">REST JSON API</span>
            </div>

            {/* URL bar */}
            <div className="flex items-center gap-2">
              <select
                value={httpMethod}
                onChange={(e) => setHttpMethod(e.target.value as any)}
                className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-indigo-700 focus:outline-none"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            {/* Body Editor */}
            {httpMethod === 'POST' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
                  <span>Request Payload (JSON Body):</span>
                  <button
                    type="button"
                    onClick={() => copyText(rawBody)}
                    className="hover:text-slate-900 flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <textarea
                  id="api-payload-editor"
                  value={rawBody}
                  onChange={(e) => setRawBody(e.target.value)}
                  rows={9}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-indigo-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Execute Button */}
            <button
              type="button"
              id="execute-api-request-btn"
              disabled={isExecuting}
              onClick={handleExecute}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-105 text-white font-bold text-xs rounded-xl shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {isExecuting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{t.executing}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.sendBtn}</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Column: Real-time Live Output */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 min-h-[380px] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                {t.responseTitle}
              </span>

              {responseStatus !== null && (
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${responseStatus < 300 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                    HTTP {responseStatus}
                  </span>
                  {latencyMs !== null && (
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      {latencyMs}ms
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Response Area */}
            <div className="flex-1 relative bg-slate-950 rounded-xl p-3 border border-slate-800 overflow-auto max-h-[300px]">
              {responseOutput ? (
                <pre className="text-[11px] font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed">
                  {responseOutput}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-12">
                  <Terminal className="w-8 h-8 mb-2 opacity-50" />
                  <p>Nhấp "Thực Thi API Request" để nhận dữ liệu thời gian thực</p>
                </div>
              )}

              {responseOutput && (
                <button
                  type="button"
                  onClick={() => copyText(responseOutput)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                  title="Copy Response"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
