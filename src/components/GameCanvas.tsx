import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { CharacterOption, ControlSettings, GraphicsSettings, AudioSettings } from '../types';
import { soundEngine } from '../utils/soundEngine';
import {
  Sliders,
  RotateCcw,
  Crosshair,
  Heart,
  Skull,
  RefreshCw,
  Trophy,
  Crown,
  Sparkles,
  Flame,
  Zap,
} from 'lucide-react';

interface GameCanvasProps {
  character: CharacterOption;
  controls: ControlSettings;
  graphics: GraphicsSettings;
  audio: AudioSettings;
  lang: 'TH' | 'EN';
  onOpenPauseMenu: () => void;
  onExitToMenu: () => void;
}

const GROUND_TEXTURE_URL = 'https://res.cloudinary.com/dgkx0llhf/image/upload/v1783489874/ground_d1kjrx_u7acvh.png';
const PLAYER_SPRITE_URL = 'https://res.cloudinary.com/dgkx0llhf/image/upload/v1782713483/player_zolbhw.png';
const ENEMY_SPRITE_URL = 'https://res.cloudinary.com/dgkx0llhf/image/upload/v1782713524/enemy_hzgces.png';
const POTION_SPRITE_URL = 'https://res.cloudinary.com/dgkx0llhf/image/upload/v1782713526/potion_rjbae3.png';
const BOSS_SPRITE_URL = 'https://res.cloudinary.com/dgkx0llhf/image/upload/v1782713525/boss_dmspxv.png';

// -------------------------------------------------------------
// SAFE TEXTURE HOOK WITH PROCEDURAL FALLBACK
// -------------------------------------------------------------
function useTextureWithFallback(
  url: string,
  sheetType: 'ground' | 'player' | 'enemy' | 'potion' | 'boss'
) {
  const [texture, setTexture] = useState<THREE.Texture>(() => {
    const canvas = document.createElement('canvas');
    canvas.width = sheetType === 'ground' ? 512 : 1024;
    canvas.height = sheetType === 'ground' ? 512 : sheetType === 'enemy' || sheetType === 'boss' ? 512 : 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (sheetType === 'potion') {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(512, 512, 300, 0, Math.PI * 2);
        ctx.fill();
      } else if (sheetType === 'boss') {
        ctx.fillStyle = '#9333ea';
        ctx.fillRect(0, 0, 1024, 512);
      } else if (sheetType === 'enemy') {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(0, 0, 1024, 512);
      } else if (sheetType === 'player') {
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(0, 0, 1024, 1024);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillRect(256, 256, 256, 256);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    if (sheetType === 'player') {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(0.25, 0.25);
    } else if (sheetType === 'enemy' || sheetType === 'boss') {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(0.25, 0.50);
    } else if (sheetType === 'potion') {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(1.0, 1.0);
    } else {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(10, 10);
    }
    tex.needsUpdate = true;
    return tex;
  });

  useEffect(() => {
    let active = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    loader.load(
      url,
      (loadedTex) => {
        if (!active) return;
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        if (sheetType === 'player') {
          loadedTex.wrapS = THREE.ClampToEdgeWrapping;
          loadedTex.wrapT = THREE.ClampToEdgeWrapping;
          loadedTex.repeat.set(0.25, 0.25);
        } else if (sheetType === 'enemy' || sheetType === 'boss') {
          loadedTex.wrapS = THREE.ClampToEdgeWrapping;
          loadedTex.wrapT = THREE.ClampToEdgeWrapping;
          loadedTex.repeat.set(0.25, 0.50);
        } else if (sheetType === 'potion') {
          loadedTex.wrapS = THREE.ClampToEdgeWrapping;
          loadedTex.wrapT = THREE.ClampToEdgeWrapping;
          loadedTex.repeat.set(1.0, 1.0);
        } else {
          loadedTex.wrapS = THREE.RepeatWrapping;
          loadedTex.wrapT = THREE.RepeatWrapping;
          loadedTex.repeat.set(10, 10);
        }
        loadedTex.needsUpdate = true;
        setTexture(loadedTex);
      },
      undefined,
      (err) => {
        console.warn('Texture load fallback active for:', url, err);
      }
    );

    return () => {
      active = false;
    };
  }, [url, sheetType]);

  return texture;
}

// -------------------------------------------------------------
// GROUND PLANE COMPONENT (50x50 with Tiling Texture)
// -------------------------------------------------------------
const GroundPlane: React.FC = () => {
  const texture = useTextureWithFallback(GROUND_TEXTURE_URL, 'ground');

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Boundary Grid */}
      <gridHelper args={[50, 50, '#06b6d4', '#1e293b']} position={[0, 0.01, 0]} />

      {/* Border Pillars */}
      {[-25, 25].map((x) =>
        [-25, 25].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 1, z]}>
            <cylinderGeometry args={[0.3, 0.4, 2, 8]} />
            <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} />
          </mesh>
        ))
      )}
    </group>
  );
};

// -------------------------------------------------------------
// HEALTH POTION ITEM COMPONENT
// -------------------------------------------------------------
const HealthPotionItem: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const potionTexture = useTextureWithFallback(POTION_SPRITE_URL, 'potion');
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <pointLight color="#10b981" intensity={2} distance={3} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
        <ringGeometry args={[0.2, 0.6, 16]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.5} />
      </mesh>
      <Billboard lockX={false} lockY={false} lockZ={false}>
        <mesh scale={[1.2, 1.2, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={potionTexture} transparent side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
    </group>
  );
};

// -------------------------------------------------------------
// WARP PORTAL COMPONENT (Spawns when Boss is defeated)
// -------------------------------------------------------------
const WarpPortal: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const ringRef = useRef<THREE.Mesh>(null!);
  const lightBeamRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 2;
    }
    if (lightBeamRef.current) {
      lightBeamRef.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group position={position}>
      {/* Ground Glow Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.3, 2.2, 32]} />
        <meshBasicMaterial color="#a855f7" side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>

      {/* Rotating Portal Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[0.8, 1.8, 32]} />
        <meshBasicMaterial color="#c084fc" side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>

      {/* Light Column Beam */}
      <mesh ref={lightBeamRef} position={[0, 2.5, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 5, 16, 1, true]} />
        <meshBasicMaterial color="#e9d5ff" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      <pointLight color="#a855f7" intensity={4} distance={10} />
    </group>
  );
};

// -------------------------------------------------------------
// FIREBALL IMPACT & WARNING COMPONENT
// -------------------------------------------------------------
export interface FireballTarget {
  id: number;
  pos: [number, number, number];
  timer: number; // 1.0s warning countdown
  exploded: boolean;
}

const FireballWarningAndImpact: React.FC<{ fireball: FireballTarget }> = ({ fireball }) => {
  const progress = Math.min(1.0, 1.0 - fireball.timer); // 0 to 1

  return (
    <group position={fireball.pos}>
      {/* Ground Warning Ring */}
      {!fireball.exploded && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[0.2, 1.6, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.3 + progress * 0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Pulsing Warning Inner Disc */}
      {!fireball.exploded && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <circleGeometry args={[1.5 * progress, 32]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Falling Fireball Sphere */}
      {!fireball.exploded && (
        <mesh position={[0, Math.max(0, fireball.timer * 12), 0]}>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshBasicMaterial color="#f97316" />
        </mesh>
      )}

      {/* Explosion Blast Ring */}
      {fireball.exploded && (
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[1.8, 16, 16]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
};

// -------------------------------------------------------------
// DANCE SKILL PARTICLES EFFECT
// -------------------------------------------------------------
const SkillParticles: React.FC<{ active: boolean; position: [number, number, number]; color: string }> = ({
  active,
  position,
  color,
}) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 120;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const baseColor = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      const radius = 0.5 + Math.random() * 2.5;
      const angle = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.random() * 3.5;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      col[i * 3] = baseColor.r + (Math.random() - 0.5) * 0.3;
      col[i * 3 + 1] = baseColor.g + (Math.random() - 0.5) * 0.3;
      col[i * 3 + 2] = baseColor.b + (Math.random() - 0.5) * 0.3;
    }
    return [pos, col];
  }, [count, color]);

  useFrame((_, delta) => {
    if (!pointsRef.current || !active) return;
    pointsRef.current.rotation.y += delta * 3;
    const posAttr = pointsRef.current.geometry?.attributes?.position;
    if (!posAttr) return;
    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i) + delta * 2;
      if (y > 3.5) y = 0;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.25} vertexColors transparent opacity={0.9} blending={THREE.AdditiveBlending} />
    </points>
  );
};

// -------------------------------------------------------------
// ATTACK SLASH EFFECT COMPONENT
// -------------------------------------------------------------
const AttackWave: React.FC<{ active: boolean; position: [number, number, number]; facingLeft: boolean; color: string }> = ({
  active,
  position,
  facingLeft,
  color,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (meshRef.current && active) {
      meshRef.current.scale.x += delta * 8;
      meshRef.current.scale.y += delta * 8;
    }
  });

  if (!active) return null;

  const offsetX = facingLeft ? -1.5 : 1.5;

  return (
    <mesh ref={meshRef} position={[position[0] + offsetX, position[1] + 1.2, position[2]]} rotation={[0, 0, facingLeft ? Math.PI : 0]}>
      <ringGeometry args={[0.8, 1.2, 32, 1, 0, Math.PI * 0.8]} />
      <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
    </mesh>
  );
};

// -------------------------------------------------------------
// REGULAR ENEMY CHARACTER
// -------------------------------------------------------------
export interface EnemyData {
  id: number;
  pos: [number, number, number];
  facingLeft: boolean;
  row: number; // 0: Idle, 1: Walk
  frame: number;
  hits: number; // 0: healthy, 1: knocked back, 2: dead
  flashRedTimer: number;
  flashWhiteTimer: number;
  isDying: boolean;
}

const EnemyCharacter: React.FC<{
  enemy: EnemyData;
  texture: THREE.Texture;
}> = ({ enemy, texture }) => {
  const enemyTex = useMemo(() => {
    const tex = texture.clone();
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(0.25, 0.50); // 4 cols x 2 rows
    tex.needsUpdate = true;
    return tex;
  }, [texture]);

  enemyTex.offset.x = enemy.frame * 0.25;
  enemyTex.offset.y = 1.0 - (enemy.row + 1) * 0.50;

  const isRed = enemy.flashRedTimer > 0;
  const isWhite = enemy.flashWhiteTimer > 0;

  let tintColor = '#ffffff';
  if (isWhite) tintColor = '#ffffff';
  else if (isRed) tintColor = '#ef4444';

  const opacity = enemy.isDying ? Math.max(0.1, enemy.flashWhiteTimer / 0.4) : 1.0;

  return (
    <group position={[enemy.pos[0], 1.25, enemy.pos[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <circleGeometry args={[0.8, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      <Billboard lockX={false} lockY={false} lockZ={false}>
        <mesh scale={[enemy.facingLeft ? 2.2 : -2.2, 2.2, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={enemyTex} transparent color={tintColor} opacity={opacity} side={THREE.DoubleSide} />
        </mesh>
      </Billboard>

      <Billboard position={[0, 1.8, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.2, 0.2]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[enemy.hits === 0 ? 0 : -0.3, 0, 0.01]}>
          <planeGeometry args={[enemy.hits === 0 ? 1.1 : 0.55, 0.15]} />
          <meshBasicMaterial color={enemy.hits === 0 ? '#ef4444' : '#f59e0b'} />
        </mesh>
      </Billboard>
    </group>
  );
};

// -------------------------------------------------------------
// BOSS CHARACTER COMPONENT
// -------------------------------------------------------------
export interface BossData {
  pos: [number, number, number];
  hp: number; // Max 15 HP
  maxHp: number;
  facingLeft: boolean;
  row: number; // 0: Hover/Idle, 1: Telegraph/Attack
  frame: number;
  scalePulse: number; // Expansion pulse during telegraph
  state: 'idle' | 'dash' | 'telegraph' | 'attack';
  stateTimer: number;
  flashRedTimer: number;
  flashWhiteTimer: number;
  isDying: boolean;
}

const BossCharacter: React.FC<{
  boss: BossData;
  texture: THREE.Texture;
}> = ({ boss, texture }) => {
  const bossTex = useMemo(() => {
    const tex = texture.clone();
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(0.25, 0.50); // 4 cols x 2 rows
    tex.needsUpdate = true;
    return tex;
  }, [texture]);

  bossTex.offset.x = boss.frame * 0.25;
  bossTex.offset.y = 1.0 - (boss.row + 1) * 0.50;

  const isRed = boss.flashRedTimer > 0;
  const isWhite = boss.flashWhiteTimer > 0;

  let tintColor = '#ffffff';
  if (isWhite) tintColor = '#ffffff';
  else if (isRed) tintColor = '#ef4444';

  const baseScale = 4.2 * boss.scalePulse;

  return (
    <group position={[boss.pos[0], boss.pos[1], boss.pos[2]]}>
      {/* Ground Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -boss.pos[1] + 0.02, 0]}>
        <circleGeometry args={[1.8, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.5} />
      </mesh>

      {/* Boss Red Light */}
      <pointLight color="#ef4444" intensity={4} distance={12} />

      {/* 2D Billboard Boss */}
      <Billboard lockX={false} lockY={false} lockZ={false}>
        <mesh scale={[boss.facingLeft ? baseScale : -baseScale, baseScale, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={bossTex}
            transparent
            color={tintColor}
            opacity={boss.isDying ? Math.max(0.1, boss.flashWhiteTimer / 0.5) : 1.0}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Billboard>
    </group>
  );
};

// -------------------------------------------------------------
// 3D GAME SCENE WITH CAMERA, PLAYER, ENEMIES, BOSS & PORTAL
// -------------------------------------------------------------
interface SceneProps {
  character: CharacterOption;
  controls: ControlSettings;
  audio: AudioSettings;
  pressedKeys: Set<string>;
  playerHp: number;
  isGameOver: boolean;
  enemiesKilled: number;
  onTakeDamage: () => void;
  onHeal: () => void;
  onScoreUpdate: (add: number) => void;
  onEnemyKilled: () => void;
  onBossSpawned: () => void;
  onBossDefeated: () => void;
  onEnterPortal: () => void;
  onFpsUpdate: (fps: number) => void;
}

interface PotionData {
  id: number;
  pos: [number, number, number];
}

const GameScene: React.FC<SceneProps> = ({
  character,
  controls,
  audio,
  pressedKeys,
  playerHp,
  isGameOver,
  enemiesKilled,
  onTakeDamage,
  onHeal,
  onScoreUpdate,
  onEnemyKilled,
  onBossSpawned,
  onBossDefeated,
  onEnterPortal,
  onFpsUpdate,
}) => {
  // Player 3D Position & Animation Refs
  const playerPos = useRef<[number, number, number]>([0, 0, 0]);
  const [facingLeft, setFacingLeft] = useState(false);
  const animRowRef = useRef<number>(0); // 0: Idle, 1: Walk, 2: Attack, 3: Dance
  const animFrameRef = useRef<number>(0);

  // Attack & Dance State
  const [isAttacking, setIsAttacking] = useState(false);
  const [isDancing, setIsDancing] = useState(false);

  // Invincibility Cooldown
  const invincibleTimerRef = useRef(0);
  const [isInvincibleVisual, setIsInvincibleVisual] = useState(false);

  // Regular Enemies state
  const [enemies, setEnemies] = useState<EnemyData[]>([
    { id: 1, pos: [6, 0, -6], facingLeft: true, row: 0, frame: 0, hits: 0, flashRedTimer: 0, flashWhiteTimer: 0, isDying: false },
    { id: 2, pos: [-8, 0, 8], facingLeft: false, row: 0, frame: 0, hits: 0, flashRedTimer: 0, flashWhiteTimer: 0, isDying: false },
  ]);

  // Boss state
  const [bossState, setBossState] = useState<'not_spawned' | 'active' | 'defeated'>('not_spawned');
  const [boss, setBoss] = useState<BossData | null>(null);

  // Fireballs
  const [fireballs, setFireballs] = useState<FireballTarget[]>([]);

  // Warp Portal
  const [warpPortalPos, setWarpPortalPos] = useState<[number, number, number] | null>(null);

  // Potions state
  const [potions, setPotions] = useState<PotionData[]>([
    { id: 1, pos: [-5, 0.8, -8] },
    { id: 2, pos: [8, 0.8, -12] },
  ]);

  // Textures
  const spriteTexture = useTextureWithFallback(PLAYER_SPRITE_URL, 'player');
  const enemyTexture = useTextureWithFallback(ENEMY_SPRITE_URL, 'enemy');
  const bossTexture = useTextureWithFallback(BOSS_SPRITE_URL, 'boss');

  // Timers
  const animTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const fpsTimeRef = useRef(performance.now());
  const enemySpawnTimerRef = useRef(0);
  const potionSpawnTimerRef = useRef(0);
  const enemyAnimTimeRef = useRef(0);
  const bossAnimTimeRef = useRef(0);
  const nextIdRef = useRef(10);

  // Input & Main Game Loop
  useFrame((state, delta) => {
    if (isGameOver) return;

    // --- FPS COUNTER ---
    frameCountRef.current++;
    const now = performance.now();
    if (now - fpsTimeRef.current >= 1000) {
      onFpsUpdate(frameCountRef.current);
      frameCountRef.current = 0;
      fpsTimeRef.current = now;
    }

    // --- INVINCIBILITY COOLDOWN ---
    if (invincibleTimerRef.current > 0) {
      invincibleTimerRef.current -= delta;
      setIsInvincibleVisual(Math.floor(state.clock.elapsedTime * 20) % 2 === 0);
      if (invincibleTimerRef.current <= 0) {
        setIsInvincibleVisual(false);
      }
    }

    const bindings = controls.bindings;

    // Check Pressed Action Keys
    const upPressed =
      pressedKeys.has('KeyW') ||
      pressedKeys.has('ArrowUp') ||
      pressedKeys.has(bindings.moveUp.code);
    const downPressed =
      pressedKeys.has('KeyS') ||
      pressedKeys.has('ArrowDown') ||
      pressedKeys.has(bindings.moveDown.code);
    const leftPressed =
      pressedKeys.has('KeyA') ||
      pressedKeys.has('ArrowLeft') ||
      pressedKeys.has(bindings.moveLeft.code);
    const rightPressed =
      pressedKeys.has('KeyD') ||
      pressedKeys.has('ArrowRight') ||
      pressedKeys.has(bindings.moveRight.code);

    const attackPressed =
      pressedKeys.has('KeyP') ||
      pressedKeys.has('KeyJ') ||
      pressedKeys.has(bindings.attack.code);
    const dancePressed =
      pressedKeys.has('KeyO') ||
      pressedKeys.has('KeyK') ||
      (bindings.dance && pressedKeys.has(bindings.dance.code));

    // Movement Vectors (8 directions)
    let dx = 0;
    let dz = 0;

    if (upPressed) dz -= 1;
    if (downPressed) dz += 1;
    if (leftPressed) dx -= 1;
    if (rightPressed) dx += 1;

    if (dx !== 0 && dz !== 0) {
      dx *= 0.7071;
      dz *= 0.7071;
    }

    const speed = character.speed * 1.2 * (controls.moveSensitivity / 5);

    // Player Actions (Attack P, Dance O)
    if (attackPressed && !isAttacking) {
      setIsAttacking(true);
      animRowRef.current = 2; // Row 2: Attack
      soundEngine.playAttackSound(audio);

      // 1. Check combat hit on regular enemies
      setEnemies((prev) =>
        prev.map((e) => {
          if (e.isDying) return e;
          const dist = Math.hypot(e.pos[0] - playerPos.current[0], e.pos[2] - playerPos.current[2]);
          if (dist < 3.2) {
            const dirX = e.pos[0] - playerPos.current[0] || 1;
            const dirZ = e.pos[2] - playerPos.current[2] || 0;
            const norm = Math.hypot(dirX, dirZ);

            if (e.hits === 0) {
              const newX = Math.max(-23, Math.min(23, e.pos[0] + (dirX / norm) * 2.5));
              const newZ = Math.max(-23, Math.min(23, e.pos[2] + (dirZ / norm) * 2.5));
              onScoreUpdate(100);
              return {
                ...e,
                hits: 1,
                pos: [newX, e.pos[1], newZ] as [number, number, number],
                flashRedTimer: 0.3,
              };
            } else {
              onScoreUpdate(200);
              onEnemyKilled();
              soundEngine.playEnemyDeathSound(audio);
              return {
                ...e,
                hits: 2,
                isDying: true,
                flashWhiteTimer: 0.4,
              };
            }
          }
          return e;
        })
      );

      // 2. Check combat hit on Boss
      if (boss && bossState === 'active' && !boss.isDying) {
        const bossDist = Math.hypot(boss.pos[0] - playerPos.current[0], boss.pos[2] - playerPos.current[2]);
        if (bossDist < 3.8) {
          const nextHp = boss.hp - 1;
          onScoreUpdate(300);
          soundEngine.playDamageSound(audio);

          if (nextHp <= 0) {
            // Boss Defeated!
            soundEngine.playEnemyDeathSound(audio);
            onScoreUpdate(2500);
            onBossDefeated();
            setBossState('defeated');

            // Spawn Warp Portal
            const portalPos: [number, number, number] = [boss.pos[0], 0, boss.pos[2]];
            setWarpPortalPos(portalPos);

            setBoss({
              ...boss,
              hp: 0,
              isDying: true,
              flashWhiteTimer: 0.8,
            });
          } else {
            setBoss({
              ...boss,
              hp: nextHp,
              flashRedTimer: 0.3,
            });
          }
        }
      }

      setTimeout(() => {
        setIsAttacking(false);
        animRowRef.current = 0;
      }, 400);
    } else if (dancePressed && !isDancing) {
      setIsDancing(true);
      animRowRef.current = 3; // Row 3: Dance
      soundEngine.playDanceSkillSound(audio);
      onScoreUpdate(50);

      setTimeout(() => {
        setIsDancing(false);
        animRowRef.current = 0;
      }, 800);
    }

    // Determine Animation Row & Facing Direction
    if (!isAttacking && !isDancing) {
      if (dx !== 0 || dz !== 0) {
        animRowRef.current = 1; // Row 1: Walk
        playerPos.current[0] = Math.max(-24, Math.min(24, playerPos.current[0] + dx * speed * delta));
        playerPos.current[2] = Math.max(-24, Math.min(24, playerPos.current[2] + dz * speed * delta));

        if (dx < 0) setFacingLeft(true);
        if (dx > 0) setFacingLeft(false);
      } else {
        animRowRef.current = 0; // Row 0: Idle
      }
    }

    // --- PLAYER SPRITE FRAME TICK ---
    animTimeRef.current += delta;
    if (animTimeRef.current > 0.12) {
      animTimeRef.current = 0;
      animFrameRef.current = (animFrameRef.current + 1) % 4;
    }

    if (spriteTexture) {
      spriteTexture.offset.x = animFrameRef.current * 0.25;
      spriteTexture.offset.y = 1.0 - (animRowRef.current + 1) * 0.25;
    }

    // --- POTION COLLECTION CHECK ---
    setPotions((prev) =>
      prev.filter((potion) => {
        const dist = Math.hypot(
          potion.pos[0] - playerPos.current[0],
          potion.pos[2] - playerPos.current[2]
        );
        if (dist < 1.4) {
          onHeal();
          onScoreUpdate(100);
          soundEngine.playHealSound(audio);
          return false;
        }
        return true;
      })
    );

    // --- WARP PORTAL ENTER CHECK ---
    if (warpPortalPos) {
      const portalDist = Math.hypot(
        warpPortalPos[0] - playerPos.current[0],
        warpPortalPos[2] - playerPos.current[2]
      );
      if (portalDist < 1.6) {
        onEnterPortal();
      }
    }

    // --- PERIODIC POTION SPAWNING ---
    potionSpawnTimerRef.current += delta;
    if (potionSpawnTimerRef.current > 7.0) {
      potionSpawnTimerRef.current = 0;
      setPotions((prev) => {
        if (prev.length >= 4) return prev;
        const randX = (Math.random() - 0.5) * 40;
        const randZ = (Math.random() - 0.5) * 40;
        nextIdRef.current++;
        return [...prev, { id: nextIdRef.current, pos: [randX, 0.8, randZ] as [number, number, number] }];
      });
    }

    // --- SPAWN BOSS CONDITION (KILLS >= 10) ---
    if (enemiesKilled >= 10 && bossState === 'not_spawned') {
      setBossState('active');
      onBossSpawned();
      soundEngine.playBossSpawnSound(audio);

      const spawnBossX = playerPos.current[0];
      const spawnBossZ = Math.max(-20, playerPos.current[2] - 14);

      setBoss({
        pos: [spawnBossX, 2.5, spawnBossZ],
        hp: 15,
        maxHp: 15,
        facingLeft: true,
        row: 0, // Row 0: Hover
        frame: 0,
        scalePulse: 1.0,
        state: 'idle',
        stateTimer: 2.0,
        flashRedTimer: 0,
        flashWhiteTimer: 0,
        isDying: false,
      });
    }

    // --- PERIODIC ENEMY SPAWNING (RANDOM BORDER 360° EVERY 1-3 SECONDS) ---
    enemySpawnTimerRef.current += delta;
    const spawnInterval = 1.0 + Math.random() * 2.0; // 1-3s
    if (enemySpawnTimerRef.current > spawnInterval) {
      enemySpawnTimerRef.current = 0;
      setEnemies((prev) => {
        if (prev.length >= 12) return prev; // Max 12 enemies
        const angle = Math.random() * Math.PI * 2;
        const dist = 22 + Math.random() * 3;
        const spawnX = Math.max(-23, Math.min(23, playerPos.current[0] + Math.cos(angle) * dist));
        const spawnZ = Math.max(-23, Math.min(23, playerPos.current[2] + Math.sin(angle) * dist));
        nextIdRef.current++;
        return [
          ...prev,
          {
            id: nextIdRef.current,
            pos: [spawnX, 0, spawnZ] as [number, number, number],
            facingLeft: spawnX > playerPos.current[0],
            row: 1,
            frame: 0,
            hits: 0,
            flashRedTimer: 0,
            flashWhiteTimer: 0,
            isDying: false,
          },
        ];
      });
    }

    // --- ENEMY AI MOVEMENT & COLLISION TICK ---
    enemyAnimTimeRef.current += delta;
    const shouldTickEnemyAnim = enemyAnimTimeRef.current > 0.15;
    if (shouldTickEnemyAnim) enemyAnimTimeRef.current = 0;

    setEnemies((prev) =>
      prev
        .map((e) => {
          let redTimer = Math.max(0, e.flashRedTimer - delta);
          let whiteTimer = Math.max(0, e.flashWhiteTimer - delta);

          if (e.isDying) {
            return {
              ...e,
              flashWhiteTimer: whiteTimer,
            };
          }

          const edx = playerPos.current[0] - e.pos[0];
          const edz = playerPos.current[2] - e.pos[2];
          const distToPlayer = Math.hypot(edx, edz);

          let newX = e.pos[0];
          let newZ = e.pos[2];
          let faceLeft = e.facingLeft;
          let row = 0;

          if (distToPlayer > 0.8) {
            const enemySpeed = 1.8;
            newX += (edx / distToPlayer) * enemySpeed * delta;
            newZ += (edz / distToPlayer) * enemySpeed * delta;
            faceLeft = edx < 0;
            row = 1;
          }

          let newFrame = e.frame;
          if (shouldTickEnemyAnim) {
            newFrame = (e.frame + 1) % 4;
          }

          if (distToPlayer < 1.2 && invincibleTimerRef.current <= 0 && playerHp > 0) {
            invincibleTimerRef.current = 0.9;
            onTakeDamage();
            soundEngine.playDamageSound(audio);
            redTimer = 0.4;

            playerPos.current[0] = Math.max(-24, Math.min(24, playerPos.current[0] + (edx / (distToPlayer || 1)) * -1.2));
            playerPos.current[2] = Math.max(-24, Math.min(24, playerPos.current[2] + (edz / (distToPlayer || 1)) * -1.2));
          }

          return {
            ...e,
            pos: [newX, 0, newZ] as [number, number, number],
            facingLeft: faceLeft,
            row,
            frame: newFrame,
            flashRedTimer: redTimer,
            flashWhiteTimer: whiteTimer,
          };
        })
        .filter((e) => !e.isDying || e.flashWhiteTimer > 0)
    );

    // --- BOSS AI STATE MACHINE & ATTACK TICK ---
    if (boss && bossState === 'active') {
      bossAnimTimeRef.current += delta;
      const shouldTickBossAnim = bossAnimTimeRef.current > 0.14;
      if (shouldTickBossAnim) bossAnimTimeRef.current = 0;

      let nextFrame = boss.frame;
      if (shouldTickBossAnim) {
        nextFrame = (boss.frame + 1) % 4;
      }

      let redTimer = Math.max(0, boss.flashRedTimer - delta);
      let whiteTimer = Math.max(0, boss.flashWhiteTimer - delta);

      if (boss.isDying) {
        setBoss({
          ...boss,
          frame: nextFrame,
          flashWhiteTimer: whiteTimer,
        });
      } else {
        let bState = boss.state;
        let bTimer = boss.stateTimer - delta;
        let bRow = boss.row;
        let bScalePulse = 1.0;

        let bX = boss.pos[0];
        let bY = 2.2 + Math.sin(state.clock.elapsedTime * 3) * 0.3; // Floating hovering Y
        let bZ = boss.pos[2];

        const bdx = playerPos.current[0] - bX;
        const bdz = playerPos.current[2] - bZ;
        const bDist = Math.hypot(bdx, bdz);
        const bFacingLeft = bdx < 0;

        // Pattern Loop: IDLE -> DASH -> TELEGRAPH -> ATTACK (FIREBALLS) -> IDLE
        if (bState === 'idle') {
          bRow = 0; // Row 0: Hover
          bX += (bdx / (bDist || 1)) * 1.0 * delta;
          bZ += (bdz / (bDist || 1)) * 1.0 * delta;

          if (bTimer <= 0) {
            bState = 'dash';
            bTimer = 1.2;
          }
        } else if (bState === 'dash') {
          bRow = 0;
          // Fast glide
          const dashSpeed = bDist > 6 ? 4.5 : -3.0; // Dash closer or pull back
          bX += (bdx / (bDist || 1)) * dashSpeed * delta;
          bZ += (bdz / (bDist || 1)) * dashSpeed * delta;

          if (bTimer <= 0) {
            bState = 'telegraph';
            bTimer = 1.2; // 1.2s warning telegraph
          }
        } else if (bState === 'telegraph') {
          bRow = 1; // Row 1: Attack wind-up
          // Expanding & contracting scale pulse
          bScalePulse = 1.0 + Math.sin(state.clock.elapsedTime * 22) * 0.25;

          if (bTimer <= 0) {
            bState = 'attack';
            bTimer = 0.8;

            // SHOOT 4 FIREBALLS AROUND PLAYER WITH WARNING RINGS
            soundEngine.playFireballSound(audio);
            const newFireballs: FireballTarget[] = [];
            const targetsCount = 4;

            for (let i = 0; i < targetsCount; i++) {
              nextIdRef.current++;
              const offsetAngle = (i / targetsCount) * Math.PI * 2 + Math.random() * 0.5;
              const offsetRadius = 0.8 + Math.random() * 4.5;
              const targetX = Math.max(-23, Math.min(23, playerPos.current[0] + Math.cos(offsetAngle) * offsetRadius));
              const targetZ = Math.max(-23, Math.min(23, playerPos.current[2] + Math.sin(offsetAngle) * offsetRadius));

              newFireballs.push({
                id: nextIdRef.current,
                pos: [targetX, 0, targetZ],
                timer: 1.0, // 1.0s warning before impact
                exploded: false,
              });
            }

            setFireballs((prev) => [...prev, ...newFireballs]);
          }
        } else if (bState === 'attack') {
          bRow = 1;
          if (bTimer <= 0) {
            bState = 'idle';
            bTimer = 2.0;
          }
        }

        // Clamp Boss inside map boundary
        bX = Math.max(-22, Math.min(22, bX));
        bZ = Math.max(-22, Math.min(22, bZ));

        setBoss({
          ...boss,
          pos: [bX, bY, bZ],
          facingLeft: bFacingLeft,
          row: bRow,
          frame: nextFrame,
          scalePulse: bScalePulse,
          state: bState,
          stateTimer: bTimer,
          flashRedTimer: redTimer,
          flashWhiteTimer: whiteTimer,
        });
      }
    }

    // --- FIREBALL IMPACT & DAMAGE TICK ---
    setFireballs((prev) =>
      prev
        .map((f) => {
          const nextTimer = f.timer - delta;
          let isExploded = f.exploded;

          if (nextTimer <= 0 && !f.exploded) {
            isExploded = true;

            // Damage player if inside fireball impact radius (1.6 units)
            const distToPlayer = Math.hypot(
              f.pos[0] - playerPos.current[0],
              f.pos[2] - playerPos.current[2]
            );

            if (distToPlayer < 1.6 && invincibleTimerRef.current <= 0 && playerHp > 0) {
              invincibleTimerRef.current = 0.9;
              onTakeDamage();
              soundEngine.playDamageSound(audio);
            }
          }

          return {
            ...f,
            timer: nextTimer,
            exploded: isExploded,
          };
        })
        .filter((f) => f.timer > -0.25) // Keep for brief blast animation
    );

    // --- SMOOTH CAMERA FOLLOW ---
    const targetCamX = playerPos.current[0];
    const targetCamZ = playerPos.current[2] + 9;
    const targetCamY = 7;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetCamX, 0.08);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetCamZ, 0.08);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetCamY, 0.08);
    state.camera.lookAt(playerPos.current[0], 1, playerPos.current[2]);
  });

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[15, 25, 15]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[playerPos.current[0], 3, playerPos.current[2]]} color={character.color} intensity={2} distance={10} />

      <GroundPlane />

      {/* Active Potions */}
      {potions.map((potion) => (
        <HealthPotionItem key={potion.id} position={potion.pos} />
      ))}

      {/* Warp Portal */}
      {warpPortalPos && <WarpPortal position={warpPortalPos} />}

      {/* Active Fireballs */}
      {fireballs.map((fireball) => (
        <FireballWarningAndImpact key={fireball.id} fireball={fireball} />
      ))}

      {/* Active Enemies */}
      {enemies.map((enemy) => (
        <EnemyCharacter key={enemy.id} enemy={enemy} texture={enemyTexture} />
      ))}

      {/* Active Boss */}
      {boss && bossState === 'active' && <BossCharacter boss={boss} texture={bossTexture} />}

      {/* PLAYER 2D SPRITE */}
      <group position={[playerPos.current[0], 1.25, playerPos.current[2]]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
          <circleGeometry args={[0.9, 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.4} />
        </mesh>

        <Billboard lockX={false} lockY={false} lockZ={false}>
          <mesh scale={[facingLeft ? -2.5 : 2.5, 2.5, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              map={spriteTexture}
              transparent
              opacity={isInvincibleVisual ? 0.35 : 1.0}
              side={THREE.DoubleSide}
            />
          </mesh>
        </Billboard>

        <AttackWave
          active={isAttacking}
          position={playerPos.current}
          facingLeft={facingLeft}
          color={character.accentColor}
        />

        <SkillParticles active={isDancing} position={[0, -1, 0]} color={character.color} />
      </group>
    </>
  );
};

// -------------------------------------------------------------
// MAIN GAMECANVAS EXPORT WITH HUD, BOSS HP, GAME OVER & ENDING
// -------------------------------------------------------------
export const GameCanvas: React.FC<GameCanvasProps> = ({
  character,
  controls,
  audio,
  graphics,
  lang,
  onOpenPauseMenu,
  onExitToMenu,
}) => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [fps, setFps] = useState(60);

  // Health & Kill Count
  const [playerHp, setPlayerHp] = useState(5);
  const [enemiesKilled, setEnemiesKilled] = useState(0);

  // Boss & Victory States
  const [bossHp, setBossHp] = useState(15);
  const [showBossBanner, setShowBossBanner] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Global Key Listener
  useEffect(() => {
    const active = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      active.add(e.code);
      setPressedKeys(new Set(active));

      if (e.code === 'Escape' || e.code === controls.bindings.pause?.code) {
        soundEngine.playClickSound(audio);
        onOpenPauseMenu();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      active.delete(e.code);
      setPressedKeys(new Set(active));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controls, audio, onOpenPauseMenu]);

  const handleTakeDamage = () => {
    setPlayerHp((prev) => {
      const nextHp = Math.max(0, prev - 1);
      if (nextHp === 0) {
        setIsGameOver(true);
        soundEngine.playGameOverSound(audio);
      }
      return nextHp;
    });
  };

  const handleHeal = () => {
    setPlayerHp((prev) => Math.min(5, prev + 1));
  };

  const handleBossSpawned = () => {
    setShowBossBanner(true);
    setTimeout(() => setShowBossBanner(false), 3500);
  };

  const handleEnterPortal = () => {
    if (!isVictory) {
      setIsVictory(true);
      soundEngine.playWarpSound(audio);
      soundEngine.playVictorySound(audio);
    }
  };

  const handleRestartGame = () => {
    setPlayerHp(5);
    setScore(0);
    setEnemiesKilled(0);
    setBossHp(15);
    setIsGameOver(false);
    setIsVictory(false);
    soundEngine.playClickSound(audio);
  };

  const handleTouchCode = (code: string, active: boolean) => {
    setPressedKeys((prev) => {
      const next = new Set(prev);
      if (active) next.add(code);
      else next.delete(code);
      return next;
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-950">
      <Canvas
        shadows
        camera={{ position: [0, 8, 12], fov: 50 }}
        className="w-full h-full block bg-slate-950"
      >
        <React.Suspense fallback={null}>
          <GameScene
            character={character}
            controls={controls}
            audio={audio}
            pressedKeys={pressedKeys}
            playerHp={playerHp}
            isGameOver={isGameOver}
            enemiesKilled={enemiesKilled}
            onTakeDamage={handleTakeDamage}
            onHeal={handleHeal}
            onScoreUpdate={(add) => setScore((s) => s + add)}
            onEnemyKilled={() => setEnemiesKilled((k) => k + 1)}
            onBossSpawned={handleBossSpawned}
            onBossDefeated={() => setBossHp(0)}
            onEnterPortal={handleEnterPortal}
            onFpsUpdate={(f) => setFps(f)}
          />
        </React.Suspense>
      </Canvas>

      {/* TOP HUD HEADER */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 border border-cyan-500/30 p-3 rounded-2xl backdrop-blur-md pointer-events-auto shadow-xl">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-md border"
            style={{ backgroundColor: `${character.color}25`, borderColor: character.color }}
          >
            {character.icon}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-cyan-300 tracking-wider">
                {lang === 'TH' ? character.nameTh : character.nameEn}
              </span>
              <span className="text-xs font-extrabold text-amber-400 ml-2">
                {lang === 'TH' ? `คะแนน: ${score}` : `SCORE: ${score}`}
              </span>
            </div>

            {/* 5 HEARTS HP DISPLAY */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((heartIndex) => (
                <Heart
                  key={heartIndex}
                  className={`w-4 h-4 transition-all duration-300 ${
                    heartIndex <= playerHp
                      ? 'fill-rose-500 text-rose-500 scale-100 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                      : 'text-slate-600 fill-slate-800 scale-90'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="ml-2 pl-3 border-l border-slate-700/80 flex items-center gap-1.5 text-xs font-black text-slate-200">
            <Skull className="w-4 h-4 text-rose-400" />
            <span className="text-rose-300">
              {lang === 'TH' ? `ปราบศัตรู: ${enemiesKilled}` : `Kills: ${enemiesKilled}`}
            </span>
          </div>
        </div>

        {/* System HUD & Options Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {graphics.showFpsCounter && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-cyan-400 font-bold shadow-md">
              {fps} FPS
            </div>
          )}

          <button
            onClick={() => {
              soundEngine.playClickSound(audio);
              onOpenPauseMenu();
            }}
            className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold flex items-center gap-2 shadow-lg transition"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'TH' ? 'ตั้งค่าปุ่ม (ESC)' : 'Options (ESC)'}</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClickSound(audio);
              onExitToMenu();
            }}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BOSS HEALTH BAR ON TOP SCREEN */}
      {enemiesKilled >= 10 && bossHp > 0 && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-11/12 max-w-lg bg-slate-900/90 border-2 border-purple-500/80 p-3 rounded-2xl backdrop-blur-md z-20 shadow-2xl animate-bounce-short">
          <div className="flex items-center justify-between mb-1 text-xs font-black">
            <span className="text-purple-300 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
              {lang === 'TH' ? 'จอมปีศาจ BOSS' : 'DEMON BOSS'}
            </span>
            <span className="text-purple-400 font-mono">{bossHp} / 15 HP</span>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-purple-900">
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-rose-500 to-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${(bossHp / 15) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* BOSS ANNOUNCEMENT BANNER */}
      {showBossBanner && (
        <div className="absolute top-36 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-900/90 via-rose-900/90 to-purple-900/90 border-2 border-amber-400/80 px-8 py-3 rounded-2xl backdrop-blur-md z-30 shadow-2xl animate-pulse flex items-center gap-3">
          <Flame className="w-6 h-6 text-amber-400 animate-bounce" />
          <span className="text-amber-300 font-black text-sm sm:text-base tracking-wider uppercase">
            {lang === 'TH' ? '🔥 บอสปรากฏตัวแล้ว! พิชิตเพื่อเปิดประตูวาร์ป 🔥' : '🔥 BOSS HAS APPEARED! DEFEAT TO OPEN WARP PORTAL 🔥'}
          </span>
        </div>
      )}

      {/* GAME OVER MODAL POPUP */}
      {isGameOver && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-rose-500/60 p-6 sm:p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 text-rose-500 shadow-inner">
              <Skull className="w-8 h-8" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-rose-400 mb-1 tracking-tight">
              {lang === 'TH' ? 'เกมโอเวอร์ (GAME OVER)' : 'GAME OVER'}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mb-6">
              {lang === 'TH' ? 'พลังชีวิตหมด! พ่ายแพ้แก่ศัตรู' : 'You have been defeated!'}
            </p>

            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 mb-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  {lang === 'TH' ? 'คะแนนรวม' : 'Total Score'}
                </span>
                <span className="font-black text-amber-400 text-base">{score}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                  <Skull className="w-4 h-4 text-rose-400" />
                  {lang === 'TH' ? 'ศัตรูที่ปราบได้' : 'Enemies Defeated'}
                </span>
                <span className="font-black text-rose-400 text-base">{enemiesKilled}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleRestartGame}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition active:scale-98"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{lang === 'TH' ? 'เล่นใหม่อีกครั้ง' : 'Play Again'}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClickSound(audio);
                  onExitToMenu();
                }}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700"
              >
                {lang === 'TH' ? 'กลับหน้าเมนูหลัก' : 'Back to Main Menu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VICTORY ENDING MODAL POPUP */}
      {isVictory && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-amber-400/80 p-6 sm:p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-purple-500 to-cyan-400" />

            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-400/50 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-inner animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 mb-1 tracking-tight">
              {lang === 'TH' ? '🎉 ชัยชนะ! พิชิตบอสสำเร็จ' : '🎉 VICTORY! GAME COMPLETE'}
            </h2>
            <p className="text-xs font-semibold text-cyan-300 mb-6">
              {lang === 'TH' ? 'คุณเข้าสู่ประตู Warp และกอบกู้ความสงบสุขกลับคืนมา!' : 'You entered the Warp Portal and saved the universe!'}
            </p>

            <div className="bg-slate-950/90 rounded-2xl p-5 border border-amber-500/30 mb-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {lang === 'TH' ? 'คะแนนรวมทั้งหมด' : 'Final Total Score'}
                </span>
                <span className="font-black text-amber-300 text-lg">{score}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Skull className="w-4 h-4 text-rose-400" />
                  {lang === 'TH' ? 'จำนวนศัตรูที่ปราบ' : 'Enemies Defeated'}
                </span>
                <span className="font-black text-rose-400 text-base">{enemiesKilled}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-purple-400" />
                  {lang === 'TH' ? 'สถานะบอส' : 'Boss Status'}
                </span>
                <span className="font-black text-emerald-400 text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800">
                  {lang === 'TH' ? 'ปราบสำเร็จ (DEFEATED)' : 'DEFEATED'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleRestartGame}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-98"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{lang === 'TH' ? 'เล่นใหม่อีกรอบ' : 'Play Again'}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClickSound(audio);
                  onExitToMenu();
                }}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700"
              >
                {lang === 'TH' ? 'กลับสู่หน้าเมนูหลัก' : 'Return to Title Menu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTROL GUIDE HUD BAR AT BOTTOM */}
      {controls.showKeyHUD && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-950/85 border border-cyan-500/40 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-4 sm:gap-6 pointer-events-none shadow-2xl z-10">
          <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hidden sm:block">
            {lang === 'TH' ? 'ปุ่มควบคุมเกม:' : 'ACTIVE CONTROLS:'}
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-1.5">
              <div
                className={`px-2.5 py-1 rounded-lg text-xs font-black border transition ${
                  pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp')
                    ? 'bg-cyan-400 text-slate-950 border-cyan-300 scale-105'
                    : 'bg-slate-900 text-slate-200 border-slate-800'
                }`}
              >
                WASD / ↑↓←→
              </div>
              <span className="text-[10px] text-slate-400 font-bold">
                {lang === 'TH' ? 'เดิน 8 ทิศทาง' : '8-Dir Move'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <div
                className={`px-2.5 py-1 rounded-lg text-xs font-black border transition ${
                  pressedKeys.has('KeyP') || pressedKeys.has('KeyJ')
                    ? 'bg-rose-500 text-white border-rose-400 scale-105'
                    : 'bg-slate-900 text-slate-200 border-slate-800'
                }`}
              >
                P
              </div>
              <span className="text-[10px] text-rose-300 font-bold">
                {lang === 'TH' ? 'ต่อย / โจมตี' : 'Attack'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <div
                className={`px-2.5 py-1 rounded-lg text-xs font-black border transition ${
                  pressedKeys.has('KeyO') || pressedKeys.has('KeyK')
                    ? 'bg-amber-400 text-slate-950 border-amber-300 scale-105'
                    : 'bg-slate-900 text-slate-200 border-slate-800'
                }`}
              >
                O
              </div>
              <span className="text-[10px] text-amber-300 font-bold">
                {lang === 'TH' ? 'เต้นสร้าง Skill' : 'Dance Skill'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIRTUAL CONTROLS FOR TOUCH/MOBILE */}
      {controls.touchControls && (
        <div className="absolute bottom-8 left-6 right-6 flex items-end justify-between pointer-events-auto z-20">
          <div className="grid grid-cols-3 gap-1.5 w-36 h-36 bg-slate-900/80 p-2 rounded-3xl border border-cyan-500/30 backdrop-blur-md">
            <div />
            <button
              onTouchStart={() => handleTouchCode('KeyW', true)}
              onTouchEnd={() => handleTouchCode('KeyW', false)}
              className="rounded-xl bg-slate-800 active:bg-cyan-500 font-black text-xs flex items-center justify-center text-slate-200"
            >
              ▲
            </button>
            <div />
            <button
              onTouchStart={() => handleTouchCode('KeyA', true)}
              onTouchEnd={() => handleTouchCode('KeyA', false)}
              className="rounded-xl bg-slate-800 active:bg-cyan-500 font-black text-xs flex items-center justify-center text-slate-200"
            >
              ◀
            </button>
            <div className="flex items-center justify-center text-slate-600">
              <Crosshair className="w-4 h-4" />
            </div>
            <button
              onTouchStart={() => handleTouchCode('KeyD', true)}
              onTouchEnd={() => handleTouchCode('KeyD', false)}
              className="rounded-xl bg-slate-800 active:bg-cyan-500 font-black text-xs flex items-center justify-center text-slate-200"
            >
              ▶
            </button>
            <div />
            <button
              onTouchStart={() => handleTouchCode('KeyS', true)}
              onTouchEnd={() => handleTouchCode('KeyS', false)}
              className="rounded-xl bg-slate-800 active:bg-cyan-500 font-black text-xs flex items-center justify-center text-slate-200"
            >
              ▼
            </button>
            <div />
          </div>

          <div className="flex items-center gap-3">
            <button
              onTouchStart={() => handleTouchCode('KeyP', true)}
              onTouchEnd={() => handleTouchCode('KeyP', false)}
              className="w-16 h-16 rounded-2xl bg-rose-600 active:bg-rose-500 text-white font-black text-sm shadow-xl flex flex-col items-center justify-center border border-rose-400"
            >
              <span>P</span>
              <span className="text-[9px] font-normal">{lang === 'TH' ? 'ต่อย' : 'PUNCH'}</span>
            </button>

            <button
              onTouchStart={() => handleTouchCode('KeyO', true)}
              onTouchEnd={() => handleTouchCode('KeyO', false)}
              className="w-16 h-16 rounded-2xl bg-amber-500 active:bg-amber-400 text-slate-950 font-black text-sm shadow-xl flex flex-col items-center justify-center border border-amber-300"
            >
              <span>O</span>
              <span className="text-[9px] font-normal">{lang === 'TH' ? 'เต้น' : 'DANCE'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
