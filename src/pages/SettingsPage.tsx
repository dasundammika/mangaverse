import React, { useState } from 'react';
import { ShieldAlert, Check, Save } from 'lucide-react';
import { useAppContext } from '../App';

const SettingsPage: React.FC = () => {
  const { settings, updateSetting, showToast } = useAppContext();
  const [proxy, setProxy] = useState(localStorage.getItem('mangaverse_proxy') || '');

  const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'zh', label: 'Chinese' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'id', label: 'Indonesian' },
    { code: 'vi', label: 'Vietnamese' },
    { code: 'th', label: 'Thai' },
    { code: 'all', label: 'All Languages' }
  ];

  const handleProxySave = () => {
    localStorage.setItem('mangaverse_proxy', proxy.trim());
    showToast("Proxy settings saved. Reloading...");
    setTimeout(() => window.location.reload(), 1500);
  };

  const verifyAge = () => {
    updateSetting('ageVerified', true);
    updateSetting('matureMode', true);
    showToast("Age Verified. Mature Mode Active.");
  };

  return (
    <div className="p-6 lg:p-16 max-w-3xl mx-auto space-y-16 pb-32">
        <div className="space-y-2">
             <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary italic">App Configuration</h4>
             <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">Settings</h1>
        </div>

        <div className="space-y-12">
            <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 italic">Preferred Language</h4>
                <select 
                  value={settings.language}
                  onChange={(e) => {
                    updateSetting('language', e.target.value);
                    showToast("Language updated");
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-3xl font-black uppercase tracking-widest text-sm focus:border-primary transition-all text-white"
                >
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
                <p className="text-[10px] text-zinc-600 font-bold uppercase">This controls the default language for chapter lists.</p>
            </div>

            <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 italic">Mature Mode (18+)</h4>
                <div className="p-8 bg-zinc-900/50 rounded-4xl border border-zinc-800 space-y-6">
                    {!settings.ageVerified ? (
                      <div className="space-y-6 text-center lg:text-left">
                        <div className="space-y-2">
                          <p className="font-black uppercase italic tracking-tighter text-xl text-white">Age Verification Required</p>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase">Confirm you are 18 or older to access mature titles.</p>
                        </div>
                        <button 
                          onClick={verifyAge}
                          className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
                        >
                          I am 18 or Older
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-black uppercase italic tracking-tighter text-lg text-white">Enable Adult Content</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase text-red-500">Showing Erotica and Pornographic titles.</p>
                        </div>
                        <button 
                          onClick={() => updateSetting('matureMode', !settings.matureMode)}
                          className={`w-16 h-8 rounded-full transition-all relative ${settings.matureMode ? 'bg-red-600' : 'bg-zinc-800'}`}
                        >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all ${settings.matureMode ? 'translate-x-8' : ''}`}></div>
                        </button>
                      </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 italic">Network & Proxy</h4>
                <div className="p-8 bg-zinc-900/50 rounded-4xl border border-zinc-800 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">CORS Proxy URL (Expert only)</label>
                        <input 
                          type="text" 
                          placeholder="https://api.allorigins.win/raw?url="
                          value={proxy}
                          onChange={(e) => setProxy(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-xs font-mono text-zinc-300"
                        />
                    </div>
                    <button 
                      onClick={handleProxySave}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-transform active:scale-95"
                    >
                        <Save className="w-5 h-5" /> Save Proxy Settings
                    </button>
                    <p className="text-[9px] text-zinc-700 font-bold leading-relaxed uppercase">
                      If you see "CORS Errors", set a proxy like <span className="text-primary italic">https://api.allorigins.win/raw?url=</span> to bypass browser restrictions.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SettingsPage;
