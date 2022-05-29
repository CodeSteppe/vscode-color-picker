const root = document.documentElement;
const canvas = document.querySelector('.saturation-canvas');
const saturationBox = document.querySelector('.saturation-box');
const saturationPicker = saturationBox.querySelector('.saturation-picker');
const alphaStrip = document.querySelector('.strip.alpha');
const alphaSlider = alphaStrip.querySelector('.slider');
const hueStrip = document.querySelector('.strip.hue');
const hueSlider = hueStrip.querySelector('.slider');

const head = document.querySelector('.picker-head');
const colorString = document.querySelector('.color-string');
const brightnessIcon = document.querySelector('.brightness-icon');

// handlers
let pickingSaturationHandler, pickingHueHandler, pickingAlphaHandler;

// constants
const colorTypes = ['hex', 'rgb', 'hsl', 'hsv'];

// states
let saturation = 1; // 0-1
let brightness = 1; // 0-1
let alpha = 1; // 0-1
let hue = 0; // 0-360deg
let currentColor;
let currentColorType = 'hex';

function setCurrentColor() {
  currentColor = tinycolor(`hsva(${hue},${saturation * 100}%, ${brightness * 100}%, ${alpha})`);
  console.log(currentColor);
  head.style.backgroundColor = currentColor.toHex8String();
  setColorString();
  const isBgDark = brightness < 0.5 || alpha < 0.5;
  colorString.style.color = isBgDark ? '#fff' : '#000';
  brightnessIcon.style.filter = isBgDark ? 'invert(1)' : 'invert(0)';
  root.style.setProperty('--color', currentColor.toHexString());
}

setCurrentColor();

function setColorString() {
  let str = '';
  const opaque = currentColor.getAlpha() === 1;
  switch (currentColorType) {
    case 'hex':
      str = opaque ? currentColor.toHexString() : currentColor.toHex8String();
      break;
    case 'rgb':
      str = currentColor.toRgbString();
      break;
    case 'hsl':
      str = currentColor.toHslString();
      break;
    case 'hsv':
      str = currentColor.toHsvString();
      break;
    default:
      break;
  }
  if (str) {
    colorString.textContent = str;
  }
}

colorString.addEventListener('click', e => {
  let index = colorTypes.indexOf(currentColorType);
  if (index < colorTypes.length - 1) {
    index++;
  } else {
    index = 0;
  }
  currentColorType = colorTypes[index];
  setColorString();
});

function drawSaturationPicker() {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = tinycolor(`hsv ${hue} 1 1`).toHexString();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const whiteGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  whiteGradient.addColorStop(0, '#fff');
  whiteGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = whiteGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const blackGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  blackGradient.addColorStop(0, 'transparent');
  blackGradient.addColorStop(1, '#000');
  ctx.fillStyle = blackGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

drawSaturationPicker();

function handleMouseMove(target, callback, onHanlerCreate) {
  const rect = target.getBoundingClientRect();
  const { left, top, width, height } = rect;

  const handler = e => {
    const { clientX, clientY } = e;
    let x = clientX - left;
    let y = clientY - top;
    let xRatio, yRatio;
    if (x <= 0) {
      xRatio = 0;
      x = 0;
    } else if (x > width) {
      xRatio = 1;
      x = width;
    } else {
      xRatio = x / width;
    }

    if (y <= 0) {
      yRatio = 0;
      y = 0;
    } else if (y > height) {
      yRatio = 1;
      y = height;
    } else {
      yRatio = y / height;
    }

    callback({
      x,
      y,
      xRatio,
      yRatio
    });
  }

  onHanlerCreate(handler);
  window.addEventListener('mousemove', handler);
}

// handle saturation move
saturationBox.addEventListener('mousedown', e => {
  handleMouseMove(
    saturationBox,
    ({ x, y, xRatio, yRatio }) => {
      saturationPicker.style.left = x + 'px';
      saturationPicker.style.top = y + 'px';
      saturation = xRatio;
      brightness = 1 - yRatio;
      setCurrentColor();
    },
    (handler) => {
      pickingSaturationHandler = handler;
    }
  )
});

window.addEventListener('mouseup', e => {
  window.removeEventListener('mousemove', pickingSaturationHandler);
});
// handle alpha move
alphaStrip.addEventListener('mousedown', e => {
  handleMouseMove(
    alphaStrip,
    ({ y, yRatio }) => {
      alphaSlider.style.top = y + 'px';
      alpha = 1 - yRatio;
      setCurrentColor();
    },
    (handler) => {
      pickingAlphaHandler = handler;
    }
  )
});

window.addEventListener('mouseup', e => {
  window.removeEventListener('mousemove', pickingAlphaHandler);
});
// handle hue move
hueStrip.addEventListener('mousedown', e => {
  handleMouseMove(
    hueStrip,
    ({ y, yRatio }) => {
      hueSlider.style.top = y + 'px';
      hue = yRatio * 360;
      setCurrentColor();
      drawSaturationPicker();
    },
    (handler) => {
      pickingHueHandler = handler;
    }
  )
});

window.addEventListener('mouseup', e => {
  window.removeEventListener('mousemove', pickingHueHandler);
});