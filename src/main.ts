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
  uniforms: ['worldViewProjection', 'iTime', 'iMouse', 'uAlpha', 'uBeta', 'uGamma', 'uAspect'],
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
const getSliderBeta = createSliderUI({
  label: 'Beta',
  min: 0,
  max: Math.PI * 2,
  step: 0.01,
  value: 0.3,
  id: 'slider1',
  smooth: true,
  smoothFactor: 0.1
});
const getSliderGamma = createSliderUI({
  label: 'Gamma',
  min: 0,
  max: Math.PI * 2,
  step: 0.01,
  value: 1.0,
  id: 'slider1',
  smooth: true,
  smoothFactor: 0.1
});

// --- Fullscreen Button ---
function addFullscreenButton() {
  const btn = document.createElement('button');
  btn.textContent = 'Go Fullscreen';
  btn.style.position = 'fixed';
  btn.style.bottom = '32px';
  btn.style.left = '50%';
  btn.style.transform = 'translateX(-50%)';
  btn.style.zIndex = '1000';
  btn.style.padding = '12px 24px';
  btn.style.fontSize = '1.2em';
  btn.style.background = 'rgba(0,0,0,0.8)';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '8px';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  btn.style.userSelect = 'none';

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    requestFullscreen();
    // btn.remove();
  }, { passive: false });

  document.body.appendChild(btn);
}
addFullscreenButton();

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
  shaderMaterial.setFloat('uAlpha', getSliderAlpha());
  shaderMaterial.setFloat('uBeta', getSliderBeta());
  shaderMaterial.setFloat('uGamma', getSliderGamma());
  shaderMaterial.setFloat('uAspect', aspect);
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
