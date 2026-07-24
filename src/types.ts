export type GameScreen = 'MENU' | 'OPTIONS' | 'CHARACTER_SELECT' | 'PLAYING' | 'CREDITS';

export type ActionKey = 
  | 'moveUp'
  | 'moveDown'
  | 'moveLeft'
  | 'moveRight'
  | 'jump'
  | 'attack'
  | 'dance'
  | 'dash'
  | 'interact'
  | 'pause';

export interface KeyBinding {
  action: ActionKey;
  labelTh: string;
  labelEn: string;
  category: 'MOVEMENT' | 'COMBAT' | 'SYSTEM';
  code: string; // KeyboardEvent.code or Key name
  displayKey: string;
}

export type PresetType = 'WASD' | 'ARROWS' | 'ESDF' | 'CUSTOM';

export interface AudioSettings {
  masterVolume: number; // 0 - 100
  musicVolume: number;  // 0 - 100
  sfxVolume: number;    // 0 - 100
  muteAll: boolean;
  soundEnabled: boolean;
}

export interface GraphicsSettings {
  quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';
  fpsLimit: 30 | 60 | 120 | 144;
  showFpsCounter: boolean;
  particlesEnabled: boolean;
  bloomEnabled: boolean;
  screenFilter: 'NORMAL' | 'CYBER' | 'RETRO' | 'WARM';
}

export interface ControlSettings {
  preset: PresetType;
  bindings: Record<ActionKey, KeyBinding>;
  moveSensitivity: number; // 1 to 10
  invertY: boolean;
  autoSprint: boolean;
  showKeyHUD: boolean;
  touchControls: boolean; // Virtual d-pad for mobile/touch
}

export interface CharacterOption {
  id: string;
  nameTh: string;
  nameEn: string;
  color: string;
  trailColor: string;
  accentColor: string;
  speed: number;
  jumpPower: number;
  attackType: string;
  descriptionTh: string;
  descriptionEn: string;
  icon: string;
}
