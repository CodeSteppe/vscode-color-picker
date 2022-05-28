// DOM
const root = document.documentElement;
const head = document.querySelector('.picker-head');
const colorString = document.querySelector('.color-string');
const brightnessIcon = document.querySelector('.brightness-icon');

const saturationBox = document.querySelector('.saturation-box');
const saturationPicker = saturationBox.querySelector('.saturation-picker');
const canvas = document.querySelector('.saturation-canvas');
const alphaStrip = document.querySelector('.alpha.strip');
const hueStrip = document.querySelector('.hue.strip');
const alphaSlider = alphaStrip.querySelector('.slider');
const hueSlider = hueStrip.querySelector('.slider');

// constants
const colorTypes = ['hex', 'rgb', 'hsl', 'hsv'];

// states
let currentColor;
let hue = 0;
let saturation = 1;
let brightness = 1;
let alpha = 1;
let currentColorType = 'hex';
let pickingSaturationHandler, pickingAlphaHandler, pickingHueHandler;

function setCurrentColor() {
  currentColor = tinycolor(`hsva(${hue}, ${saturation * 100}%, ${brightness * 100}%, ${alpha})`);
  setColorString();
  
  root.style.setProperty('--hex-color', currentColor.toHexString());
  root.style.setProperty('--hex8-color', currentColor.toHex8String());
  
  const isBgDark = brightness < 0.5 || alpha < 0.5;
  colorString.style.color = isBgDark ? '#fff' : '#000';
  brightnessIcon.style.filter = isBgDark ? 'invert(1)' : 'invert(0)';
}

setCurrentColor();

function drawSaturationColor() {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = currentColor.toHexString();
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

drawSaturationColor();

function handleMouseMove(target, callback, onHandlerCreate) {
  const rect = target.getBoundingClientRect();
  const { top, left, width, height } = rect;

  function handler(e) {
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

  onHandlerCreate(handler);

  window.addEventListener('mousemove', handler);
}

// handle saturation
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

// handle alpha
alphaStrip.addEventListener('mousedown', e => {
  handleMouseMove(
    alphaStrip,
    ({ y, yRatio }) => {
      alphaSlider.style.top = y + 'px';
      alpha = 1 - yRatio;
      console.log('alpha', alpha);
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

// handle hue
hueStrip.addEventListener('mousedown', e => {
  handleMouseMove(
    hueStrip,
    ({ y, yRatio }) => {
      hueSlider.style.top = y + 'px';
      hue = yRatio * 360;
      console.log('hue', hue);
      setCurrentColor();
      drawSaturationColor();
    },
    (handler) => {
      pickingHueHandler = handler;
    }
  )
});

window.addEventListener('mouseup', e => {
  window.removeEventListener('mousemove', pickingHueHandler);
});

colorString.addEventListener('click', () => {
  let index = colorTypes.indexOf(currentColorType);
  if (index < colorTypes.length - 1) {
    index++;
  } else {
    index = 0;
  }
  currentColorType = colorTypes[index];
  setColorString();
})

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