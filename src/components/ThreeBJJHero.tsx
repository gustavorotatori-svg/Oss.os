import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  RotateCcw,
  Sparkles,
  Layers,
  Sun,
  Moon,
  Eye,
  Sliders,
  Maximize2,
  Award,
  Shield,
  ChevronRight,
  Flame,
  Info,
  Check,
  Compass,
  ArrowRight,
  Zap,
  ShoppingBag
} from 'lucide-react';
import { Product, Category } from '../types';

// WebGL Software Renderer Detection Guard
function isSoftwareGl(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  if (!dbg) return false;
  const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '';
  return /swiftshader|llvmpipe|software/i.test(renderer);
}

// Procedural Canvas Texture Generators
function createPearlWeaveTexture(baseHex: string, grainHex: string, size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  // Pearl weave diamond grid
  const step = 8;
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = grainHex;

  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      // Staggered pearl weave knots
      const isOffset = (y / step) % 2 === 0;
      const posX = x + (isOffset ? step / 2 : 0);

      // Micro weave thread
      ctx.fillStyle = grainHex;
      ctx.beginPath();
      ctx.ellipse(posX, y + step / 2, 2.5, 1.4, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Cross stitch highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(posX - 1, y, 2, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createRipstopTexture(baseHex: string, gridHex: string, size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  const gridSize = 16;
  ctx.strokeStyle = gridHex;
  ctx.lineWidth = 1.5;

  for (let i = 0; i <= size; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createTatamePedestalTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#0a1012';
  ctx.fillRect(0, 0, size, size);

  // Tatame straw / textured vinyl grid
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
  ctx.lineWidth = 1;
  const step = 6;
  for (let y = 0; y < size; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Radial subtle vignette
  const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.48);
  grad.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
  grad.addColorStop(0.7, 'rgba(5, 15, 12, 0.05)');
  grad.addColorStop(1, 'rgba(2, 6, 5, 0.8)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createEmbroideredPatchTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Badge background
  ctx.fillStyle = '#0d1314';
  ctx.fillRect(0, 0, 256, 256);

  // Border stitching
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 6;
  ctx.strokeRect(12, 12, 232, 232);

  // Inner gold border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 216, 216);

  // Kanji & Brand Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('押忍', 128, 80);

  ctx.fillStyle = '#10b981';
  ctx.font = '900 24px monospace';
  ctx.fillText('OSS.OS', 128, 140);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 12px sans-serif';
  ctx.fillText('IBJJF PRO SPEC', 128, 180);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

// BJJ Belt Color Definitions
export interface BeltColorOption {
  id: string;
  name: string;
  hex: string;
  barColor: string; // Black bar or Red bar for black belt
  hasRedBar: boolean;
  textColor: string;
}

const BELT_OPTIONS: BeltColorOption[] = [
  { id: 'white', name: 'Branca', hex: '#f8fafc', barColor: '#090d10', hasRedBar: false, textColor: 'text-zinc-900' },
  { id: 'blue', name: 'Azul', hex: '#2563eb', barColor: '#090d10', hasRedBar: false, textColor: 'text-blue-400' },
  { id: 'purple', name: 'Roxa', hex: '#9333ea', barColor: '#090d10', hasRedBar: false, textColor: 'text-purple-400' },
  { id: 'brown', name: 'Marrom', hex: '#78350f', barColor: '#090d10', hasRedBar: false, textColor: 'text-amber-600' },
  { id: 'black', name: 'Preta', hex: '#18181b', barColor: '#dc2626', hasRedBar: true, textColor: 'text-red-500' }
];

export interface GiColorOption {
  id: string;
  name: string;
  jacketColor: string;
  pantsColor: string;
  lapelColor: string;
  stitchColor: string;
  accentPill: string;
}

const GI_OPTIONS: GiColorOption[] = [
  {
    id: 'white',
    name: 'Branco Clássico',
    jacketColor: '#f1f5f9',
    pantsColor: '#f1f5f9',
    lapelColor: '#e2e8f0',
    stitchColor: '#059669',
    accentPill: 'bg-emerald-500'
  },
  {
    id: 'blue',
    name: 'Azul Royal IBJJF',
    jacketColor: '#1d4ed8',
    pantsColor: '#1e40af',
    lapelColor: '#1e3a8a',
    stitchColor: '#f59e0b',
    accentPill: 'bg-blue-600'
  },
  {
    id: 'black',
    name: 'Stealth Black',
    jacketColor: '#1e293b',
    pantsColor: '#0f172a',
    lapelColor: '#090d16',
    stitchColor: '#10b981',
    accentPill: 'bg-zinc-800 border border-emerald-500/40'
  },
  {
    id: 'military',
    name: 'Olive Edição Especial',
    jacketColor: '#2d3725',
    pantsColor: '#212a1a',
    lapelColor: '#1a2214',
    stitchColor: '#eab308',
    accentPill: 'bg-lime-800'
  }
];

export type LightingMood = 'dojo' | 'nocturne' | 'arena';

export interface CameraPreset {
  id: string;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

const CAMERA_PRESETS: CameraPreset[] = [
  { id: 'hero', label: 'Visão 360° Hero', position: [2.2, 1.4, 3.2], target: [0, 0.4, 0] },
  { id: 'lapel', label: 'Gola & Lapela', position: [0.8, 1.1, 1.4], target: [0, 0.9, 0] },
  { id: 'belt', label: 'Nó & Faixa', position: [0.3, 0.5, 1.5], target: [0, 0.35, 0] },
  { id: 'pants', label: 'Reforço Ripstop', position: [-0.9, -0.2, 1.8], target: [0, -0.3, 0] }
];

export interface ThreeBJJHeroProps {
  productList?: Product[];
  onQuickView?: (product: Product) => void;
  onNavigate?: (view: any) => void;
  onSelectCategory?: (category: Category | 'All') => void;
  onOpenFilterDrawer?: () => void;
}

export const ThreeBJJHero: React.FC<ThreeBJJHeroProps> = ({
  productList = [],
  onQuickView,
  onNavigate,
  onSelectCategory,
  onOpenFilterDrawer
}) => {
  const { t } = useTranslation();
  const mountRef = useRef<HTMLDivElement>(null);

  // Interactive States
  const [activeBelt, setActiveBelt] = useState<BeltColorOption>(BELT_OPTIONS[4]); // Black belt by default
  const [stripes, setStripes] = useState<number>(3); // 3 stripes
  const [activeGi, setActiveGi] = useState<GiColorOption>(GI_OPTIONS[0]); // White Gi by default
  const [lightingMood, setLightingMood] = useState<LightingMood>('nocturne');
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string>('hero');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [isWebGlAvailable, setIsWebGlAvailable] = useState<boolean>(true);
  const [isSoftwareRenderer, setIsSoftwareRenderer] = useState<boolean>(false);

  // Internal Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Groups and subparts for animation and color swapping
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const jacketGroupRef = useRef<THREE.Group | null>(null);
  const pantsGroupRef = useRef<THREE.Group | null>(null);
  const beltGroupRef = useRef<THREE.Group | null>(null);
  const collarGroupRef = useRef<THREE.Group | null>(null);
  const pedestalGroupRef = useRef<THREE.Group | null>(null);
  const stripesGroupRef = useRef<THREE.Group | null>(null);

  // Materials for live dynamic styling
  const jacketMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const pantsMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const lapelMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const beltMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const beltBarMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Lighting references
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Interaction tracking (custom zero-occlusion damped orbit)
  const isPointerDownRef = useRef<boolean>(false);
  const prevPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const orbitEulerRef = useRef<{ theta: number; phi: number }>({ theta: 0.6, phi: 0.3 });
  const targetEulerRef = useRef<{ theta: number; phi: number }>({ theta: 0.6, phi: 0.3 });
  const cameraDistanceRef = useRef<number>(3.6);
  const targetDistanceRef = useRef<number>(3.6);
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.4, 0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.4, 0));

  // Exploded animation progress
  const explodeProgressRef = useRef<number>(0);
  const targetExplodeRef = useRef<number>(0);

  // Update exploded target
  useEffect(() => {
    targetExplodeRef.current = isExploded ? 1.0 : 0.0;
  }, [isExploded]);

  // Apply Camera Preset
  const applyCameraPreset = useCallback((presetId: string) => {
    const preset = CAMERA_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setActivePreset(presetId);

    const pos = new THREE.Vector3(...preset.position);
    const target = new THREE.Vector3(...preset.target);
    targetLookAtRef.current.copy(target);

    // Calculate spherical angles from target
    const diff = pos.clone().sub(target);
    const radius = diff.length();
    targetDistanceRef.current = radius;
    targetEulerRef.current.phi = Math.asin(Math.max(-0.95, Math.min(0.95, diff.y / radius)));
    targetEulerRef.current.theta = Math.atan2(diff.x, diff.z);
  }, []);

  // Update belt & stripes in 3D scene
  useEffect(() => {
    if (beltMaterialRef.current) {
      beltMaterialRef.current.color.set(activeBelt.hex);
      beltMaterialRef.current.needsUpdate = true;
    }
    if (beltBarMaterialRef.current) {
      beltBarMaterialRef.current.color.set(activeBelt.barColor);
      beltBarMaterialRef.current.needsUpdate = true;
    }

    // Rebuild stripe geometries
    if (stripesGroupRef.current) {
      // Clear existing stripe meshes
      while (stripesGroupRef.current.children.length > 0) {
        const child = stripesGroupRef.current.children[0] as THREE.Mesh;
        if (child.geometry) child.geometry.dispose();
        stripesGroupRef.current.remove(child);
      }

      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      for (let i = 0; i < stripes; i++) {
        const stripeGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.02, 16);
        const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
        stripeMesh.rotation.z = Math.PI / 2;
        stripeMesh.position.set(0.19, 0.16 - i * 0.032, 0.31);
        stripesGroupRef.current.add(stripeMesh);
      }
    }
  }, [activeBelt, stripes]);

  // Update Gi fabric colors
  useEffect(() => {
    if (jacketMaterialRef.current) {
      jacketMaterialRef.current.color.set(activeGi.jacketColor);
      jacketMaterialRef.current.needsUpdate = true;
    }
    if (pantsMaterialRef.current) {
      pantsMaterialRef.current.color.set(activeGi.pantsColor);
      pantsMaterialRef.current.needsUpdate = true;
    }
    if (lapelMaterialRef.current) {
      lapelMaterialRef.current.color.set(activeGi.lapelColor);
      lapelMaterialRef.current.needsUpdate = true;
    }
  }, [activeGi]);

  // Update Lighting Mood
  useEffect(() => {
    if (!keyLightRef.current || !fillLightRef.current || !rimLightRef.current || !hemiLightRef.current) return;

    if (lightingMood === 'dojo') {
      // Pure clean studio daylight
      keyLightRef.current.color.set('#ffffff');
      keyLightRef.current.intensity = 2.4;
      keyLightRef.current.position.set(3, 4, 3);

      fillLightRef.current.color.set('#cbd5e1');
      fillLightRef.current.intensity = 1.2;

      rimLightRef.current.color.set('#94a3b8');
      rimLightRef.current.intensity = 1.6;

      hemiLightRef.current.color.set('#ffffff');
      hemiLightRef.current.groundColor.set('#0f172a');
      hemiLightRef.current.intensity = 0.9;
    } else if (lightingMood === 'nocturne') {
      // Cyber-Martial Tatame (Emerald & Gold highlights)
      keyLightRef.current.color.set('#e2e8f0');
      keyLightRef.current.intensity = 1.8;
      keyLightRef.current.position.set(2.5, 3.5, 2.5);

      fillLightRef.current.color.set('#064e3b'); // Dark emerald fill
      fillLightRef.current.intensity = 1.4;

      rimLightRef.current.color.set('#10b981'); // Vibrant neon green rim
      rimLightRef.current.intensity = 3.2;

      hemiLightRef.current.color.set('#10b981');
      hemiLightRef.current.groundColor.set('#020617');
      hemiLightRef.current.intensity = 0.6;
    } else if (lightingMood === 'arena') {
      // IBJJF Championship floodlight (High contrast arena gold)
      keyLightRef.current.color.set('#fffbeb');
      keyLightRef.current.intensity = 3.0;
      keyLightRef.current.position.set(1.5, 5.0, 2.0);

      fillLightRef.current.color.set('#b45309');
      fillLightRef.current.intensity = 0.8;

      rimLightRef.current.color.set('#f59e0b');
      rimLightRef.current.intensity = 3.5;

      hemiLightRef.current.color.set('#fef3c7');
      hemiLightRef.current.groundColor.set('#451a03');
      hemiLightRef.current.intensity = 0.8;
    }
  }, [lightingMood]);

  // Three.js Mount Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(2.2, 1.4, 3.2);
    cameraRef.current = camera;

    // 3. Renderer with PBR settings
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
        alpha: true
      });
    } catch (e) {
      console.warn('WebGL init error:', e);
      setIsWebGlAvailable(false);
      return;
    }

    const gl = renderer.getContext();
    if (isSoftwareGl(gl)) {
      setIsSoftwareRenderer(true);
      renderer.setPixelRatio(1);
    } else {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    }

    renderer.setSize(width, height, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio PBR Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#10b981', '#020617', 0.6);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const keyLight = new THREE.DirectionalLight('#e2e8f0', 1.8);
    keyLight.position.set(2.5, 3.5, 2.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 10;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight('#064e3b', 1.4);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    const rimLight = new THREE.DirectionalLight('#10b981', 3.2);
    rimLight.position.set(0, 4, -3.5);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Subtle floor contact shadow receiver
    const shadowPlaneGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.99;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 5. Procedural Assets Construction
    const pearlTexture = createPearlWeaveTexture('#f8fafc', '#94a3b8');
    const ripstopTexture = createRipstopTexture('#f1f5f9', '#64748b');
    const tatameTexture = createTatamePedestalTexture();
    const patchTexture = createEmbroideredPatchTexture();

    // Materials
    const jacketMat = new THREE.MeshStandardMaterial({
      color: activeGi.jacketColor,
      roughness: 0.85,
      metalness: 0.05,
      map: pearlTexture,
      bumpScale: 0.04
    });
    jacketMaterialRef.current = jacketMat;

    const pantsMat = new THREE.MeshStandardMaterial({
      color: activeGi.pantsColor,
      roughness: 0.78,
      metalness: 0.08,
      map: ripstopTexture,
      bumpScale: 0.03
    });
    pantsMaterialRef.current = pantsMat;

    const lapelMat = new THREE.MeshStandardMaterial({
      color: activeGi.lapelColor,
      roughness: 0.75,
      metalness: 0.1,
      bumpScale: 0.06
    });
    lapelMaterialRef.current = lapelMat;

    const beltMat = new THREE.MeshStandardMaterial({
      color: activeBelt.hex,
      roughness: 0.65,
      metalness: 0.12
    });
    beltMaterialRef.current = beltMat;

    const beltBarMat = new THREE.MeshStandardMaterial({
      color: activeBelt.barColor,
      roughness: 0.7,
      metalness: 0.05
    });
    beltBarMaterialRef.current = beltBarMat;

    // Master Root Group
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    // Subgroup: Tatame Pedestal (Base)
    const pedestalGroup = new THREE.Group();
    pedestalGroupRef.current = pedestalGroup;
    modelGroup.add(pedestalGroup);

    const baseGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.15, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      map: tatameTexture,
      roughness: 0.7,
      metalness: 0.2
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -1.05;
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    // Glowing rim ring around pedestal
    const ringGeo = new THREE.TorusGeometry(1.68, 0.015, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -0.98;
    pedestalGroup.add(ringMesh);

    // Inner brass beveled ring
    const brassGeo = new THREE.CylinderGeometry(1.62, 1.62, 0.04, 32);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8
    });
    const brassMesh = new THREE.Mesh(brassGeo, brassMat);
    brassMesh.position.y = -0.99;
    pedestalGroup.add(brassMesh);

    // Subgroup: Uwagi (Kimono Jacket)
    const jacketGroup = new THREE.Group();
    jacketGroupRef.current = jacketGroup;
    modelGroup.add(jacketGroup);

    // Torso mass
    const torsoGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.85, 24);
    const torsoMesh = new THREE.Mesh(torsoGeo, jacketMat);
    torsoMesh.position.y = 0.75;
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    jacketGroup.add(torsoMesh);

    // Skirt / Faldão (lower jacket flared out)
    const skirtGeo = new THREE.CylinderGeometry(0.44, 0.52, 0.42, 24, 1, true);
    const skirtMesh = new THREE.Mesh(skirtGeo, jacketMat);
    skirtMesh.position.y = 0.24;
    skirtMesh.castShadow = true;
    skirtMesh.receiveShadow = true;
    jacketGroup.add(skirtMesh);

    // Left Sleeve
    const sleeveLGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.72, 18);
    const sleeveL = new THREE.Mesh(sleeveLGeo, jacketMat);
    sleeveL.position.set(-0.52, 0.78, 0);
    sleeveL.rotation.z = Math.PI / 5;
    sleeveL.castShadow = true;
    sleeveL.receiveShadow = true;
    jacketGroup.add(sleeveL);

    // Right Sleeve
    const sleeveRGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.72, 18);
    const sleeveR = new THREE.Mesh(sleeveRGeo, jacketMat);
    sleeveR.position.set(0.52, 0.78, 0);
    sleeveR.rotation.z = -Math.PI / 5;
    sleeveR.castShadow = true;
    sleeveR.receiveShadow = true;
    jacketGroup.add(sleeveR);

    // Cuff Reinforcement Tapes
    const cuffGeo = new THREE.TorusGeometry(0.165, 0.015, 12, 24);
    const cuffMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 });
    const cuffL = new THREE.Mesh(cuffGeo, cuffMat);
    cuffL.position.set(-0.73, 0.5, 0);
    cuffL.rotation.y = Math.PI / 2;
    cuffL.rotation.x = Math.PI / 5;
    jacketGroup.add(cuffL);

    const cuffR = new THREE.Mesh(cuffGeo, cuffMat);
    cuffR.position.set(0.73, 0.5, 0);
    cuffR.rotation.y = Math.PI / 2;
    cuffR.rotation.x = -Math.PI / 5;
    jacketGroup.add(cuffR);

    // Embroidered Patch on Left Shoulder
    const patchGeo = new THREE.PlaneGeometry(0.16, 0.16);
    const patchMat = new THREE.MeshStandardMaterial({
      map: patchTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    const patchMesh = new THREE.Mesh(patchGeo, patchMat);
    patchMesh.position.set(-0.46, 0.98, 0.14);
    patchMesh.rotation.y = -Math.PI / 4;
    patchMesh.rotation.z = 0.15;
    jacketGroup.add(patchMesh);

    // Subgroup: Heavy EVA Collar (Gola de Borracha Anti-bacteriana)
    const collarGroup = new THREE.Group();
    collarGroupRef.current = collarGroup;
    modelGroup.add(collarGroup);

    // Left lapel crossing right
    const lapelLeftGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.9, 16);
    const lapelLeft = new THREE.Mesh(lapelLeftGeo, lapelMat);
    lapelLeft.position.set(-0.13, 0.74, 0.38);
    lapelLeft.rotation.z = -0.28;
    lapelLeft.castShadow = true;
    collarGroup.add(lapelLeft);

    // Right lapel underneath
    const lapelRightGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.9, 16);
    const lapelRight = new THREE.Mesh(lapelRightGeo, lapelMat);
    lapelRight.position.set(0.13, 0.74, 0.35);
    lapelRight.rotation.z = 0.28;
    lapelRight.castShadow = true;
    collarGroup.add(lapelRight);

    // Neck ring collar
    const neckRingGeo = new THREE.TorusGeometry(0.24, 0.042, 16, 32, Math.PI);
    const neckRing = new THREE.Mesh(neckRingGeo, lapelMat);
    neckRing.position.set(0, 1.15, 0.08);
    neckRing.rotation.x = -Math.PI / 2.3;
    collarGroup.add(neckRing);

    // Subgroup: Faixa BJJ (Belt + Knot + Rank Bar + Stripes)
    const beltGroup = new THREE.Group();
    beltGroupRef.current = beltGroup;
    modelGroup.add(beltGroup);

    // Belt waist loop
    const beltLoopGeo = new THREE.TorusGeometry(0.445, 0.038, 16, 36);
    const beltLoop = new THREE.Mesh(beltLoopGeo, beltMat);
    beltLoop.rotation.x = Math.PI / 2;
    beltLoop.position.y = 0.42;
    beltLoop.castShadow = true;
    beltGroup.add(beltLoop);

    // Traditional Martial Knot (Nó de Faixa)
    const knotGeo = new THREE.SphereGeometry(0.065, 16, 16);
    knotGeo.scale(1.4, 0.9, 0.8);
    const knotMesh = new THREE.Mesh(knotGeo, beltMat);
    knotMesh.position.set(0, 0.42, 0.45);
    knotMesh.castShadow = true;
    beltGroup.add(knotMesh);

    // Belt hanging tip left (plain belt tip)
    const beltTipLGeo = new THREE.CylinderGeometry(0.04, 0.038, 0.38, 16);
    const beltTipL = new THREE.Mesh(beltTipLGeo, beltMat);
    beltTipL.position.set(-0.09, 0.22, 0.42);
    beltTipL.rotation.z = 0.22;
    beltTipL.rotation.x = 0.15;
    beltTipL.castShadow = true;
    beltGroup.add(beltTipL);

    // Belt hanging tip right with Graduation Rank Bar
    const beltTipRGeo = new THREE.CylinderGeometry(0.04, 0.038, 0.42, 16);
    const beltTipR = new THREE.Mesh(beltTipRGeo, beltMat);
    beltTipR.position.set(0.12, 0.2, 0.42);
    beltTipR.rotation.z = -0.25;
    beltTipR.rotation.x = 0.15;
    beltTipR.castShadow = true;
    beltGroup.add(beltTipR);

    // Graduation Bar (Ponteira preta ou vermelha)
    const rankBarGeo = new THREE.CylinderGeometry(0.042, 0.04, 0.18, 16);
    const rankBar = new THREE.Mesh(rankBarGeo, beltBarMat);
    rankBar.position.set(0.16, 0.12, 0.4);
    rankBar.rotation.z = -0.25;
    rankBar.rotation.x = 0.15;
    rankBar.castShadow = true;
    beltGroup.add(rankBar);

    // Stripes Group
    const stripesGroup = new THREE.Group();
    stripesGroupRef.current = stripesGroup;
    beltGroup.add(stripesGroup);

    // Subgroup: Zubon (Ripstop Pants)
    const pantsGroup = new THREE.Group();
    pantsGroupRef.current = pantsGroup;
    modelGroup.add(pantsGroup);

    // Waist / Pelvis
    const pelvisGeo = new THREE.CylinderGeometry(0.41, 0.43, 0.32, 24);
    const pelvis = new THREE.Mesh(pelvisGeo, pantsMat);
    pelvis.position.y = 0.22;
    pelvis.castShadow = true;
    pelvis.receiveShadow = true;
    pantsGroup.add(pelvis);

    // Left Pant Leg
    const legLGeo = new THREE.CylinderGeometry(0.19, 0.16, 0.95, 20);
    const legL = new THREE.Mesh(legLGeo, pantsMat);
    legL.position.set(-0.21, -0.4, 0);
    legL.castShadow = true;
    legL.receiveShadow = true;
    pantsGroup.add(legL);

    // Right Pant Leg
    const legRGeo = new THREE.CylinderGeometry(0.19, 0.16, 0.95, 20);
    const legR = new THREE.Mesh(legRGeo, pantsMat);
    legR.position.set(0.21, -0.4, 0);
    legR.castShadow = true;
    legR.receiveShadow = true;
    pantsGroup.add(legR);

    // Knee Reinforcement Patches
    const kneeGeo = new THREE.BoxGeometry(0.18, 0.28, 0.06);
    const kneeL = new THREE.Mesh(kneeGeo, pantsMat);
    kneeL.position.set(-0.21, -0.32, 0.16);
    kneeL.rotation.y = 0.05;
    pantsGroup.add(kneeL);

    const kneeR = new THREE.Mesh(kneeGeo, pantsMat);
    kneeR.position.set(0.21, -0.32, 0.16);
    kneeR.rotation.y = -0.05;
    pantsGroup.add(kneeR);

    // Bottom hem bindings
    const hemGeo = new THREE.TorusGeometry(0.16, 0.012, 12, 24);
    const hemL = new THREE.Mesh(hemGeo, cuffMat);
    hemL.rotation.x = Math.PI / 2;
    hemL.position.set(-0.21, -0.86, 0);
    pantsGroup.add(hemL);

    const hemR = new THREE.Mesh(hemGeo, cuffMat);
    hemR.rotation.x = Math.PI / 2;
    hemR.position.set(0.21, -0.86, 0);
    pantsGroup.add(hemR);

    // 6. Resize Observer for fluid responsiveness
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0 && rendererRef.current && cameraRef.current) {
          cameraRef.current.aspect = newWidth / newHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newWidth, newHeight, false);
        }
      }
    });
    resizeObserver.observe(container);

    // 7. Interactive Damped Orbit Animation Loop
    const clock = new THREE.Clock();

    const renderLoop = () => {
      animFrameRef.current = requestAnimationFrame(renderLoop);
      const delta = Math.min(clock.getDelta(), 0.1);

      // Auto-rotation when not interacting
      if (autoRotate && !isPointerDownRef.current) {
        targetEulerRef.current.theta += delta * 0.4;
      }

      // Smooth interpolation for orbit angles & camera position
      orbitEulerRef.current.theta += (targetEulerRef.current.theta - orbitEulerRef.current.theta) * 0.1;
      orbitEulerRef.current.phi += (targetEulerRef.current.phi - orbitEulerRef.current.phi) * 0.1;
      cameraDistanceRef.current += (targetDistanceRef.current - cameraDistanceRef.current) * 0.1;
      currentLookAtRef.current.lerp(targetLookAtRef.current, 0.08);

      // Spherical coordinates to Cartesian
      const phiClamped = Math.max(-1.1, Math.min(1.2, orbitEulerRef.current.phi));
      const dist = cameraDistanceRef.current;
      const camX = currentLookAtRef.current.x + dist * Math.cos(phiClamped) * Math.sin(orbitEulerRef.current.theta);
      const camY = currentLookAtRef.current.y + dist * Math.sin(phiClamped);
      const camZ = currentLookAtRef.current.z + dist * Math.cos(phiClamped) * Math.cos(orbitEulerRef.current.theta);

      camera.position.set(camX, camY, camZ);
      camera.lookAt(currentLookAtRef.current);

      // Exploded View smooth animation
      explodeProgressRef.current += (targetExplodeRef.current - explodeProgressRef.current) * 0.08;
      const exp = explodeProgressRef.current;

      if (jacketGroupRef.current) {
        jacketGroupRef.current.position.y = exp * 0.42;
      }
      if (collarGroupRef.current) {
        collarGroupRef.current.position.y = exp * 0.58;
        collarGroupRef.current.position.z = exp * 0.22;
      }
      if (beltGroupRef.current) {
        beltGroupRef.current.position.y = -exp * 0.15;
        beltGroupRef.current.position.z = exp * 0.45;
      }
      if (pantsGroupRef.current) {
        pantsGroupRef.current.position.y = -exp * 0.55;
      }

      // Subtle idle breathing motion
      const time = clock.getElapsedTime();
      if (pedestalGroupRef.current) {
        ringMesh.material.color.setHSL(0.42, 0.85, 0.45 + Math.sin(time * 2) * 0.1);
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    // 8. Pointer Event Listeners for Zero-Occlusion Drag & Orbit
    const onPointerDown = (e: PointerEvent) => {
      isPointerDownRef.current = true;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDownRef.current) return;
      const dx = e.clientX - prevPointerRef.current.x;
      const dy = e.clientY - prevPointerRef.current.y;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };

      targetEulerRef.current.theta -= dx * 0.007;
      targetEulerRef.current.phi += dy * 0.007;
      targetEulerRef.current.phi = Math.max(-1.1, Math.min(1.2, targetEulerRef.current.phi));
    };

    const onPointerUp = () => {
      isPointerDownRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetDistanceRef.current += e.deltaY * 0.003;
      targetDistanceRef.current = Math.max(1.8, Math.min(6.5, targetDistanceRef.current));
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Cleanup Everything on Unmount
    return () => {
      resizeObserver.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);

      // Traverse & dispose geometries, materials, textures
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });

      pearlTexture.dispose();
      ripstopTexture.dispose();
      tatameTexture.dispose();
      patchTexture.dispose();

      renderer.dispose();
      container.innerHTML = '';
    };
  }, []); // Run once on mount

  // Hotspot Details Definition
  const HOTSPOTS = [
    {
      id: 'lapel',
      title: 'Gola EVA Vulcanizada 10mm',
      subtitle: 'Tratamento antibacteriano & Anti-pegada',
      desc: 'Espuma de alta densidade revestida com sarja 12oz. Dificulta a pegada do adversário e seca 4x mais rápido que algodão convencional.',
      preset: 'lapel'
    },
    {
      id: 'weave',
      title: 'Pearl Weave 450 GSM',
      subtitle: 'Padrão Oficial Competição IBJJF',
      desc: 'Tecido trançado pré-encolhido com gramatura de alta resistência. Suporta mais de 850kg de tensão contínua sem deformar o caimento.',
      preset: 'hero'
    },
    {
      id: 'belt',
      title: 'Faixa com Ponteira Pro 10cm',
      subtitle: 'Espaço regulamentar para graus',
      desc: 'Costuras pespontadas com 10 linhas reforçadas e ponteira em sarja de algodão para fixação de esparadrapos de graduação.',
      preset: 'belt'
    },
    {
      id: 'ripstop',
      title: 'Zubon Ripstop 10oz Tático',
      subtitle: 'Reforço de duplo joelho e cordão náutico',
      desc: 'Trama entrelaçada com fios de alta tenacidade contra rasgos acidentais no tatame. Joelheiras estendidas até a canela.',
      preset: 'pants'
    }
  ];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-black border border-emerald-950/60 shadow-2xl min-h-[640px] lg:min-h-[720px] flex flex-col justify-between">
      
      {/* Three.js Interactive WebGL Canvas (Zero-Occlusion Background & Drag Space) */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none z-0"
        title="Arraste para girar em 360°, use a roda do mouse ou pinça para zoom"
      />

      {/* Ambient Tatame Grid Backing (Subtle backdrop aesthetic) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.07),transparent_70%)]" />

      {/* TOP FLOATING HUD — ZERO OCCLUSION (pointer-events-none on wrapper, pointer-events-auto on buttons) */}
      <header className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pointer-events-none">
        
        {/* Brand & 3D Studio Badge */}
        <div className="space-y-1.5 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              STUDIO PBR 3D INTERATIVO
            </span>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-700">
              ACES Filmic • WebGL 2.0
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-2 drop-shadow-md">
            <span>ARMADURA DO JIU-JITSU</span>
            <span className="text-emerald-500 text-xl font-mono">/ 押忍</span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-md line-clamp-2">
            Explore a anatomia e acabamento dos kimonos de elite. Arraste livremente para inspecionar tecidos, costuras e graduações.
          </p>
        </div>

        {/* Studio Controls: Lighting & Auto-Rotate HUD */}
        <div className="flex items-center gap-2 pointer-events-auto self-end sm:self-center bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800 backdrop-blur-md shadow-xl">
          {/* Lighting Mode Selector */}
          <div className="flex items-center p-0.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
            <button
              onClick={() => setLightingMood('nocturne')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium ${
                lightingMood === 'nocturne'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Iluminação Noturna Tatame (Esmeralda & Dourado)"
            >
              <Moon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Nocturne</span>
            </button>

            <button
              onClick={() => setLightingMood('dojo')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium ${
                lightingMood === 'dojo'
                  ? 'bg-zinc-700/80 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Iluminação Estúdio Neutra (Daylight PBR)"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Dojo</span>
            </button>

            <button
              onClick={() => setLightingMood('arena')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium ${
                lightingMood === 'arena'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Holofote de Competição Mundial IBJJF"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Arena</span>
            </button>
          </div>

          {/* Auto-Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl transition-all border text-xs flex items-center gap-1.5 ${
              autoRotate
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
            }`}
            title={autoRotate ? 'Pausar Rotação Automática' : 'Ativar Rotação Automática'}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            <span className="text-[11px] font-semibold hidden md:inline">{autoRotate ? 'Giro Ativo' : 'Giro Pausado'}</span>
          </button>
        </div>
      </header>

      {/* MIDDLE FLOATING HUD — INTERACTIVE HOTSPOT SPECS OVERLAY */}
      <div className="relative z-10 px-4 sm:px-6 pointer-events-none my-auto">
        <div className="max-w-xs sm:max-w-sm pointer-events-auto">
          {activeHotspot ? (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              className="p-4 rounded-2xl bg-zinc-950/90 border border-emerald-500/40 backdrop-blur-xl shadow-2xl text-left space-y-2.5"
            >
              {(() => {
                const spec = HOTSPOTS.find(h => h.id === activeHotspot);
                if (!spec) return null;
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {spec.subtitle}
                      </span>
                      <button
                        onClick={() => setActiveHotspot(null)}
                        className="text-zinc-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-zinc-800"
                      >
                        ✕
                      </button>
                    </div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                      {spec.title}
                    </h3>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {spec.desc}
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={() => {
                          applyCameraPreset(spec.preset);
                        }}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
                      >
                        Aproximar Câmera
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          ) : (
            /* Subtle Hotspot Pills Quick Trigger */
            <div className="space-y-2 hidden md:block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Inspecionar Componentes:
              </span>
              <div className="flex flex-col gap-1.5">
                {HOTSPOTS.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setActiveHotspot(h.id);
                      applyCameraPreset(h.preset);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-emerald-500/40 text-left transition-all backdrop-blur-md group flex items-center justify-between"
                  >
                    <span className="text-xs font-medium text-zinc-300 group-hover:text-emerald-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {h.title}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM FLOATING CONTROLS HUD — ZERO OCCLUSION */}
      <footer className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-4 pointer-events-none">
        
        {/* Row 1: Camera Presets & Exploded View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Camera Angles */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-950/85 border border-zinc-800/80 backdrop-blur-md pointer-events-auto shadow-lg overflow-x-auto max-w-full">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase px-2 hidden sm:inline">
              Câmera:
            </span>
            {CAMERA_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyCameraPreset(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activePreset === p.id
                    ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Exploded / Anatomical View Button */}
          <button
            onClick={() => setIsExploded(!isExploded)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 pointer-events-auto backdrop-blur-md shadow-xl border ${
              isExploded
                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-amber-500/20'
                : 'bg-zinc-950/90 text-zinc-200 border-zinc-800 hover:border-emerald-500/50 hover:text-emerald-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isExploded ? 'Montar Kimono' : 'Explosão Anatômica'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30">
              {isExploded ? 'Visão Peças' : 'Fatiar'}
            </span>
          </button>
        </div>

        {/* Row 2: Customization Bar (Gi Fabric & BJJ Belt Selection) */}
        <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/85 border border-zinc-800/80 backdrop-blur-xl shadow-2xl pointer-events-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Gi Fabric Color Swatches */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 mr-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Cor do Kimono:
            </span>
            <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
              {GI_OPTIONS.map((gi) => (
                <button
                  key={gi.id}
                  onClick={() => setActiveGi(gi)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    activeGi.id === gi.id
                      ? 'bg-zinc-800 text-white border border-emerald-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${gi.accentPill} shrink-0`} />
                  <span>{gi.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Belt Color & Degree Stripes Picker */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Belt selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Graduação:
              </span>
              <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
                {BELT_OPTIONS.map((belt) => (
                  <button
                    key={belt.id}
                    onClick={() => setActiveBelt(belt)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeBelt.id === belt.id
                        ? 'bg-zinc-800 text-white border border-emerald-500/40 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title={`Faixa ${belt.name}`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/40 shrink-0"
                      style={{ backgroundColor: belt.hex }}
                    />
                    <span className={belt.textColor}>{belt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Degrees / Graus (0 to 4 stripes) */}
            <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 text-xs">
              <span className="text-[11px] font-mono text-zinc-400 px-1.5">Graus:</span>
              {[0, 1, 2, 3, 4].map((g) => (
                <button
                  key={g}
                  onClick={() => setStripes(g)}
                  className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center transition-all ${
                    stripes === g
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Catalog Filter Shortcut */}
            {onSelectCategory && (
              <button
                onClick={() => onSelectCategory('Kimonos')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Ver Todos os Kimonos</span>
              </button>
            )}
          </div>
        </div>

        {/* Interaction hints */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1 pointer-events-none">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
            Dica: Segure e arraste o mouse ou dedo para orbitar • Role para dar zoom
          </span>
          <span className="font-mono text-zinc-500">
            PBR Tatame Studio 3D • 100% Procedural
          </span>
        </div>
      </footer>
    </div>
  );
};
export default ThreeBJJHero;
