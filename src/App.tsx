import React, { useState, useEffect } from 'react';
import {
  ActionKey,
  AudioSettings,
  CharacterOption,
  ControlSettings,
  GameScreen,
  GraphicsSettings,
} from './types';
import {
  CHARACTERS,
  DEFAULT_AUDIO,
  DEFAULT_CONTROLS,
  DEFAULT_GRAPHICS,
  GAME_LOGO_URL,
} from './constants/defaultSettings';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { HeaderHUD } from './components/HeaderHUD';
import { OptionsMenu } from './components/OptionsMenu';
import { KeyRemapModal } from './components/KeyRemapModal';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { GameCanvas } from './components/GameCanvas';
import { CreditsModal } from './components/CreditsModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { soundEngine } from './utils/soundEngine';
import {
  Play,
  Gamepad2,
  User,
  Info,
  LogOut,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('MENU');
  const [lang, setLang] = useState<'TH' | 'EN'>('TH');

  // Game Settings State
  const [controls, setControls] = useState<ControlSettings>(DEFAULT_CONTROLS);
  const [audio, setAudio] = useState<AudioSettings>(DEFAULT_AUDIO);
  const [graphics, setGraphics] = useState<GraphicsSettings>(DEFAULT_GRAPHICS);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterOption>(CHARACTERS[0]);

  // Modal overlays state
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [remapActionTarget, setRemapActionTarget] = useState<ActionKey | null>(null);

  // Initialize Ambient Audio on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundEngine.startAmbientBgm(audio);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [audio]);

  // Handle Key remap save callback
  const handleSaveBinding = (action: ActionKey, newCode: string, newDisplayKey: string) => {
    // Check if new code conflicts with another key action
    const updatedBindings = { ...controls.bindings };

    // Swap if conflict exists
    Object.keys(updatedBindings).forEach((k) => {
      const key = k as ActionKey;
      if (key !== action && updatedBindings[key].code === newCode) {
        // Clear conflicting key code or swap
        updatedBindings[key] = {
          ...updatedBindings[key],
          code: 'NONE',
          displayKey: 'UNBOUND',
        };
      }
    });

    updatedBindings[action] = {
      ...updatedBindings[action],
      code: newCode,
      displayKey: newDisplayKey,
    };

    setControls({
      ...controls,
      preset: 'CUSTOM',
      bindings: updatedBindings,
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-white select-none">
      
      {/* Background Animated Particle Canvas */}
      <BackgroundCanvas graphics={graphics} />

      {/* Top HUD Header */}
      <HeaderHUD
        audio={audio}
        lang={lang}
        onToggleAudioMute={() => {
          const updated = { ...audio, muteAll: !audio.muteAll };
          setAudio(updated);
          soundEngine.updateVolumes(updated);
        }}
        onChangeLang={(newLang) => setLang(newLang)}
        onOpenOptions={() => setShowOptionsModal(true)}
      />

      {/* SCREEN 1: GAMEPLAY ARENA */}
      {screen === 'PLAYING' ? (
        <ErrorBoundary onReset={() => setScreen('MENU')}>
          <GameCanvas
            character={selectedCharacter}
            controls={controls}
            graphics={graphics}
            audio={audio}
            lang={lang}
            onOpenPauseMenu={() => setShowOptionsModal(true)}
            onExitToMenu={() => setScreen('MENU')}
          />
        </ErrorBoundary>
      ) : (
        /* SCREEN 2: MAIN TITLE MENU */
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-12 px-4">
          
          {/* Top Filler for Centering */}
          <div className="h-8" />

          {/* GAME LOGO & HERO SECTION */}
          <div className="flex flex-col items-center text-center space-y-4 max-w-2xl animate-fade-in">
            {/* Main Logo Container with Floating Glow Animation */}
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-4 rounded-3xl bg-cyan-500/20 blur-xl group-hover:bg-cyan-500/30 transition duration-500 animate-pulse" />
              <img
                src={GAME_LOGO_URL}
                alt="Game Logo"
                className="relative h-28 sm:h-36 md:h-44 object-contain filter drop-shadow-[0_0_25px_rgba(6,182,212,0.6)] transform hover:scale-105 transition duration-300"
              />
            </div>

            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-extrabold tracking-widest uppercase shadow-lg shadow-cyan-950/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>
                {lang === 'TH' ? 'ระบบเข้าเล่นเกมเต็มจอ & ปรับปุ่มควบคุม' : 'FULLSCREEN TITLE & CONTROLS CONFIG'}
              </span>
            </div>
          </div>

          {/* MAIN MENU ACTION BUTTONS */}
          <div className="w-full max-w-sm space-y-3.5 animate-slide-up">
            
            {/* START GAME BUTTON */}
            <button
              onClick={() => {
                soundEngine.playClickSound(audio);
                setScreen('PLAYING');
              }}
              className="w-full group relative py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-base sm:text-lg tracking-wider uppercase shadow-xl shadow-cyan-500/30 hover:shadow-cyan-400/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6 fill-slate-950 group-hover:scale-110 transition" />
              <span>{lang === 'TH' ? 'เข้าสู่เกม (START GAME)' : 'START GAME'}</span>
            </button>

            {/* OPTIONS & CONTROLS CONFIG BUTTON */}
            <button
              onClick={() => {
                soundEngine.playClickSound(audio);
                setShowOptionsModal(true);
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white font-bold text-sm tracking-wide transition shadow-lg backdrop-blur-md flex items-center justify-center gap-2.5"
            >
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
              <span>{lang === 'TH' ? 'ตั้งค่าปุ่มตัวละคร & ตัวเลือก (OPTIONS)' : 'OPTIONS & CONTROLS'}</span>
            </button>

            {/* CHARACTER SELECT BUTTON */}
            <button
              onClick={() => {
                soundEngine.playClickSound(audio);
                setShowCharacterModal(true);
              }}
              className="w-full py-3 px-6 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm tracking-wide transition backdrop-blur-md flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-cyan-400" />
              <span>
                {lang === 'TH'
                  ? `เลือกตัวละคร: ${selectedCharacter.nameTh}`
                  : `CHARACTER: ${selectedCharacter.nameEn}`}
              </span>
            </button>

            {/* CREDITS BUTTON */}
            <button
              onClick={() => {
                soundEngine.playClickSound(audio);
                setShowCreditsModal(true);
              }}
              className="w-full py-2.5 px-6 rounded-2xl bg-slate-950/60 hover:bg-slate-900/80 text-slate-400 hover:text-slate-200 font-medium text-xs tracking-wide transition flex items-center justify-center gap-2"
            >
              <Info className="w-4 h-4" />
              <span>{lang === 'TH' ? 'เครดิตผู้พัฒนา (CREDITS)' : 'CREDITS & INFO'}</span>
            </button>
          </div>

          {/* FOOTER BAR */}
          <div className="text-center text-[11px] text-slate-500 tracking-wider">
            {lang === 'TH'
              ? 'รองรับคีย์บอร์ด, เมาส์, และปุ่มสัมผัส | พัฒนาด้วย React & Tailwind'
              : 'Supports Keyboard, Mouse, & Touch Controls | Built with React'}
          </div>
        </div>
      )}

      {/* OVERLAY MODALS */}

      {/* Options & Controls Modal */}
      {showOptionsModal && (
        <OptionsMenu
          controls={controls}
          audio={audio}
          graphics={graphics}
          lang={lang}
          onUpdateControls={(newControls) => setControls(newControls)}
          onUpdateAudio={(newAudio) => setAudio(newAudio)}
          onUpdateGraphics={(newGraphics) => setGraphics(newGraphics)}
          onChangeLang={(newLang) => setLang(newLang)}
          onOpenRemapModal={(action) => setRemapActionTarget(action)}
          onClose={() => setShowOptionsModal(false)}
        />
      )}

      {/* Keybinding Remap Modal */}
      {remapActionTarget && (
        <KeyRemapModal
          actionToRemap={remapActionTarget}
          bindings={controls.bindings}
          lang={lang}
          audio={audio}
          onSaveBinding={handleSaveBinding}
          onClose={() => setRemapActionTarget(null)}
        />
      )}

      {/* Character Select Modal */}
      {showCharacterModal && (
        <CharacterSelectModal
          selectedCharacter={selectedCharacter}
          lang={lang}
          audio={audio}
          onSelectCharacter={(char) => setSelectedCharacter(char)}
          onConfirmStart={() => {
            setShowCharacterModal(false);
            setScreen('PLAYING');
          }}
          onClose={() => setShowCharacterModal(false)}
        />
      )}

      {/* Credits Modal */}
      {showCreditsModal && (
        <CreditsModal lang={lang} onClose={() => setShowCreditsModal(false)} />
      )}
    </div>
  );
}
