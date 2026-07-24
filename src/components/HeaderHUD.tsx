import React from 'react';
import { Maximize2, Minimize2, Volume2, VolumeX, Sliders, Globe } from 'lucide-react';
import { AudioSettings } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface HeaderHUDProps {
  audio: AudioSettings;
  lang: 'TH' | 'EN';
  onToggleAudioMute: () => void;
  onChangeLang: (lang: 'TH' | 'EN') => void;
  onOpenOptions: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  audio,
  lang,
  onToggleAudioMute,
  onChangeLang,
  onOpenOptions,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(!!document.fullscreenElement);

  const toggleFullscreen = () => {
    soundEngine.playClickSound(audio);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
      {/* Brand Badge */}
      <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800/80 px-3 py-1.5 rounded-2xl backdrop-blur-md pointer-events-auto shadow-lg">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-xs font-mono font-bold tracking-widest text-slate-300">
          SYSTEM READY
        </span>
      </div>

      {/* Quick Utility Actions */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Audio Mute */}
        <button
          onClick={onToggleAudioMute}
          className="p-2.5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 transition shadow-lg backdrop-blur-md"
          title={audio.muteAll ? 'Unmute Sound' : 'Mute Sound'}
        >
          {audio.muteAll ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Language Switch */}
        <button
          onClick={() => {
            soundEngine.playClickSound(audio);
            onChangeLang(lang === 'TH' ? 'EN' : 'TH');
          }}
          className="px-3 py-2 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition shadow-lg backdrop-blur-md"
        >
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>{lang === 'TH' ? 'TH' : 'EN'}</span>
        </button>

        {/* Fullscreen Mode */}
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 transition shadow-lg backdrop-blur-md"
          title="Toggle Viewport Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Options Shortcut */}
        <button
          onClick={() => {
            soundEngine.playClickSound(audio);
            onOpenOptions();
          }}
          className="px-3.5 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20"
        >
          <Sliders className="w-4 h-4" />
          <span className="hidden sm:inline">{lang === 'TH' ? 'ตั้งค่า' : 'Options'}</span>
        </button>
      </div>
    </div>
  );
};
