import React from 'react';
import { CharacterOption } from '../types';
import { CHARACTERS } from '../constants/defaultSettings';
import { Shield, Zap, Sparkles, Check, Play, X } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { AudioSettings } from '../types';

interface CharacterSelectModalProps {
  selectedCharacter: CharacterOption;
  lang: 'TH' | 'EN';
  audio: AudioSettings;
  onSelectCharacter: (char: CharacterOption) => void;
  onConfirmStart: () => void;
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  selectedCharacter,
  lang,
  audio,
  onSelectCharacter,
  onConfirmStart,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-3xl p-6 sm:p-8 rounded-3xl bg-slate-950/95 border border-cyan-500/30 shadow-2xl shadow-cyan-950/80 text-white overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-black tracking-wide text-cyan-300">
              {lang === 'TH' ? 'เลือกตัวละคร (CHARACTER SELECT)' : 'SELECT YOUR HERO'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'TH' ? 'เลือกตัวละครและสไตล์การต่อสู้ก่อนเข้าสู่เกม' : 'Choose your warrior before entering the arena'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Character Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {CHARACTERS.map((char) => {
            const isSelected = selectedCharacter.id === char.id;
            return (
              <div
                key={char.id}
                onClick={() => {
                  soundEngine.playClickSound(audio);
                  onSelectCharacter(char);
                }}
                className={`cursor-pointer p-5 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/20 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 p-1 rounded-full bg-cyan-400 text-slate-950">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                {/* Avatar Icon / Glow */}
                <div className="flex flex-col items-center gap-3 py-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition transform group-hover:scale-110"
                    style={{
                      backgroundColor: `${char.color}20`,
                      borderColor: char.color,
                      borderWidth: '2px',
                    }}
                  >
                    {char.icon}
                  </div>
                  <h3 className="font-extrabold text-sm text-center text-slate-100 tracking-wide">
                    {lang === 'TH' ? char.nameTh : char.nameEn}
                  </h3>
                </div>

                {/* Stats */}
                <div className="space-y-2 border-t border-slate-800/80 pt-3 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {lang === 'TH' ? 'ความเร็ว:' : 'Speed:'}
                    </span>
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-3 rounded-sm ${
                            i < char.speed ? 'bg-cyan-400' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      {lang === 'TH' ? 'พลังโดด:' : 'Jump:'}
                    </span>
                    <div className="flex gap-1">
                      {[...Array(15)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-3 rounded-sm ${
                            i < char.jumpPower ? 'bg-cyan-400' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-rose-400" />
                      {lang === 'TH' ? 'การโจมตี:' : 'Attack:'}
                    </span>
                    <span className="font-bold text-cyan-300 text-[11px]">{char.attackType}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Hero Bio */}
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-300">
          <span className="font-bold text-cyan-300 mr-2">
            {lang === 'TH' ? 'คำอธิบายตัวละคร:' : 'Hero Description:'}
          </span>
          {lang === 'TH' ? selectedCharacter.descriptionTh : selectedCharacter.descriptionEn}
        </div>

        {/* Confirm Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-bold transition"
          >
            {lang === 'TH' ? 'ย้อนกลับ' : 'Back'}
          </button>

          <button
            onClick={() => {
              soundEngine.playClickSound(audio);
              onConfirmStart();
            }}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm tracking-wider uppercase transition shadow-lg shadow-cyan-500/30 flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            {lang === 'TH' ? 'เริ่มเล่นเกม (START GAME)' : 'ENTER GAME'}
          </button>
        </div>
      </div>
    </div>
  );
};
