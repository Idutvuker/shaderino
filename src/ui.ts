// src/ui.ts
// Creates a slider UI and returns a getter for its value
export function createSliderUI({
  label = 'Slider',
  min = 0.1,
  max = 10,
  step = 0.01,
  value = 3.0,
  id = 'slider1',
  unit = ''
} = {}) {
  const sliderContainer = document.createElement('div');
  sliderContainer.style.position = 'static'; // Remove fixed positioning from individual sliders
  sliderContainer.style.left = '16px';
  sliderContainer.style.zIndex = '10';
  sliderContainer.style.background = 'rgba(0,0,0,0.5)';
  sliderContainer.style.padding = '8px 12px';
  sliderContainer.style.borderRadius = '8px';
  sliderContainer.style.color = '#fff';
  sliderContainer.style.fontFamily = 'sans-serif';
  sliderContainer.style.userSelect = 'none';
  sliderContainer.style.marginTop = '8px';

  // Find or create a parent container for stacking
  let parent = document.getElementById('slider-stack-container');
  if (!parent) {
    parent = document.createElement('div');
    parent.id = 'slider-stack-container';
    parent.style.position = 'fixed';
    parent.style.top = '16px';
    parent.style.left = '16px';
    parent.style.zIndex = '10';
    parent.style.display = 'flex';
    parent.style.flexDirection = 'column';
    parent.style.gap = '0';
    document.body.appendChild(parent);
  }
  parent.appendChild(sliderContainer);

  const sliderLabel = document.createElement('label');
  sliderLabel.textContent = label + ': ';
  sliderLabel.htmlFor = id;

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = String(min);
  slider.max = String(max);
  slider.step = String(step);
  slider.value = String(value);
  slider.id = id;
  slider.style.verticalAlign = 'middle';
  slider.style.margin = '0 8px';

  const sliderValue = document.createElement('span');
  sliderValue.textContent = slider.value + unit;

  slider.addEventListener('input', () => {
    sliderValue.textContent = slider.value + unit;
  });

  sliderContainer.appendChild(sliderLabel);
  sliderContainer.appendChild(slider);
  sliderContainer.appendChild(sliderValue);

  return () => parseFloat(slider.value);
}
