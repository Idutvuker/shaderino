import './style.css'
import { Engine, Scene, Effect, ShaderMaterial, MeshBuilder, FreeCamera, Vector3 } from 'babylonjs';
import { fragmentShader2, vertexShader } from './shader';
import { createSliderUI } from './ui';

// Remove all previous HTML
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = '';

// Create canvas
const canvas = document.createElement('canvas');
canvas.id = 'renderCanvas';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.display = 'block';
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '0';
canvas.style.outline = 'none';
canvas.style.background = '#000';
canvas.tabIndex = -1;
document.body.style.margin = '0';
document.body.style.background = '#000';
document.body.appendChild(canvas);

// Babylon.js engine and scene
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
scene.clearColor.set(0, 0, 0, 1); // Set Babylon.js scene background to black

// Add a camera (required by Babylon.js)
const camera = new FreeCamera('camera', new Vector3(0, 0, -1), scene);
camera.setTarget(Vector3.Zero());
camera.mode = FreeCamera.ORTHOGRAPHIC_CAMERA;

// Fullscreen quad
const plane = MeshBuilder.CreatePlane('plane', { size: 2 }, scene);

function updateOrthoCamera() {
  const aspect = engine.getRenderWidth() / engine.getRenderHeight();
  const orthoSize = 1;
  camera.orthoLeft = -orthoSize * aspect;
  camera.orthoRight = orthoSize * aspect;
  camera.orthoTop = orthoSize;
  camera.orthoBottom = -orthoSize;
  // Resize the plane to always cover the viewport
  plane.scaling.x = aspect;
  plane.scaling.y = 1;
}

updateOrthoCamera();

// Register shader
Effect.ShadersStore['customFragmentShader'] = fragmentShader2;
Effect.ShadersStore['customVertexShader'] = vertexShader;

// Shader material
const shaderMaterial = new ShaderMaterial('shader', scene, {
  vertex: 'custom',
  fragment: 'custom',
}, {
  attributes: ['position', 'uv'],
  uniforms: ['worldViewProjection', 'iTime', 'iMouse', 'uAlpha', 'uBeta', 'uGamma', 'uAspect', 'uZoom', 'uRadius', 'uIters'],
});

shaderMaterial.setFloat('iTime', 0);
plane.material = shaderMaterial;

// Track mouse position and pass as uniform
let mouse = { x: 0.0, y: 0.0 };
let isPointerDown = false;
let mouseSpeed = { x: 0.0, y: 0.0 };

canvas.addEventListener('pointerdown', () => {
  isPointerDown = true;
});

canvas.addEventListener('pointerup', () => {
  isPointerDown = false;
});

canvas.addEventListener('pointermove', (e) => {
  if (isPointerDown) {
    let dx = e.movementX / canvas.clientWidth;
    let dy = e.movementY / canvas.clientHeight;

    mouseSpeed.x = dx;
    mouseSpeed.y = -dy;
  }
});

// === UI SLIDER SETUP ===
// @ts-ignore
const getSliderAlpha = createSliderUI({
  label: 'Alpha',
  min: 0,
  max: Math.PI * 2,
  step: 0.01,
  value: 0.0,
  id: 'slider1',
  smooth: true,
  smoothFactor: 0.1
});
// @ts-ignore
const getSliderBeta = createSliderUI({
  label: 'Beta',
  min: 0,
  max: Math.PI * 2,
  step: 0.01,
  value: 0.3,
  id: 'slider2',
  smooth: true,
  smoothFactor: 0.1
});
// @ts-ignore
const getSliderGamma = createSliderUI({
  label: 'Gamma',
  min: 0,
  max: Math.PI * 2,
  step: 0.01,
  value: 1.0,
  id: 'slider3',
  smooth: true,
  smoothFactor: 0.1
});
const getSliderZoom = createSliderUI({
  label: 'Zoom',
  min: 1,
  max: 10,
  step: 0.01,
  value: 1.0,
  id: 'slider4',
  smooth: true,
  smoothFactor: 0.1
});
const getSliderRadius = createSliderUI({
  label: 'Radius',
  min: 0.001,
  max: 0.2,
  step: 0.001,
  value: 0.02,
  id: 'sliderRadius',
  smooth: true,
  smoothFactor: 0.1
});
const getSliderIters = createSliderUI({
  label: 'Iterations',
  min: 1,
  max: 30,
  step: 1,
  value: 10,
  id: 'sliderIters',
  smooth: false
});

const dampFactor = 0.92; // Dampen mouse speed

// Animate
engine.runRenderLoop(() => {
  const t = performance.now() * 0.001;
  const aspect = engine.getRenderWidth() / engine.getRenderHeight();

  mouse.x += mouseSpeed.x;
  mouse.y += mouseSpeed.y;
  mouseSpeed.x *= dampFactor; // Dampen mouse speed
  mouseSpeed.y *= dampFactor;

  shaderMaterial.setFloat('iTime', t);
  shaderMaterial.setVector2('iMouse', { x: mouse.x, y: mouse.y });

  // shaderMaterial.setFloat('uAlpha', getSliderAlpha());
  // shaderMaterial.setFloat('uBeta', getSliderBeta());
  // shaderMaterial.setFloat('uGamma', getSliderGamma());

  shaderMaterial.setFloat('uAlpha', orientation.alpha);
  shaderMaterial.setFloat('uBeta', orientation.beta);
  shaderMaterial.setFloat('uGamma', orientation.gamma);

  shaderMaterial.setFloat('uAspect', aspect);
  shaderMaterial.setFloat('uZoom', getSliderZoom());
  shaderMaterial.setFloat('uRadius', getSliderRadius());
  shaderMaterial.setInt('uIters', getSliderIters());
  scene.render();
});

window.addEventListener('resize', () => {
  engine.resize();
  updateOrthoCamera();
});

// Request fullscreen on user interaction
// @ts-ignore
function requestFullscreen() {
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if ((canvas as any).webkitRequestFullscreen) {
    (canvas as any).webkitRequestFullscreen(); // Safari
  } else if ((canvas as any).msRequestFullscreen) {
    (canvas as any).msRequestFullscreen(); // IE11
  }
}

// --- Device orientation (PWA/iOS/Android/desktop) ---
let orientation = { alpha: 0, beta: 0, gamma: 0 };

function handleOrientation(event: DeviceOrientationEvent) {
  orientation.alpha = event.alpha || 0;
  orientation.beta = event.beta || 0;
  orientation.gamma = event.gamma || 0;
}

function enableDeviceOrientation() {
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
    // iOS 13+ (including PWA) requires permission
    (DeviceOrientationEvent as any).requestPermission().then((response: string) => {
      if (response === 'granted') {
        window.addEventListener('deviceorientation', handleOrientation, true);
      } else {
        alert('Device orientation permission denied.');
      }
    }).catch(() => {
      alert('Device orientation permission error.');
    });
  } else {
    // Android, desktop, or older iOS: just add listener
    window.addEventListener('deviceorientation', handleOrientation, true);
  }
}

// Show button only if permission is needed (iOS)
if (typeof DeviceOrientationEvent !== 'undefined' &&
    typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
  const motionBtn = document.createElement('button');
  motionBtn.textContent = 'Enable Motion';
  motionBtn.style.position = 'fixed';
  motionBtn.style.bottom = '16px';
  motionBtn.style.left = '16px';
  motionBtn.style.zIndex = '20';
  document.body.appendChild(motionBtn);
  motionBtn.addEventListener('click', () => {
    enableDeviceOrientation();
    motionBtn.style.display = 'none';
  });
} else {
  // Non-iOS: enable immediately
  enableDeviceOrientation();
}
