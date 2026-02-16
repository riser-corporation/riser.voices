
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
  Infinity
} from 'lucide-react';
import { generateSpeech } from './services/ttsService';
import { VOICE_OPTIONS, LANGUAGE_OPTIONS, NINJA_PHRASES } from './constants';
import { SpeechHistoryItem } from './types';

const EMOTIONS = [
  { label: 'Laugh', tag: '[laugh]', icon: <Smile size={14} />, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { label: 'Serious', tag: '[serious]', icon: <Volume1 size={14} />, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { label: 'Angry', tag: '[angry]', icon: <Angry size={14} />, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { label: 'Whisper', tag: '[whisper]', icon: <Mic size={14} />, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { label: 'Silent', tag: '[silent]', icon: <VolumeX size={14} />, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  { label: 'Sad', tag: '[sad]', icon: <Frown size={14} />, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' }
];

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGE_OPTIONS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<SpeechHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('riser_tts_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((item: any) => ({ ...item, audioBlobUrl: '' })));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  const saveHistory = (newHistory: SpeechHistoryItem[]) => {
    setHistory(newHistory);
    const metaHistory = newHistory.map(({ audioBlobUrl, ...rest }) => rest);
    localStorage.setItem('riser_tts_history', JSON.stringify(metaHistory));
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
        currentSourceRef.current.stop();
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
      setError(err.message || "Synthesis failed. Please verify your connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const playFromHistory = (item: SpeechHistoryItem) => {
    if (!item.audioBlobUrl) return;
    const audio = new Audio(item.audioBlobUrl);
    audio.play();
  };

  const downloadItem = (item: SpeechHistoryItem) => {
    if (!item.audioBlobUrl) return;
    const link = document.createElement('a');
    link.href = item.audioBlobUrl;
    link.download = `riser_voice_${item.id.slice(0, 8)}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteHistoryItem = (id: string) => {
    saveHistory(history.filter(item => item.id !== id));
  };

  const insertTag = (tag: string) => {
    setInputText(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + tag + ' ');
  };

  return (
    <div className="min-h-screen pb-12 bg-[#0b0f1a] selection:bg-orange-500/40 text-slate-200">
      {/* Intro Modal */}
      {showIntro && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <div className="bg-[#121d2f] border border-slate-700/50 rounded-[3rem] p-12 max-w-md w-full shadow-[0_0_80px_-15px_rgba(249,115,22,0.4)] text-center space-y-10 animate-in fade-in zoom-in duration-500">
            <div className="relative mx-auto w-36 h-36 flex items-center justify-center">
              <div className="absolute inset-0 bg-orange-600/10 blur-[60px] rounded-full scale-150 animate-pulse"></div>
              <img src="logo.png" alt="Riser Logo" className="w-full h-full object-contain relative z-10 drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)]" onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<div class="text-6xl font-black text-orange-500">R</div>');
              }} />
            </div>
            <div>
              <h2 className="text-5xl font-anime text-white mb-3 tracking-wider">Riser.TTS</h2>
              <p className="text-slate-400 font-bold tracking-[0.15em] flex items-center justify-center gap-2 uppercase text-xs">
                <ShieldCheck size={16} className="text-orange-500" />
                Riser Corporation Company
              </p>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed font-semibold">
              The world's premier <strong>Unlimited Use</strong> Anime Synthesis Engine. 
              Zero limits. Infinite creativity. 
            </p>
            <div className="flex gap-3">
              <div className="flex-1 bg-orange-500/5 border border-orange-500/20 p-4 rounded-3xl text-orange-400 text-[11px] font-black uppercase tracking-[0.25em] flex flex-col items-center justify-center gap-2">
                <Infinity size={24} className="mb-1" /> UNLIMITED
              </div>
              <div className="flex-1 bg-slate-800/20 border border-slate-700/50 p-4 rounded-3xl text-slate-400 text-[11px] font-black uppercase tracking-[0.25em] flex flex-col items-center justify-center gap-2">
                <Flame size={24} className="mb-1" /> CHAKRA
              </div>
            </div>
            <button 
              onClick={() => setShowIntro(false)}
              className="w-full py-6 bg-gradient-to-r from-orange-600 to-orange-400 text-white font-black text-xl rounded-3xl transition-all shadow-[0_15px_40px_-10px_rgba(249,115,22,0.6)] active:scale-95 uppercase tracking-[0.2em] hover:brightness-110"
            >
              INITIATE SYSTEM
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#0f172a] pt-12 pb-20 px-4 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] mb-[-4rem] relative z-10 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 blur-[120px] rounded-full -mr-64 -mt-64"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full -ml-48 -mb-48"></div>

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-20">
          <div className="flex items-center gap-8 mb-6">
             <img src="logo.png" alt="Riser Logo" className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-110 transition-transform duration-500 cursor-pointer" onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<div class="text-5xl font-black text-orange-500">R</div>');
             }} />
             <div className="text-left border-l border-white/10 pl-8">
                <h1 className="text-7xl md:text-9xl font-anime text-transparent bg-clip-text bg-gradient-to-br from-white via-orange-400 to-orange-700 leading-none tracking-tight">
                  Riser.TTS
                </h1>
                <p className="text-slate-500 text-[10px] font-black tracking-[0.5em] uppercase mt-3 opacity-60">
                  RISER CORPORATION NEURAL ENGINE
                </p>
             </div>
          </div>
          
          <div className="flex items-center gap-6 mt-4">
            <div className="h-[2px] w-16 bg-gradient-to-r from-transparent to-slate-800"></div>
            <div className="inline-flex items-center gap-3 bg-black/40 backdrop-blur-xl px-8 py-3 rounded-full text-[11px] font-black text-orange-400 border border-white/5 tracking-[0.3em] uppercase shadow-2xl">
              <Sparkles size={14} className="text-yellow-400 animate-pulse" />
              100% Unlimited Free Use
            </div>
            <div className="h-[2px] w-16 bg-gradient-to-l from-transparent to-slate-800"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-10">
            {/* Main Input Area */}
            <section className="bg-[#121d2f]/60 backdrop-blur-3xl rounded-[3rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/5">
              <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-[0_0_10px_#f97316] animate-pulse"></div>
                  Synthesis Script
                </label>
                <div className="flex gap-1.5 p-1.5 bg-black/30 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                  {LANGUAGE_OPTIONS.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => setSelectedLanguage(lang.id)}
                      className={`px-4 py-2.5 rounded-xl text-[10px] font-black border transition-all flex items-center gap-2.5 flex-shrink-0 ${
                        selectedLanguage === lang.id 
                          ? 'bg-orange-600 border-orange-500 text-white shadow-[0_5px_15px_-5px_rgba(249,115,22,0.5)]' 
                          : 'bg-transparent border-transparent text-slate-600 hover:text-slate-300'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="uppercase">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Emotions Bar */}
              <div className="mb-6 flex flex-wrap gap-2.5">
                {EMOTIONS.map(emo => (
                  <button
                    key={emo.tag}
                    onClick={() => insertTag(emo.tag)}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[10px] font-black border transition-all active:scale-95 uppercase tracking-wider hover:brightness-150 shadow-sm ${emo.color}`}
                  >
                    {emo.icon}
                    {emo.label}
                  </button>
                ))}
              </div>
              
              <div className="relative group">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value.slice(0, 1000))}
                  placeholder="Enter script here... use [laugh] for character joy or [serious] for cold fury!"
                  className="w-full h-56 bg-black/40 text-white rounded-[2rem] p-8 border border-white/5 focus:border-orange-500/30 focus:ring-0 transition-all resize-none text-2xl font-medium leading-relaxed placeholder:text-slate-800 shadow-inner custom-scrollbar"
                />
                <div className="absolute bottom-6 right-8 text-[10px] font-black text-slate-700 tracking-widest uppercase">
                  {inputText.length} / 1000
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {NINJA_PHRASES.map(phrase => (
                  <button
                    key={phrase}
                    onClick={() => insertTag(phrase)}
                    className="bg-slate-800/10 hover:bg-orange-500/10 hover:text-orange-400 text-slate-600 text-[10px] py-2 px-5 rounded-full border border-white/5 transition-all uppercase font-black tracking-widest active:scale-95"
                  >
                    <Zap size={12} className="text-orange-500 mr-1" />
                    {phrase}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mt-6 p-5 bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl flex items-center gap-4">
                  <div className="p-1.5 bg-red-500 rounded-lg shadow-lg shadow-red-500/20"><Info size={16} className="text-white" /></div>
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !inputText.trim()}
                className={`w-full mt-10 py-6 rounded-[2rem] flex items-center justify-center gap-4 text-3xl font-anime transition-all shadow-2xl active:scale-[0.98] tracking-[0.2em] ${
                  isGenerating 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-orange-700 to-orange-500 text-white hover:from-orange-600 hover:to-orange-400 hover:shadow-orange-600/40'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-4 uppercase font-black text-sm tracking-[0.3em]">
                    <div className="w-6 h-6 border-[5px] border-white/10 border-t-white rounded-full animate-spin" />
                    Neural Channeling...
                  </div>
                ) : (
                  <>
                    <Sword className="rotate-45" size={32} />
                    GENERATE VOICE
                  </>
                )}
              </button>
            </section>

            {/* Voice Selection */}
            <section className="bg-[#121d2f]/60 backdrop-blur-3xl rounded-[3rem] p-10 shadow-2xl border border-white/5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 block flex items-center gap-3">
                <Globe size={18} className="text-orange-500" />
                Select Neural Voice Profile
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {VOICE_OPTIONS.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`p-6 rounded-[2.5rem] border transition-all text-left flex items-center gap-5 group ${
                      selectedVoice === voice.id 
                        ? 'bg-orange-600/10 border-orange-500/40 text-white shadow-[0_15px_30px_-10px_rgba(249,115,22,0.4)]' 
                        : 'bg-black/20 border-white/5 text-slate-600 hover:border-white/10'
                    }`}
                  >
                    <div className={`p-4 rounded-3xl transition-all shadow-xl ${
                      selectedVoice === voice.id ? 'bg-orange-600 text-white scale-110' : 'bg-slate-800 group-hover:bg-slate-700'
                    }`}>
                      <Volume2 size={24} />
                    </div>
                    <div>
                      <div className={`font-black text-base mb-1 uppercase tracking-wider ${selectedVoice === voice.id ? 'text-white' : 'text-slate-400'}`}>
                        {voice.name}
                      </div>
                      <div className="text-[10px] opacity-40 leading-tight uppercase font-black tracking-[0.15em]">
                        {voice.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            <section className="bg-[#121d2f]/60 backdrop-blur-3xl rounded-[3rem] p-10 shadow-2xl border border-white/5 h-full max-h-[900px] flex flex-col">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-orange-600/10 rounded-2xl border border-orange-600/20 shadow-inner">
                      <History size={24} className="text-orange-500" />
                   </div>
                   <h3 className="font-anime text-4xl text-white tracking-widest">
                    Legacy
                  </h3>
                </div>
                <button 
                  onClick={() => saveHistory([])}
                  className="text-slate-800 hover:text-red-500 transition-all p-3 rounded-2xl hover:bg-red-500/10"
                  title="Clear Records"
                >
                  <Trash2 size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-3 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-900 py-48 space-y-6">
                    <VolumeX size={80} className="opacity-5" />
                    <p className="text-center italic text-[11px] uppercase font-black tracking-[0.3em] opacity-20">Memory Bank Empty</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-black/30 rounded-[2rem] p-6 border border-white/5 group relative hover:border-orange-500/30 transition-all shadow-xl"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-2 items-center">
                          <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20">
                            {item.voice}
                          </span>
                          <span className="text-[9px] font-black text-slate-500 bg-slate-800/40 px-3 py-1.5 rounded-xl border border-white/5">
                            {LANGUAGE_OPTIONS.find(l => l.id === item.language)?.flag} {item.language.toUpperCase()}
                          </span>
                        </div>
                        <button 
                          onClick={() => deleteHistoryItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-800 hover:text-red-500 transition-all p-1.5"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <p className="text-slate-300 text-xs line-clamp-3 mb-5 font-semibold italic leading-relaxed tracking-wide">
                        "{item.text}"
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] text-slate-700 uppercase font-black tracking-[0.2em]">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        <div className="flex gap-3">
                          {item.audioBlobUrl ? (
                            <>
                              <button 
                                onClick={() => downloadItem(item)}
                                className="text-slate-600 hover:text-white p-2.5 bg-white/5 rounded-xl transition-all hover:bg-white/10"
                                title="Download WAV"
                              >
                                <Download size={18} />
                              </button>
                              <button 
                                onClick={() => playFromHistory(item)}
                                className="text-white bg-orange-600 hover:bg-orange-500 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-[0_8px_20px_-5px_rgba(249,115,22,0.4)]"
                              >
                                <Play size={16} fill="currentColor" />
                                PLAY
                              </button>
                            </>
                          ) : (
                            <span className="text-[9px] text-slate-800 font-black uppercase tracking-[0.2em] py-2">Cache Purged</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 mt-24 text-center flex flex-col items-center gap-8 opacity-40 hover:opacity-100 transition-opacity duration-700">
        <div className="flex items-center gap-6">
           <img src="logo.png" alt="Riser Logo Footer" className="w-12 h-12 object-contain grayscale brightness-50 contrast-125 opacity-30" onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<div class="text-xl font-black text-slate-700">R</div>');
           }} />
           <div className="text-left border-l border-white/5 pl-6">
              <p className="text-[12px] font-black text-slate-600 uppercase tracking-[0.5em]">Riser.TTS Synthesis Node</p>
              <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.3em] mt-1">A Riser Corporation Production • Emotional Core v2.2</p>
           </div>
        </div>
        <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-slate-900 to-transparent"></div>
        <div className="space-y-2">
          <p className="text-[10px] text-slate-700 uppercase font-black tracking-[0.4em]">Unlimited Access Protocol Enabled</p>
          <p className="text-[8px] text-slate-800 uppercase font-bold tracking-[0.2em]">© {new Date().getFullYear()} Riser Corporation. All Rights Reserved.</p>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f97316;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-soft {
          animation: pulse-soft 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
