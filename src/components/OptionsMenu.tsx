import React, { useState } from 'react';
import {
  ActionKey,
  AudioSettings,
  ControlSettings,
  GraphicsSettings,
  KeyBinding,
  PresetType,
} from '../types';
import {
  Gamepad2,
  Volume2,
  Monitor,
  Globe,
  RotateCcw,
  Maximize2,
  Minimize2,
  Check,
  Smartphone,
  Sliders,
  VolumeX,
  Play,
  X,
} from 'lucide-react';
import {
  ARROW_KEY_BINDINGS,
  DEFAULT_AUDIO,
  DEFAULT_CONTROLS,
  DEFAULT_GRAPHICS,
  DEFAULT_KEY_BINDINGS,
  ESDF_KEY_BINDINGS,
} from '../constants/defaultSettings';
import { soundEngine } from '../utils/soundEngine';

interface OptionsMenuProps {
  controls: ControlSettings;
  audio: AudioSettings;
  graphics: GraphicsSettings;
  lang: 'TH' | 'EN';
  onUpdateControls: (newControls: ControlSettings) => void;
  onUpdateAudio: (newAudio: AudioSettings) => void;
  onUpdateGraphics: (newGraphics: GraphicsSettings) => void;
  onChangeLang: (lang: 'TH' | 'EN') => void;
  onOpenRemapModal: (action: ActionKey) => void;
  onClose: () => void;
}

export const OptionsMenu: React.FC<OptionsMenuProps> = ({
  controls,
  audio,
  graphics,
  lang,
  onUpdateControls,
  onUpdateAudio,
  onUpdateGraphics,
  onChangeLang,
  onOpenRemapModal,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'CONTROLS' | 'AUDIO' | 'GRAPHICS' | 'GENERAL'>('CONTROLS');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(!!document.fullscreenElement);

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

  const handleApplyPreset = (preset: PresetType) => {
    soundEngine.playClickSound(audio);
    let newBindings = controls.bindings;
    if (preset === 'WASD') newBindings = { ...DEFAULT_KEY_BINDINGS };
    if (preset === 'ARROWS') newBindings = { ...ARROW_KEY_BINDINGS };
    if (preset === 'ESDF') newBindings = { ...ESDF_KEY_BINDINGS };

    onUpdateControls({
      ...controls,
      preset,
      bindings: newBindings,
    });
  };

  const categories: Array<{ id: 'MOVEMENT' | 'COMBAT' | 'SYSTEM'; titleTh: string; titleEn: string }> = [
    { id: 'MOVEMENT', titleTh: 'การเคลื่อนที่ (Movement)', titleEn: 'Movement Controls' },
    { id: 'COMBAT', titleTh: 'การต่อสู้และแอคชั่น (Combat & Actions)', titleEn: 'Combat & Actions' },
    { id: 'SYSTEM', titleTh: 'ระบบเกม (System Keys)', titleEn: 'System Commands' },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-4xl h-[90vh] sm:h-[85vh] flex flex-col rounded-3xl bg-slate-950/95 border border-cyan-500/30 shadow-2xl shadow-cyan-950/80 text-white overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-wide text-cyan-300">
                {lang === 'TH' ? 'ตั้งค่าตัวเลือก (OPTIONS)' : 'GAME OPTIONS & CONTROLS'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'TH' ? 'ปรับแต่งการบังคับปุ่มตัวละคร เสียง และการแสดงผล' : 'Customize character bindings, audio, & display'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
              <span className="hidden sm:inline">
                {isFullscreen ? (lang === 'TH' ? 'ออกจากเต็มจอ' : 'Exit Fullscreen') : (lang === 'TH' ? 'เต็มจอ' : 'Fullscreen')}
              </span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClickSound(audio);
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800/80 bg-slate-900/40 overflow-x-auto">
          <button
            onClick={() => {
              soundEngine.playClickSound(audio);
              setActiveTab('CONTROLS');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'CONTROLS'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            {lang === 'TH' ? 'การบังคับ (Controls)' : 'Character Controls'}
          </button>

          <button
            onClick={() => {
              soundEngine.playClickSound(audio);
              setActiveTab('AUDIO');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'AUDIO'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            {lang === 'TH' ? 'ระบบเสียง (Audio)' : 'Sound & Audio'}
          </button>

          <button
            onClick={() => {
              soundEngine.playClickSound(audio);
              setActiveTab('GRAPHICS');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'GRAPHICS'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4" />
            {lang === 'TH' ? 'กราฟิก (Graphics)' : 'Display & FX'}
          </button>

          <button
            onClick={() => {
              soundEngine.playClickSound(audio);
              setActiveTab('GENERAL');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'GENERAL'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            {lang === 'TH' ? 'ภาษา/ทั่วไป (General)' : 'Language & System'}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* TAB 1: CONTROLS */}
          {activeTab === 'CONTROLS' && (
            <div className="space-y-6">
              
              {/* Presets Header */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    {lang === 'TH' ? 'ชุดรูปแบบปุ่มควบคุมสำเร็จรูป (CONTROL PRESETS)' : 'CONTROL PRESETS'}
                  </span>
                  <button
                    onClick={() => {
                      soundEngine.playClickSound(audio);
                      onUpdateControls(DEFAULT_CONTROLS);
                    }}
                    className="text-xs text-slate-400 hover:text-cyan-400 transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {lang === 'TH' ? 'คืนค่าเริ่มต้น' : 'Reset Defaults'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['WASD', 'ARROWS', 'ESDF', 'CUSTOM'] as PresetType[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => handleApplyPreset(p)}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition flex flex-col items-center justify-center gap-1 ${
                        controls.preset === p
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-sm font-extrabold">{p}</span>
                      <span className="text-[10px] opacity-75">
                        {p === 'WASD' && (lang === 'TH' ? 'มาตรฐาน' : 'Standard')}
                        {p === 'ARROWS' && (lang === 'TH' ? 'ปุ่มลูกศร' : 'Arrow Keys')}
                        {p === 'ESDF' && (lang === 'TH' ? 'ถนัดซ้าย' : 'Gamer ESDF')}
                        {p === 'CUSTOM' && (lang === 'TH' ? 'กำหนดเอง' : 'Custom Config')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sensitivity & Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-300">
                      {lang === 'TH' ? 'ความไวการตอบสนองปุ่ม (Sensitivity)' : 'Control Sensitivity'}
                    </span>
                    <span className="text-cyan-400">{controls.moveSensitivity} / 10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={controls.moveSensitivity}
                    onChange={(e) => {
                      onUpdateControls({ ...controls, moveSensitivity: parseInt(e.target.value) });
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        {lang === 'TH' ? 'ปุ่มจอยสติ๊กสัมผัส (Virtual D-Pad)' : 'Touch On-Screen D-Pad'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lang === 'TH' ? 'สำหรับเล่นบนหน้าจอมือถือ/แท็บเล็ต' : 'Show touch controls on mobile devices'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playClickSound(audio);
                      onUpdateControls({ ...controls, touchControls: !controls.touchControls });
                    }}
                    className={`w-12 h-6 rounded-full transition p-1 relative ${
                      controls.touchControls ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition transform ${
                        controls.touchControls ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Keybindings List by Category */}
              {categories.map((cat) => (
                <div key={cat.id} className="space-y-3">
                  <h3 className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider pl-1">
                    {lang === 'TH' ? cat.titleTh : cat.titleEn}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(Object.keys(controls.bindings) as ActionKey[])
                      .filter((action) => controls.bindings[action].category === cat.id)
                      .map((action) => {
                        const b = controls.bindings[action];
                        return (
                          <div
                            key={action}
                            className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-200">
                                {lang === 'TH' ? b.labelTh : b.labelEn}
                              </div>
                              <div className="text-[10px] text-slate-500 tracking-wider">
                                ACTION: {action.toUpperCase()}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                soundEngine.playClickSound(audio);
                                onOpenRemapModal(action);
                              }}
                              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-extrabold text-xs tracking-wider transition border border-cyan-500/30 shadow-sm"
                            >
                              {b.displayKey}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: AUDIO */}
          {activeTab === 'AUDIO' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                    {audio.muteAll ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-200">
                      {lang === 'TH' ? 'เปิดระบบเสียงทั้งหมด (Enable Sound)' : 'Enable Master Audio'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {lang === 'TH' ? 'เปิด/ปิดเสียงเอฟเฟกต์และดนตรีประกอบ' : 'Toggle sound effects and music'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const newAudio = { ...audio, muteAll: !audio.muteAll };
                    onUpdateAudio(newAudio);
                    soundEngine.updateVolumes(newAudio);
                  }}
                  className={`w-12 h-6 rounded-full transition p-1 relative ${
                    !audio.muteAll ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition transform ${
                      !audio.muteAll ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Volume Sliders */}
              <div className="space-y-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                {/* Master */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-300">{lang === 'TH' ? 'ระดับเสียงรวม (Master Volume)' : 'Master Volume'}</span>
                    <span className="text-cyan-400">{audio.masterVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={audio.masterVolume}
                    disabled={audio.muteAll}
                    onChange={(e) => {
                      const newAudio = { ...audio, masterVolume: parseInt(e.target.value) };
                      onUpdateAudio(newAudio);
                      soundEngine.updateVolumes(newAudio);
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Music */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-300">{lang === 'TH' ? 'ดนตรีประกอบ (Music BGM)' : 'Music Volume'}</span>
                    <span className="text-cyan-400">{audio.musicVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={audio.musicVolume}
                    disabled={audio.muteAll}
                    onChange={(e) => {
                      const newAudio = { ...audio, musicVolume: parseInt(e.target.value) };
                      onUpdateAudio(newAudio);
                      soundEngine.updateVolumes(newAudio);
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* SFX */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-300">{lang === 'TH' ? 'เสียงเอฟเฟกต์ (Sound FX)' : 'Sound FX Volume'}</span>
                    <span className="text-cyan-400">{audio.sfxVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={audio.sfxVolume}
                    disabled={audio.muteAll}
                    onChange={(e) => {
                      const newAudio = { ...audio, sfxVolume: parseInt(e.target.value) };
                      onUpdateAudio(newAudio);
                      soundEngine.updateVolumes(newAudio);
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Sound Test Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    soundEngine.playKeyRemapSound(audio);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-2 border border-slate-700 transition"
                >
                  <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                  {lang === 'TH' ? 'ทดสอบเสียง (Test Sound FX)' : 'Test Sound Effect'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: GRAPHICS */}
          {activeTab === 'GRAPHICS' && (
            <div className="space-y-6">
              {/* Quality Presets */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  {lang === 'TH' ? 'คุณภาพกราฟิก (GRAPHICS PRESETS)' : 'GRAPHICS PRESETS'}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH', 'ULTRA'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        soundEngine.playClickSound(audio);
                        onUpdateGraphics({ ...graphics, quality: q });
                      }}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                        graphics.quality === q
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  {lang === 'TH' ? 'ธีมบรรยากาศหน้าจอ (SCREEN FILTER)' : 'SCREEN FILTER'}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'CYBER', labelTh: 'ไซเบอร์ นีออน', labelEn: 'Cyber Neon' },
                    { id: 'RETRO', labelTh: 'เรโทร ซินธ์', labelEn: 'Retro Synth' },
                    { id: 'WARM', labelTh: 'วอร์ม โกลว์', labelEn: 'Warm Glow' },
                    { id: 'NORMAL', labelTh: 'ปกติ', labelEn: 'Standard' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        soundEngine.playClickSound(audio);
                        onUpdateGraphics({ ...graphics, screenFilter: f.id as GraphicsSettings['screenFilter'] });
                      }}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                        graphics.screenFilter === f.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {lang === 'TH' ? f.labelTh : f.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    {lang === 'TH' ? 'แสดงตัวนับ FPS' : 'Show FPS Counter'}
                  </span>
                  <button
                    onClick={() => {
                      soundEngine.playClickSound(audio);
                      onUpdateGraphics({ ...graphics, showFpsCounter: !graphics.showFpsCounter });
                    }}
                    className={`w-12 h-6 rounded-full transition p-1 relative ${
                      graphics.showFpsCounter ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition transform ${
                        graphics.showFpsCounter ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    {lang === 'TH' ? 'เอฟเฟกต์ละอองดาว (Particles)' : 'Particle FX'}
                  </span>
                  <button
                    onClick={() => {
                      soundEngine.playClickSound(audio);
                      onUpdateGraphics({ ...graphics, particlesEnabled: !graphics.particlesEnabled });
                    }}
                    className={`w-12 h-6 rounded-full transition p-1 relative ${
                      graphics.particlesEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition transform ${
                        graphics.particlesEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GENERAL & LANGUAGE */}
          {activeTab === 'GENERAL' && (
            <div className="space-y-6">
              {/* Language Selector */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  {lang === 'TH' ? 'เลือกภาษาอินเทอร์เฟซ (INTERFACE LANGUAGE)' : 'SELECT LANGUAGE'}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      soundEngine.playClickSound(audio);
                      onChangeLang('TH');
                    }}
                    className={`p-4 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition ${
                      lang === 'TH'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🇹🇭 ภาษาไทย (Thai)
                    {lang === 'TH' && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playClickSound(audio);
                      onChangeLang('EN');
                    }}
                    className={`p-4 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition ${
                      lang === 'EN'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🇬🇧 English
                    {lang === 'EN' && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                </div>
              </div>

              {/* Reset All */}
              <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  {lang === 'TH' ? 'ล้างค่าการตั้งค่าทั้งหมด' : 'RESET ALL SETTINGS'}
                </div>
                <p className="text-xs text-slate-400">
                  {lang === 'TH'
                    ? 'รีเซ็ตปุ่มควบคุม ระดับเสียง และกราฟิกทั้งหมดกลับเป็นค่าเริ่มต้นจากโรงงาน'
                    : 'Restore all keybindings, audio volumes, and graphics options to defaults.'}
                </p>
                <button
                  onClick={() => {
                    soundEngine.playClickSound(audio);
                    onUpdateControls(DEFAULT_CONTROLS);
                    onUpdateAudio(DEFAULT_AUDIO);
                    onUpdateGraphics(DEFAULT_GRAPHICS);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-rose-600/30"
                >
                  <RotateCcw className="w-4 h-4" />
                  {lang === 'TH' ? 'คืนค่าทั้งหมด (Reset All)' : 'Reset All to Factory Defaults'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {lang === 'TH' ? 'กด ESC หรือคลิกปิดเพื่อบันทึกการตั้งค่า' : 'Press ESC or Close to apply changes'}
          </span>
          <button
            onClick={() => {
              soundEngine.playClickSound(audio);
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs tracking-wider uppercase transition shadow-lg shadow-cyan-500/30"
          >
            {lang === 'TH' ? 'เสร็จสิ้น (DONE)' : 'DONE & SAVE'}
          </button>
        </div>
      </div>
    </div>
  );
};
