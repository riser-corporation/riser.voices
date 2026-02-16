
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Trash2, 
  History, 
  Flame, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Zap,
  Sword,
  Download,
  Info,
  Globe,
  Smile,
  Frown,
  Mic,
  Volume1,
  Angry,
  ShieldCheck,
  Infinity,
  Wifi,
  Wind
} from 'lucide-react';
import { generateSpeech } from './services/ttsService.ts';
import { VOICE_OPTIONS, LANGUAGE_OPTIONS, NINJA_PHRASES } from './constants.ts';
import { SpeechHistoryItem } from './types.ts';

const EMOTIONS = [
  { label: 'Determined', tag: '[serious]', icon: <Sword size={14} />, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { label: 'Laugh', tag: '[laugh]', icon: <Smile size={14} />, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { label: 'Angry', tag: '[angry]', icon: <Angry size={14} />, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { label: 'Whisper', tag: '[whisper]', icon: <Mic size={14} />, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { label: 'Sad', tag: '[sad]', icon: <Frown size={14} />, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { label: 'Silent', tag: '[silent]', icon: <VolumeX size={14} />, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
];

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGE_OPTIONS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<SpeechHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [logoError, setLogoError] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('riser_tts_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed.map((item: any) => ({ ...item, audioBlobUrl: '' })));
        }
      }
    } catch (e) {
      console.warn("History inaccessible");
    }
  }, []);

  const saveHistory = (newHistory: SpeechHistoryItem[]) => {
    setHistory(newHistory);
    try {
      const metaHistory = newHistory.map(({ audioBlobUrl, ...rest }) => rest);
      localStorage.setItem('riser_tts_history', JSON.stringify(metaHistory.slice(0, 20)));
    } catch (e) {}
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const { audioBuffer, audioContext, audioUrl } = await generateSpeech({
        text: inputText,
        voiceName: selectedVoice,
        language: selectedLanguage
      });
      
      audioContextRef.current = audioContext;
      
      if (currentSourceRef.current) {
        try { currentSourceRef.current.stop(); } catch(e) {}
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      currentSourceRef.current = source;

      const newItem: SpeechHistoryItem = {
        id: crypto.randomUUID(),
        text: inputText,
        timestamp: Date.now(),
        voice: selectedVoice,
        language: selectedLanguage,
        audioBlobUrl: audioUrl
      };

      saveHistory([newItem, ...history]);
      
    } catch (err: any) {
      setError("Chakra connection interrupted. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const playFromHistory = (item: SpeechHistoryItem) => {
    if (!item.audioBlobUrl) return;
    const audio = new Audio(item.audioBlobUrl);
    audio.play().catch(() => setError("Cache cleared. Re-generate to play."));
  };

  const downloadItem = (item: SpeechHistoryItem) => {
    if (!item.audioBlobUrl) return;
    const link = document.createElement('a');
    link.href = item.audioBlobUrl;
    link.download = `riser_voice.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const insertTag = (tag: string) => {
    setInputText(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + tag + ' ');
  };

  const LogoComponent = ({ className = "" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      {!logoError ? (
        <img 
          src="logo.png" 
          alt="Riser Logo" 
          className="w-full h-full object-contain" 
          onError={() => setLogoError(true)} 
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-600 to-orange-400 rounded-3xl shadow-lg border border-white/20">
          <span className="text-white font-black text-6xl">R</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pb-12 bg-[#050810] selection:bg-orange-500/40 text-slate-200">
      {/* Intro Modal */}
      {showIntro && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-lg p-4">
          <div className="bg-[#0b1221] border border-white/5 rounded-[3rem] p-12 max-w-md w-full shadow-[0_0_120px_-20px_rgba(249,115,22,0.4)] text-center space-y-10 animate-in fade-in zoom-in duration-500">
            <LogoComponent className="w-36 h-36 mx-auto" />
            <div>
              <h2 className="text-6xl font-anime text-white mb-2 tracking-widest uppercase">Riser.TTS</h2>
              <p className="text-slate-500 font-black tracking-[0.3em] flex items-center justify-center gap-2 uppercase text-[9px]">
                <ShieldCheck size={14} className="text-orange-500" />
                RISER CORPORATION ENTERPRISE
              </p>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed font-bold">
              The only <span className="text-orange-500">Unlimited Chakra</span> Voice Synthesis Engine in the world. 
              Believe it!
            </p>
            <div className="flex gap-4">
              <div className="flex-1 bg-white/5 border border-white/10 p-4 rounded-3xl text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] flex flex-col items-center justify-center gap-2">
                <Infinity size={24} /> 100% FREE
              </div>
              <div className="flex-1 bg-white/5 border border-white/10 p-4 rounded-3xl text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex flex-col items-center justify-center gap-2">
                <Zap size={24} /> NO LIMITS
              </div>
            </div>
            <button 
              onClick={() => setShowIntro(false)}
              className="w-full py-6 bg-gradient-to-r from-orange-700 to-orange-500 text-white font-black text-xl rounded-[1.5rem] transition-all shadow-2xl active:scale-95 uppercase tracking-widest hover:brightness-110"
            >
              IGNITE CHAKRA
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#090e1a] pt-16 pb-28 px-4 shadow-[0_15px_60px_-15px_rgba(0,0,0,0.8)] mb-[-6rem] relative z-10 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-20">
          <div className="flex items-center gap-12 mb-10 flex-col md:flex-row">
             <LogoComponent className="w-28 h-28 md:w-36 md:h-36 drop-shadow-[0_0_30px_rgba(249,115,22,0.6)]" />
             <div className="text-left border-l-0 md:border-l-4 border-orange-500/40 md:pl-12 text-center md:text-left">
                <h1 className="text-8xl md:text-[11rem] font-anime text-transparent bg-clip-text bg-gradient-to-br from-white via-orange-400 to-orange-700 leading-none tracking-tighter filter drop-shadow-2xl">
                  Riser.TTS
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                  <span className="text-slate-600 text-[10px] font-black tracking-[0.6em] uppercase">
                    NEURAL ENGINE V2.5.FLASH
                  </span>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
                    <Wifi size={10} className="text-green-500" />
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Active</span>
                  </div>
                </div>
             </div>
          </div>
          
          <div className="inline-flex items-center gap-4 bg-black/60 backdrop-blur-3xl px-14 py-5 rounded-full text-[12px] font-black text-orange-400 border border-white/10 tracking-[0.4em] uppercase shadow-3xl transform hover:scale-105 transition-transform">
            <Sparkles size={18} className="text-yellow-400 animate-pulse" />
            UNLIMITED CHAKRA PROTOCOL ENABLED
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12">
            {/* Input Script Area */}
            <section className="bg-[#111827]/80 backdrop-blur-3xl rounded-[4rem] p-12 shadow-2xl border border-white/5 ring-1 ring-white/10">
              <div className="flex justify-between items-center mb-10 flex-wrap gap-8">
                <label className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-4">
                  <div className="w-3.5 h-3.5 bg-orange-600 rounded-full shadow-[0_0_20px_#f97316] animate-pulse"></div>
                  Neural Input Script
                </label>
                <div className="flex gap-2.5 p-2 bg-black/50 rounded-3xl border border-white/5 shadow-inner">
                  {LANGUAGE_OPTIONS.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => setSelectedLanguage(lang.id)}
                      className={`px-6 py-3.5 rounded-2xl text-[11px] font-black border transition-all flex items-center gap-3 ${
                        selectedLanguage === lang.id 
                          ? 'bg-orange-600 border-orange-500 text-white shadow-xl' 
                          : 'bg-transparent border-transparent text-slate-600 hover:text-slate-300'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="uppercase">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Performance Tags */}
              <div className="mb-10 flex flex-wrap gap-3">
                {EMOTIONS.map(emo => (
                  <button
                    key={emo.tag}
                    onClick={() => insertTag(emo.tag)}
                    className={`flex items-center gap-3 px-7 py-4 rounded-[1.8rem] text-[11px] font-black border transition-all active:scale-95 uppercase tracking-widest hover:brightness-150 shadow-2xl ${emo.color}`}
                  >
                    {emo.icon}
                    {emo.label}
                  </button>
                ))}
              </div>
              
              <div className="relative group rounded-[3rem] overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] bg-black/40">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value.slice(0, 1000))}
                  placeholder="Paste your script here... use [serious] for ninja focus or [laugh] for Uzumaki joy!"
                  className="w-full h-72 bg-transparent text-white p-12 focus:ring-0 border-none transition-all resize-none text-2xl font-semibold leading-relaxed placeholder:text-slate-800 custom-scrollbar"
                />
                <div className="absolute bottom-10 right-12 text-[11px] font-black text-slate-700 tracking-widest uppercase bg-black/60 px-4 py-1.5 rounded-xl border border-white/5">
                  {inputText.length} / 1000 CHAKRA UNITS
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                {NINJA_PHRASES.map(phrase => (
                  <button
                    key={phrase}
                    onClick={() => insertTag(phrase)}
                    className="bg-slate-800/20 hover:bg-orange-600/20 hover:text-orange-400 text-slate-600 text-[11px] py-3 px-8 rounded-full border border-white/5 transition-all uppercase font-black tracking-widest active:scale-95"
                  >
                    <Wind size={14} className="text-orange-500 mr-2" />
                    {phrase}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mt-10 p-8 bg-red-600/5 border border-red-600/20 text-red-400 text-sm font-bold rounded-[2.5rem] flex items-center gap-6 animate-pulse">
                  <div className="p-3 bg-red-600 rounded-2xl shadow-lg"><Info size={24} className="text-white" /></div>
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !inputText.trim()}
                className={`w-full mt-14 py-10 rounded-[2.5rem] flex items-center justify-center gap-6 text-5xl font-anime transition-all shadow-3xl active:scale-[0.98] tracking-[0.2em] ${
                  isGenerating 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-700 to-orange-500 text-white hover:brightness-110 hover:shadow-orange-600/60'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-6 uppercase font-black text-xl tracking-[0.4em]">
                    <div className="w-10 h-10 border-[8px] border-white/10 border-t-white rounded-full animate-spin" />
                    CHANNELING...
                  </div>
                ) : (
                  <>
                    <Sword className="rotate-45" size={48} />
                    INVOKE VOICE
                  </>
                )}
              </button>
            </section>

            {/* Profile Selection */}
            <section className="bg-[#111827]/80 backdrop-blur-3xl rounded-[4rem] p-12 shadow-2xl border border-white/5">
              <label className="text-[13px] font-black text-slate-500 uppercase tracking-[0.5em] mb-12 block flex items-center gap-5">
                <Globe size={24} className="text-orange-500" />
                Select Neural Profile
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {VOICE_OPTIONS.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`p-10 rounded-[3.5rem] border-2 transition-all text-left flex items-center gap-8 group ${
                      selectedVoice === voice.id 
                        ? 'bg-orange-600/10 border-orange-500 text-white shadow-[0_25px_50px_-10px_rgba(249,115,22,0.4)]' 
                        : 'bg-black/40 border-white/5 text-slate-600 hover:border-white/20'
                    }`}
                  >
                    <div className={`p-6 rounded-[2.2rem] transition-all shadow-2xl ${
                      selectedVoice === voice.id ? 'bg-orange-600 text-white scale-110' : 'bg-slate-800 group-hover:bg-slate-700'
                    }`}>
                      <Volume2 size={36} />
                    </div>
                    <div>
                      <div className={`font-black text-xl mb-1.5 uppercase tracking-wider ${selectedVoice === voice.id ? 'text-white' : 'text-slate-400'}`}>
                        {voice.name}
                      </div>
                      <div className="text-[11px] opacity-40 leading-tight uppercase font-black tracking-[0.2em]">
                        {voice.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Legacy Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            <section className="bg-[#111827]/80 backdrop-blur-3xl rounded-[4rem] p-12 shadow-2xl border border-white/5 h-full max-h-[1100px] flex flex-col">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                   <div className="p-5 bg-orange-600/10 rounded-3xl border border-orange-600/20 shadow-inner">
                      <History size={32} className="text-orange-500" />
                   </div>
                   <h3 className="font-anime text-6xl text-white tracking-[0.1em] uppercase">
                    Legacy
                  </h3>
                </div>
                <button 
                  onClick={() => saveHistory([])}
                  className="text-slate-800 hover:text-red-500 transition-all p-4 rounded-2xl hover:bg-red-500/10"
                >
                  <Trash2 size={32} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-10 pr-4 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-900 py-64 space-y-10">
                    <VolumeX size={120} className="opacity-5" />
                    <p className="text-center italic text-[14px] uppercase font-black tracking-[0.5em] opacity-20">Voice Scrolls Empty</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-black/50 rounded-[3rem] p-10 border border-white/5 group relative hover:border-orange-500/40 transition-all shadow-3xl"
                    >
                      <div className="flex justify-between items-start mb-8">
                        <span className="text-[11px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-5 py-2.5 rounded-2xl border border-orange-500/20">
                          {item.voice}
                        </span>
                        <div className="flex gap-4">
                           <button 
                              onClick={() => downloadItem(item)}
                              className="text-slate-700 hover:text-white transition-all"
                            >
                              <Download size={22} />
                            </button>
                        </div>
                      </div>
                      <p className="text-slate-400 text-base line-clamp-4 mb-10 font-bold italic leading-relaxed tracking-wide opacity-90">
                        "{item.text}"
                      </p>
                      <button 
                        onClick={() => playFromHistory(item)}
                        className="w-full text-white bg-orange-600 hover:bg-orange-500 py-4 rounded-[1.5rem] text-[13px] font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-xl"
                      >
                        <Play size={20} fill="currentColor" />
                        REPLAY
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-10 mt-40 text-center flex flex-col items-center gap-12 opacity-40 hover:opacity-100 transition-opacity duration-1000">
        <div className="flex items-center gap-12">
           <LogoComponent className="w-20 h-20 grayscale brightness-50 contrast-125 opacity-30 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
           <div className="text-left border-l-2 border-white/5 pl-12">
              <p className="text-[16px] font-black text-slate-500 uppercase tracking-[0.7em]">Riser.TTS Neural Interface</p>
              <p className="text-[11px] font-black text-slate-800 uppercase tracking-[0.5em] mt-3">RISER CORPORATION COMPANY • UNLIMITED PROTOCOL V2.5</p>
           </div>
        </div>
        <div className="h-[2px] w-96 bg-gradient-to-r from-transparent via-slate-900 to-transparent"></div>
        <div className="space-y-4">
          <p className="text-[13px] text-slate-700 uppercase font-black tracking-[0.6em] animate-pulse-soft">Global Unlimited Free-Access Core Active</p>
          <p className="text-[10px] text-slate-900 uppercase font-black tracking-[0.4em]">© {new Date().getFullYear()} RISER CORPORATION COMPANY. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 40px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f97316; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .animate-pulse-soft { animation: pulse-soft 5s infinite; }
      `}</style>
    </div>
  );
};

export default App;
