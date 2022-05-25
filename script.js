const colorTypes = ['hex', 'rgb', 'hsl', 'hsv'];

// states
let currentColor;
let hue = 0;
let saturation = 1;
let brightness = 1;
let alpha = 1;
let currentColorType = 'hex';
let pickingSaturation = false;
let pickingAlpha = false;
let pickingHue = false;

let pickingSaturationHandler, pickingAlphaHandler, pickingHueHandler;

// DOM
const root = document.documentElement;
const canvas = document.querySelector('.saturation-canvas');
const canvasRect = canvas.getBoundingClientRect();
// head
const head = document.querySelector('.picker-head');
const colorString = document.querySelector('.color-string');
const brightnessIcon = document.querySelector('.brightness-icon');
// body
const saturationBox = document.querySelector('.saturation-box');
const saturationPicker = document.querySelector('.saturation-picker');
// strips
const alphaStrip = document.querySelector('.strip.alpha');
const alphaStripRect = alphaStrip.getBoundingClientRect();
const alphaSlider = alphaStrip.querySelector('.slider');
const hueStrip = document.querySelector('.strip.hue');
const hueStripRect = alphaStrip.getBoundingClientRect();
const hueSlider = hueStrip.querySelector('.slider');


function drawSaturationColor() {
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

const setColorString = () => {
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

const setCurrentColor = () => {
  /**
   * hsv: hue, saturation, value(brightness)
   * hue: degree
   * saturation: 0-1, 0=gray, 1=primary color
   * value: 0-1, 0=black, 1=brightest
   */
  currentColor = tinycolor(`hsva(${hue}, ${saturation * 100}%, ${brightness * 100}%, ${alpha}`);
  setColorString();
  head.style.backgroundColor = currentColor.toHex8String();
  root.style.setProperty('--color', currentColor.toHexString());
  const isDarkColor = brightness < 0.5;
  colorString.style.color = isDarkColor ? '#fff' : '#000';
  brightnessIcon.style.filter = isDarkColor ? 'invert(1)' : 'invert(0)';
}

setCurrentColor();
drawSaturationColor();

// handle saturation, brightness
saturationBox.addEventListener('mousedown', e => {
  handleMousemove(
    saturationBox,
    ({ x, y, xRatio, yRatio }) => {
      saturationPicker.style.left = x + 'px';
      saturationPicker.style.top = y + 'px';
      saturation = xRatio;
      brightness = 1 - yRatio;
      setCurrentColor();
    },
    (handler) => {
      pickingSaturationHandler = handler
    }
  )
});

window.addEventListener('mouseup', e => {
  window.removeEventListener('mousemove', pickingSaturationHandler);
});

// handle alpha
alphaStrip.addEventListener('mousedown', e => {
  handleMousemove(
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

// handle hue
hueStrip.addEventListener('mousedown', e => {
  handleMousemove(
    hueStrip,
    ({ y, yRatio }) => {
      hueSlider.style.top = y + 'px';
      hue = yRatio * 360;
      drawSaturationColor();
      setCurrentColor();
    },
    (handler) => {
      pickingHueHandler = handler;
    }
  )
});

window.addEventListener('mouseup', e => {
  window.removeEventListener('mousemove', pickingHueHandler);
});

// toggle color string
colorString.addEventListener('click', () => {
  let index = colorTypes.indexOf(currentColorType);
  if (index < colorTypes.length - 1) {
    index++;
  } else {
    index = 0;
  }
  currentColorType = colorTypes[index];
  setColorString();
}, []);

/**
 * handle mouse move
 * get mouse position in target 
 */
function handleMousemove(target, callback, onHandlerCreate) {
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
      xRatio = 1
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
  onHandlerCreate(handler)
  window.addEventListener('mousemove', handler);
}