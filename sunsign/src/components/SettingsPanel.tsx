import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, BrainCircuit, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SunSignLogo from './SunSignLogo';
import type { ModelConfig } from '../hooks/useGestureModel';
import {
  type GlossNLPConfig, type LLMProvider,
  loadGlossConfig, saveGlossConfig, defaultGlossConfig,
  PROVIDER_URLS,
} from '../hooks/useGlossNLP';

/**
 * SettingsPanel
 * =============
 * This is the side menu where you can change how the app works.
 * You can switch languages, pick different sign-finding AI models, 
 * or setup a smart AI to help with translations.
 */

interface ModelMeta {
  id: ModelConfig;
  name: string;
  subtitle: string;
  description: string;
  acc: string;
  accLabel: string;
  vocab: string;
  icon: string;
}

// Info about the different "Brains" (AI models) we can use
const MODELS: ModelMeta[] = [
  {
    id: 'static',
    name: 'Image — Static Signs',
    subtitle: 'Fast · Best for ABCs',
    description:
      'Looks at your hand like a photo. Best for the Arabic alphabet and clear, non-moving signs.',
    acc: '95.6%',
    accLabel: 'Accuracy',
    vocab: '32 ArSL letters',
    icon: '✋',
  },
  {
    id: 'dual_lstm',
    name: 'Dual-Hand Pose LSTM',
    subtitle: 'High Accuracy',
    description: 'Tracks both hands and their placement relative to the body for ultimate precision.',
    acc: '98%',
    accLabel: 'Accuracy',
    vocab: 'Words & Body',
    icon: '✨',
  },
  {
    id: 'combined',
    name: 'Hybrid — Smart Dual Mode',
    subtitle: 'Best All-Rounder',
    description: 'Runs both the static alphabet recognizer AND the dynamic Dual-Hand LSTM simultaneously.',
    acc: '98%',
    accLabel: 'Accuracy',
    vocab: 'Words & ABCs',
    icon: '🔮',
  },
];

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  toggleLang: () => void;
  modelConfig: ModelConfig;
  onModelConfigChange: (config: ModelConfig) => void;
  isModelSwitching: boolean;
  highContrast: boolean;
  onHighContrastToggle: () => void;
  soundChimes: boolean;
  onSoundChimesToggle: () => void;
}

export default function SettingsPanel({
  isOpen, onClose, lang, toggleLang,
  modelConfig, onModelConfigChange, isModelSwitching,
  highContrast, onHighContrastToggle,
  soundChimes, onSoundChimesToggle,
}: SettingsPanelProps) {
  const { t } = useTranslation();

  // -- Smart AI (LLM) Settings --
  const [nlpCfg, setNlpCfg]         = useState<GlossNLPConfig>(() => loadGlossConfig());
  const [nlpOpen, setNlpOpen]        = useState(false);
  const [testStatus, setTestStatus]  = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [testResult, setTestResult]  = useState('');
  const abortRef = useRef<AbortController | null>(null);

  /** Saves and applies changes to the AI settings */
  const updateNlp = (patch: Partial<GlossNLPConfig>) => {
    setNlpCfg(prev => {
      const next = { ...prev, ...patch };
      saveGlossConfig(next);
      return next;
    });
  };

  /** Checks if your local smart AI server is actually working */
  const handleTest = async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setTestStatus('loading');
    setTestResult('');
    
    const base = nlpCfg.customBaseUrl?.trim() || PROVIDER_URLS[nlpCfg.provider];
    
    try {
      const res = await fetch(`${base}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model: nlpCfg.model,
          messages: [
            { role: 'system', content: 'Say hello in sign language jargon. JSON only.' },
            { role: 'user', content: 'أنا جائع' },
          ],
          temperature: 0.1, max_tokens: 64, stream: false,
        }),
      });
      const json = await res.json();
      const raw: string = json?.choices?.[0]?.message?.content ?? '';
      setTestResult(raw.trim().slice(0, 120));
      setTestStatus('ok');
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      setTestResult(e.message ?? 'Server is offline');
      setTestStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-sun-void/50 backdrop-blur-sm z-[200]"
          />
          
          {/* The Sidebar itself */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[400px] max-w-[100vw] sun-glass rounded-l-3xl rounded-r-none z-[210] p-8 flex flex-col custom-scrollbar overflow-y-auto"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            {/* Menu Header */}
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-brand text-3xl text-text-primary">{t('settings')}</h2>
              <button onClick={onClose} className="p-2 text-text-secondary hover:text-sun-core transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8 flex-1">
              {/* Language Selector */}
              <div className="space-y-4">
                <h3 className="font-ui text-xs uppercase tracking-[0.2em] text-text-secondary">Language / اللغة</h3>
                <div className="flex bg-sun-void/40 rounded-xl p-1 w-full border border-sun-border">
                  <button
                    onClick={() => lang !== 'ar' && toggleLang()}
                    className={`flex-1 py-2 text-center rounded-lg transition-colors ${lang === 'ar' ? 'bg-sun-core text-sun-void font-bold' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    العربية
                  </button>
                  <button
                    onClick={() => lang !== 'en' && toggleLang()}
                    className={`flex-1 py-2 text-center rounded-lg transition-colors ${lang === 'en' ? 'bg-sun-core text-sun-void font-bold' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Recognition Engine (AI Models) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-ui text-xs uppercase tracking-[0.2em] text-text-secondary">
                    Recognition Engine
                  </h3>
                  {isModelSwitching && (
                    <span className="font-ui text-[10px] text-sun-core/70 uppercase tracking-widest animate-pulse">
                      Switching…
                    </span>
                  )}
                </div>

                <p className="font-ui text-[10px] text-text-secondary/60 leading-relaxed">
                  Choose which "Brain" should handle your hand signs.
                </p>

                <div className="space-y-2">
                  {MODELS.map((m) => {
                    const isActive = modelConfig === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => onModelConfigChange(m.id)}
                        className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all duration-200
                          ${isActive
                            ? 'border-sun-core bg-sun-core/10 shadow-[0_0_16px_rgba(255,238,2,0.08)]'
                            : 'border-sun-border bg-sun-void/40 hover:border-sun-core/40 hover:bg-sun-core/5'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl leading-none">{m.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className={`font-ui text-sm font-semibold ${isActive ? 'text-sun-core' : 'text-text-primary'}`}>
                              {m.name}
                            </span>
                            <span className="font-ui text-[10px] text-text-secondary ml-2">{m.subtitle}</span>
                          </div>
                          <div className={`flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center
                            ${isActive ? 'border-sun-core bg-sun-core' : 'border-sun-border'}`}>
                            {isActive && <Check size={10} className="text-sun-void" strokeWidth={3} />}
                          </div>
                        </div>

                        <p className="font-ui text-[11px] text-text-secondary mt-2 leading-snug">
                          {m.description}
                        </p>

                        <div className="flex gap-2 mt-2.5 flex-wrap">
                          <span className="font-ui text-[10px] text-sun-core/80 bg-sun-core/10 px-1.5 py-0.5 rounded">
                            {m.acc} {m.accLabel}
                          </span>
                          <span className="font-ui text-[10px] text-text-secondary/70 bg-sun-void/60 border border-sun-border px-1.5 py-0.5 rounded">
                            {m.vocab}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>


              {/* Smart AI Translation (LLM) */}
              <div className="space-y-3">
                <button
                  onClick={() => setNlpOpen(o => !o)}
                  className="w-full flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <BrainCircuit size={14} className={`transition-colors ${nlpCfg.enabled ? 'text-sun-core' : 'text-text-secondary'}`} />
                    <h3 className="font-ui text-xs uppercase tracking-[0.2em] text-text-secondary">Smart AI Translation</h3>
                    {nlpCfg.enabled && (
                      <span className="font-ui text-[9px] bg-sun-core/15 text-sun-core px-1.5 py-0.5 rounded uppercase tracking-wider">Active</span>
                    )}
                  </div>
                  {nlpOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <AnimatePresence initial={false}>
                  {nlpOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 pt-1">
                        <div className="flex items-center justify-between p-4 bg-sun-void/40 rounded-xl border border-sun-border">
                          <div>
                            <p className="font-ui text-sm text-text-primary">Enable Advanced AI</p>
                            <p className="font-ui text-[10px] text-text-secondary mt-0.5">Translate full sentences instead of just words</p>
                          </div>
                          <button
                            onClick={() => updateNlp({ enabled: !nlpCfg.enabled })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${nlpCfg.enabled ? 'bg-sun-core' : 'bg-sun-surface'}`}
                          >
                            <motion.div
                              animate={{ x: nlpCfg.enabled ? 24 : 2 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                            />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <label className="font-ui text-[10px] uppercase tracking-widest text-text-secondary">Provider</label>
                          <div className="flex gap-2">
                            {(['ollama', 'lmstudio'] as LLMProvider[]).map(p => (
                              <button
                                key={p}
                                onClick={() => updateNlp({ provider: p, customBaseUrl: '' })}
                                className={`flex-1 py-2 rounded-lg border text-xs font-ui transition-all ${
                                  nlpCfg.provider === p && !nlpCfg.customBaseUrl
                                    ? 'border-sun-core bg-sun-core/10 text-sun-core'
                                    : 'border-sun-border text-text-secondary hover:border-sun-core/40'
                                }`}
                              >
                                {p === 'ollama' ? 'Ollama' : 'LM Studio'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-ui text-[10px] uppercase tracking-widest text-text-secondary">AI Server Link</label>
                          <input
                            type="text"
                            value={nlpCfg.customBaseUrl ?? ''}
                            onChange={e => updateNlp({ customBaseUrl: e.target.value })}
                            placeholder={PROVIDER_URLS[nlpCfg.provider]}
                            className="w-full bg-sun-void/60 border border-sun-border rounded-lg px-3 py-2 font-ui text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-sun-core/60 transition-colors"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-ui text-[10px] uppercase tracking-widest text-text-secondary">Model Name</label>
                          <input
                            type="text"
                            value={nlpCfg.model}
                            onChange={e => updateNlp({ model: e.target.value })}
                            placeholder="qwen2.5:7b"
                            className="w-full bg-sun-void/60 border border-sun-border rounded-lg px-3 py-2 font-ui text-xs text-text-primary"
                          />
                        </div>

                        <button
                          onClick={handleTest}
                          disabled={testStatus === 'loading'}
                          className="w-full py-2 rounded-lg border border-sun-core/40 text-sun-core text-xs font-ui hover:bg-sun-core/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {testStatus === 'loading'
                            ? <><Loader2 size={12} className="animate-spin" /> Connection Test…</>
                            : testStatus === 'ok'
                            ? <><CheckCircle2 size={12} className="text-green-400" /> Server is Active!</>
                            : testStatus === 'error'
                            ? <><XCircle size={12} className="text-red-400" /> Offline</>
                            : <>Test Connection</>
                          }
                        </button>

                        <button
                          onClick={() => { const d = defaultGlossConfig(); setNlpCfg(d); saveGlossConfig(d); }}
                          className="w-full py-1 text-[10px] font-ui text-text-secondary/40 hover:text-text-secondary/70 transition-colors"
                        >
                          Reset to defaults
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                <h3 className="font-ui text-xs uppercase tracking-[0.2em] text-text-secondary">{t('accessibility')}</h3>
                
                {/* High Contrast Toggle */}
                <div className="flex items-center justify-between p-4 bg-sun-void/40 rounded-xl border border-sun-border">
                  <div className="flex flex-col">
                    <span className="font-ui text-sm text-text-primary">High Contrast Effect</span>
                    <span className="font-ui text-[10px] text-text-secondary mt-0.5">Simplify UI for readability</span>
                  </div>
                  <button
                    onClick={onHighContrastToggle}
                    className={`relative w-12 h-6 rounded-full transition-colors ${highContrast ? 'bg-sun-core' : 'bg-sun-surface'}`}
                  >
                    <motion.div
                      animate={{ x: highContrast ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                    />
                  </button>
                </div>

                {/* Sound Chimes Toggle */}
                <div className="flex items-center justify-between p-4 bg-sun-void/40 rounded-xl border border-sun-border">
                  <div className="flex flex-col">
                    <span className="font-ui text-sm text-text-primary">Sound Chimes</span>
                    <span className="font-ui text-[10px] text-text-secondary mt-0.5">Audio feedback for recognition</span>
                  </div>
                  <button
                    onClick={onSoundChimesToggle}
                    className={`relative w-12 h-6 rounded-full transition-colors ${soundChimes ? 'bg-sun-core' : 'bg-sun-surface'}`}
                  >
                    <motion.div
                      animate={{ x: soundChimes ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                    />
                  </button>
                </div>
              </div>

              {/* Team / Project Info */}
              <div className="mt-12 pt-8 border-t border-sun-border text-center">
                <div className="flex justify-center mb-6">
                  <SunSignLogo size={80} />
                </div>
                <h4 className="font-brand text-2xl text-sun-warm mb-4">{t('about')}</h4>
                <p className="font-arabic text-lg text-text-secondary leading-relaxed px-4">
                  {t('about_text')}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
