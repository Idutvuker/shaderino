import './style.css'
import { Engine, Scene, Effect, ShaderMaterial, MeshBuilder, FreeCamera, Vector3 } from 'babylonjs';
import { fragmentShader, vertexShader } from './shader';

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
canvas.tabIndex = -1;
document.body.style.margin = '0';
document.body.appendChild(canvas);

// Babylon.js engine and scene
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

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

// Remove camera controls so it does not react to mouse/touch
// camera.attachControl(canvas, true);

// Register shader
Effect.ShadersStore['customFragmentShader'] = fragmentShader;
Effect.ShadersStore['customVertexShader'] = vertexShader;

// Fullscreen quad
const plane = MeshBuilder.CreatePlane('plane', { size: 2 }, scene);

// Shader material
const shaderMaterial = new ShaderMaterial('shader', scene, {
  vertex: 'custom',
  fragment: 'custom',
}, {
  attributes: ['position', 'uv'],
  uniforms: ['worldViewProjection', 'iTime'],
});

shaderMaterial.setFloat('iTime', 0);
plane.material = shaderMaterial;

// Animate
engine.runRenderLoop(() => {
  const t = performance.now() * 0.001;
  shaderMaterial.setFloat('iTime', t);
  scene.render();
});

window.addEventListener('resize', () => {
  engine.resize();
  updateOrthoCamera();
});

// Request fullscreen on user interaction
function requestFullscreen() {
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if ((canvas as any).webkitRequestFullscreen) {
    (canvas as any).webkitRequestFullscreen(); // Safari
  } else if ((canvas as any).msRequestFullscreen) {
    (canvas as any).msRequestFullscreen(); // IE11
  }
}

canvas.addEventListener('pointerdown', () => {
  requestFullscreen();
}); // , { once: true }
