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

function updateOrthoCamera() {
  const aspect = engine.getRenderWidth() / engine.getRenderHeight();
  const orthoSize = 1;
  camera.orthoLeft = -orthoSize * aspect;
  camera.orthoRight = orthoSize * aspect;
  camera.orthoTop = orthoSize;
  camera.orthoBottom = -orthoSize;
}

updateOrthoCamera();

// Register shader
Effect.ShadersStore['customFragmentShader'] = fragmentShader2;
Effect.ShadersStore['customVertexShader'] = vertexShader;

// Fullscreen quad
const plane = MeshBuilder.CreatePlane('plane', { size: 2 }, scene);

// Shader material
const shaderMaterial = new ShaderMaterial('shader', scene, {
  vertex: 'custom',
  fragment: 'custom',
}, {
  attributes: ['position', 'uv'],
  uniforms: ['worldViewProjection', 'iTime', 'iMouse', 'uAlpha', 'uBeta', 'uGamma'],
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
});

const getSliderBeta = createSliderUI({
  label: 'Beta',
  min: 0,
  max: Math.PI * 2,
  step: 0.01,
  value: 0.3,
  id: 'slider1',
});

const getSliderGamma = createSliderUI({
  label: 'Gamma',
  min: 0,
  max: Math.PI * 2,
  step: 0.01,
  value: 1.0,
  id: 'slider1',
});

// Animate
engine.runRenderLoop(() => {
  const t = performance.now() * 0.001;

  mouse.x += mouseSpeed.x;
  mouse.y += mouseSpeed.y;
  mouseSpeed.x *= 0.9; // Dampen mouse speed
  mouseSpeed.y *= 0.9;

  shaderMaterial.setFloat('iTime', t);
  shaderMaterial.setVector2('iMouse', { x: mouse.x, y: mouse.y });
  shaderMaterial.setFloat('uAlpha', getSliderAlpha());
  shaderMaterial.setFloat('uBeta', getSliderBeta());
  shaderMaterial.setFloat('uGamma', getSliderGamma());
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

// canvas.addEventListener('pointerdown', () => {
//   requestFullscreen();
// }); // , { once: true }
