import React from 'react';
import { X, Award, ShieldCheck, Heart } from 'lucide-react';
import { GAME_LOGO_URL } from '../constants/defaultSettings';

interface CreditsModalProps {
  lang: 'TH' | 'EN';
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ lang, onClose }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-950/95 border border-cyan-500/30 shadow-2xl shadow-cyan-950/80 text-white overflow-hidden text-center space-y-6">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="flex justify-center pt-2">
          <img
            src={GAME_LOGO_URL}
            alt="Game Logo"
            className="h-20 object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]"
          />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-cyan-300">
            {lang === 'TH' ? 'เครดิต และ รายละเอียดผู้พัฒนา' : 'DEVELOPMENT CREDITS'}
          </h3>
          <p className="text-xs text-slate-400">
            {lang === 'TH' ? 'สร้างด้วย React, Vite & Web Audio API' : 'Powered by React, Vite, Tailwind & Web Audio Engine'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs text-slate-300">
          <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold">
            <Award className="w-4 h-4" />
            <span>{lang === 'TH' ? 'คุณสมบัติเด่น:' : 'Core Features:'}</span>
          </div>
          <ul className="space-y-1 text-slate-400">
            <li>• {lang === 'TH' ? 'ปรับแต่งการบังคับปุ่มตัวละครได้ตามต้องการ (Full Custom Remapping)' : 'Full Keybinding Remapping'}</li>
            <li>• {lang === 'TH' ? 'แสดงผล Viewport Full Screen เต็มหน้าจอ' : 'Viewport Full Screen Layout'}</li>
            <li>• {lang === 'TH' ? 'ระบบเสียงสังเคราะห์ Web Audio API สำหรับ SFX และ BGM' : 'Interactive Web Audio Engine'}</li>
            <li>• {lang === 'TH' ? 'สนามทดลองเล่นจริงพร้อมระบบจำลองฟิสิกส์' : 'Real-time Interactive Gameplay Arena'}</li>
          </ul>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'TH' ? 'ระบบผ่านการตรวจสอบความสมบูรณ์แล้ว' : 'All Systems Verified Operational'}</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs tracking-wider uppercase transition shadow-lg shadow-cyan-500/20"
        >
          {lang === 'TH' ? 'ปิดหน้าต่าง' : 'Close'}
        </button>
      </div>
    </div>
  );
};
