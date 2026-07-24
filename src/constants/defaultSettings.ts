import { ControlSettings, AudioSettings, GraphicsSettings, CharacterOption, KeyBinding, ActionKey } from '../types';

export const DEFAULT_KEY_BINDINGS: Record<ActionKey, KeyBinding> = {
  moveUp: {
    action: 'moveUp',
    labelTh: 'เดินขึ้น / กระโดด',
    labelEn: 'Move Up / Jump',
    category: 'MOVEMENT',
    code: 'KeyW',
    displayKey: 'W',
  },
  moveDown: {
    action: 'moveDown',
    labelTh: 'เดินลง / หมอบ',
    labelEn: 'Move Down / Crouch',
    category: 'MOVEMENT',
    code: 'KeyS',
    displayKey: 'S',
  },
  moveLeft: {
    action: 'moveLeft',
    labelTh: 'เดินซ้าย',
    labelEn: 'Move Left',
    category: 'MOVEMENT',
    code: 'KeyA',
    displayKey: 'A',
  },
  moveRight: {
    action: 'moveRight',
    labelTh: 'เดินขวา',
    labelEn: 'Move Right',
    category: 'MOVEMENT',
    code: 'KeyD',
    displayKey: 'D',
  },
  jump: {
    action: 'jump',
    labelTh: 'กระโดด',
    labelEn: 'Jump',
    category: 'MOVEMENT',
    code: 'Space',
    displayKey: 'SPACE',
  },
  attack: {
    action: 'attack',
    labelTh: 'ต่อย / โจมตี (กด P)',
    labelEn: 'Punch / Attack (Press P)',
    category: 'COMBAT',
    code: 'KeyP',
    displayKey: 'P',
  },
  dance: {
    action: 'dance',
    labelTh: 'เต้นสร้าง Skill (กด O)',
    labelEn: 'Dance Skill (Press O)',
    category: 'COMBAT',
    code: 'KeyO',
    displayKey: 'O',
  },
  dash: {
    action: 'dash',
    labelTh: 'พุ่งตัว / แดช',
    labelEn: 'Dash / Sprint',
    category: 'COMBAT',
    code: 'ShiftLeft',
    displayKey: 'L-SHIFT',
  },
  interact: {
    action: 'interact',
    labelTh: 'สำรวจ / เก็บของ',
    labelEn: 'Interact / Collect',
    category: 'COMBAT',
    code: 'KeyE',
    displayKey: 'E',
  },
  pause: {
    action: 'pause',
    labelTh: 'หยุดเกม / เมนู',
    labelEn: 'Pause / Menu',
    category: 'SYSTEM',
    code: 'Escape',
    displayKey: 'ESC',
  },
};

export const ARROW_KEY_BINDINGS: Record<ActionKey, KeyBinding> = {
  ...DEFAULT_KEY_BINDINGS,
  moveUp: { ...DEFAULT_KEY_BINDINGS.moveUp, code: 'ArrowUp', displayKey: '↑ UP' },
  moveDown: { ...DEFAULT_KEY_BINDINGS.moveDown, code: 'ArrowDown', displayKey: '↓ DOWN' },
  moveLeft: { ...DEFAULT_KEY_BINDINGS.moveLeft, code: 'ArrowLeft', displayKey: '← LEFT' },
  moveRight: { ...DEFAULT_KEY_BINDINGS.moveRight, code: 'ArrowRight', displayKey: '→ RIGHT' },
  attack: { ...DEFAULT_KEY_BINDINGS.attack, code: 'KeyP', displayKey: 'P' },
  dance: { ...DEFAULT_KEY_BINDINGS.dance, code: 'KeyO', displayKey: 'O' },
  dash: { ...DEFAULT_KEY_BINDINGS.dash, code: 'KeyX', displayKey: 'X' },
  interact: { ...DEFAULT_KEY_BINDINGS.interact, code: 'KeyC', displayKey: 'C' },
};

export const ESDF_KEY_BINDINGS: Record<ActionKey, KeyBinding> = {
  ...DEFAULT_KEY_BINDINGS,
  moveUp: { ...DEFAULT_KEY_BINDINGS.moveUp, code: 'KeyE', displayKey: 'E' },
  moveDown: { ...DEFAULT_KEY_BINDINGS.moveDown, code: 'KeyD', displayKey: 'D' },
  moveLeft: { ...DEFAULT_KEY_BINDINGS.moveLeft, code: 'KeyS', displayKey: 'S' },
  moveRight: { ...DEFAULT_KEY_BINDINGS.moveRight, code: 'KeyF', displayKey: 'F' },
  interact: { ...DEFAULT_KEY_BINDINGS.interact, code: 'KeyR', displayKey: 'R' },
};

export const DEFAULT_CONTROLS: ControlSettings = {
  preset: 'WASD',
  bindings: DEFAULT_KEY_BINDINGS,
  moveSensitivity: 5,
  invertY: false,
  autoSprint: false,
  showKeyHUD: true,
  touchControls: false,
};

export const DEFAULT_AUDIO: AudioSettings = {
  masterVolume: 80,
  musicVolume: 60,
  sfxVolume: 85,
  muteAll: false,
  soundEnabled: true,
};

export const DEFAULT_GRAPHICS: GraphicsSettings = {
  quality: 'HIGH',
  fpsLimit: 60,
  showFpsCounter: true,
  particlesEnabled: true,
  bloomEnabled: true,
  screenFilter: 'CYBER',
};

export const CHARACTERS: CharacterOption[] = [
  {
    id: 'cyber_hero',
    nameTh: 'ไซเบอร์ ไนท์ (Cyber Knight)',
    nameEn: 'Cyber Knight',
    color: '#06b6d4', // Cyan
    trailColor: 'rgba(6, 182, 212, 0.4)',
    accentColor: '#22d3ee',
    speed: 7,
    jumpPower: 12,
    attackType: 'Energy Blade',
    descriptionTh: 'อัศวินไซเบอร์ความเร็วสูง โจมตีด้วยดาบพลังงานแสง',
    descriptionEn: 'High-speed cyber warrior wielding energy blades.',
    icon: '⚔️',
  },
  {
    id: 'blaze_striker',
    nameTh: 'เฟลม สไตรเกอร์ (Blaze Striker)',
    nameEn: 'Blaze Striker',
    color: '#f97316', // Orange
    trailColor: 'rgba(249, 115, 22, 0.4)',
    accentColor: '#fb923c',
    speed: 6,
    jumpPower: 14,
    attackType: 'Plasma Blast',
    descriptionTh: 'นักรบพลังเพลิง โดดเด่นเรื่องการกระโดดสูงและพลังทำลายล้าง',
    descriptionEn: 'Fire striker specializing in high jump and plasma burst.',
    icon: '🔥',
  },
  {
    id: 'shadow_ninja',
    nameTh: 'สเปกเตอร์ นินจา (Specter Ninja)',
    nameEn: 'Specter Ninja',
    color: '#a855f7', // Purple
    trailColor: 'rgba(168, 85, 247, 0.4)',
    accentColor: '#c084fc',
    speed: 9,
    jumpPower: 11,
    attackType: 'Shadow Dash',
    descriptionTh: 'นินจาเงาเคลื่อนที่ว่องไว มีความเร็วแดชสูงเป็นพิเศษ',
    descriptionEn: 'Phantom assassin with extreme mobility and shadow dash.',
    icon: '⚡',
  },
];

export const GAME_LOGO_URL = 'https://res.cloudinary.com/dgkx0llhf/image/upload/v1783489386/logo_i8827v_k4lnkz.png';
