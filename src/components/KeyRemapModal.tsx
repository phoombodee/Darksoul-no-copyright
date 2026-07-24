import React, { useEffect, useState } from 'react';
import { ActionKey, KeyBinding } from '../types';
import { Keyboard, AlertTriangle, Check, X, RotateCcw } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { AudioSettings } from '../types';

interface KeyRemapModalProps {
  actionToRemap: ActionKey | null;
  bindings: Record<ActionKey, KeyBinding>;
  lang: 'TH' | 'EN';
  audio: AudioSettings;
  onSaveBinding: (action: ActionKey, newCode: string, newDisplayKey: string) => void;
  onClose: () => void;
}

export const KeyRemapModal: React.FC<KeyRemapModalProps> = ({
  actionToRemap,
  bindings,
  lang,
  audio,
  onSaveBinding,
  onClose,
}) => {
  const [detectedKey, setDetectedKey] = useState<{ code: string; displayKey: string } | null>(null);
  const [conflictAction, setConflictAction] = useState<ActionKey | null>(null);

  useEffect(() => {
    if (!actionToRemap) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Don't bind Escape as primary binding if user wants to close modal with ESC
      if (e.code === 'Escape' && !detectedKey) {
        // If Escape is pressed before selecting key, close modal
        soundEngine.playClickSound(audio);
        onClose();
        return;
      }

      let display = e.key.toUpperCase();
      if (e.code === 'Space') display = 'SPACE';
      if (e.code === 'ShiftLeft') display = 'L-SHIFT';
      if (e.code === 'ShiftRight') display = 'R-SHIFT';
      if (e.code === 'ControlLeft') display = 'L-CTRL';
      if (e.code === 'ControlRight') display = 'R-CTRL';
      if (e.code === 'AltLeft') display = 'L-ALT';
      if (e.code === 'AltRight') display = 'R-ALT';
      if (e.code === 'ArrowUp') display = '↑ UP';
      if (e.code === 'ArrowDown') display = '↓ DOWN';
      if (e.code === 'ArrowLeft') display = '← LEFT';
      if (e.code === 'ArrowRight') display = '→ RIGHT';
      if (e.code.startsWith('Key')) display = e.code.replace('Key', '');
      if (e.code.startsWith('Digit')) display = e.code.replace('Digit', '');

      soundEngine.playKeyRemapSound(audio);
      setDetectedKey({ code: e.code, displayKey: display });

      // Check if key is already bound elsewhere
      const existingAction = (Object.keys(bindings) as ActionKey[]).find(
        (key) => key !== actionToRemap && bindings[key].code === e.code
      );

      if (existingAction) {
        setConflictAction(existingAction);
      } else {
        setConflictAction(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actionToRemap, bindings, audio, detectedKey, onClose]);

  if (!actionToRemap) return null;

  const currentBinding = bindings[actionToRemap];
  const targetLabel = lang === 'TH' ? currentBinding.labelTh : currentBinding.labelEn;

  const handleConfirm = () => {
    if (!detectedKey) return;
    soundEngine.playClickSound(audio);
    onSaveBinding(actionToRemap, detectedKey.code, detectedKey.displayKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl shadow-cyan-950/50 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Keyboard className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-wide text-cyan-300">
                {lang === 'TH' ? 'ตั้งค่าปุ่มคีย์บอร์ด' : 'Remap Key Binding'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'TH' ? `กำลังเปลี่ยนปุ่มสำหรับ: ${targetLabel}` : `Rebinding: ${targetLabel}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listening Key Indicator */}
        <div className="my-8 text-center">
          {!detectedKey ? (
            <div className="py-8 px-4 rounded-xl border-2 border-dashed border-cyan-500/50 bg-cyan-950/20 flex flex-col items-center justify-center gap-3 animate-pulse">
              <span className="text-3xl font-extrabold tracking-widest text-cyan-400">
                [ PRESS ANY KEY ]
              </span>
              <p className="text-sm text-slate-300">
                {lang === 'TH'
                  ? 'กดปุ่มใดๆ บนคีย์บอร์ดที่คุณต้องการใช้'
                  : 'Press any button on your keyboard to assign'}
              </p>
            </div>
          ) : (
            <div className="py-6 px-4 rounded-xl bg-slate-800/80 border border-cyan-400/60 flex flex-col items-center justify-center gap-2">
              <span className="text-xs text-slate-400 uppercase tracking-widest">
                {lang === 'TH' ? 'ปุ่มที่กด:' : 'Key Detected:'}
              </span>
              <div className="inline-block px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-black text-2xl tracking-wider shadow-lg shadow-cyan-500/30">
                {detectedKey.displayKey}
              </div>
            </div>
          )}

          {/* Conflict Warning */}
          {conflictAction && (
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                {lang === 'TH'
                  ? `ปุ่มนี้ถูกใช้แล้วโดย: ${bindings[conflictAction].labelTh} (ระบบจะทำการสลับหรือแทนที่)`
                  : `Key already bound to: ${bindings[conflictAction].labelEn} (Will replace)`}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              setDetectedKey(null);
              setConflictAction(null);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {lang === 'TH' ? 'กดใหม่' : 'Reset Input'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            {lang === 'TH' ? 'ยกเลิก' : 'Cancel'}
          </button>
          <button
            disabled={!detectedKey}
            onClick={handleConfirm}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg ${
              detectedKey
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30 cursor-pointer'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            {lang === 'TH' ? 'บันทึกปุ่มนี้' : 'Confirm Binding'}
          </button>
        </div>
      </div>
    </div>
  );
};
