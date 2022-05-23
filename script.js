let currentColor;
let hue = 0;
let saturation = 1;
let brightness = 1;
let alpha = 1;

const canvas = document.querySelector('.saturation-canvas');
const canvasRect = canvas.getBoundingClientRect();
// head
const colorString = document.querySelector('.color-string');
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

const setCurrentColor = () => {
  currentColor = tinycolor(`hsva(${hue}, ${saturation * 100}%, ${brightness * 100}%, ${alpha}`);
  const hexString = currentColor.toHexString();
  const hex8String = currentColor.toHex8String();
  document.body.style.backgroundColor = hex8String;
  if (currentColor.getAlpha() === 1) {
    colorString.textContent = hexString;
  } else {
    colorString.textContent = hex8String;
  }
}

setCurrentColor();
drawSaturationColor();

// handle saturation, brightness
const onSaturationMove = e => {
  const { offsetX, offsetY, target } = e;
  if (target !== canvas) return;
  saturationPicker.style.left = offsetX + 'px';
  saturationPicker.style.top = offsetY + 'px';
  const xRatio = offsetX / canvasRect.width;
  const yRatio = offsetY / canvasRect.height;
  // console.log(xRatio, yRatio);
  /**
   * hsv: hue, saturation, value(brightness)
   * hue: degree
   * saturation: 0-1, 0=gray, 1=primary color
   * value: 0-1, 0=black, 1=brightest
   */
  saturation = xRatio;
  brightness = 1 - yRatio;
  setCurrentColor();
}

saturationBox.addEventListener('mousedown', e => {
  saturationBox.addEventListener('mousemove', onSaturationMove);
});

saturationBox.addEventListener('mouseup', e => {
  saturationBox.removeEventListener('mousemove', onSaturationMove);
});

saturationBox.addEventListener('mouseleave', e => {
  saturationBox.removeEventListener('mousemove', onSaturationMove);
});

// handle alpha
const onAlphaMove = e => {
  const { offsetX, offsetY, target } = e;
  if (target !== alphaStrip) return;
  alphaSlider.style.top = offsetY + 'px';
  const yRatio = offsetY / alphaStripRect.height;
  alpha = 1 - yRatio;
  setCurrentColor();
}

alphaStrip.addEventListener('mousedown', e => {
  alphaStrip.addEventListener('mousemove', onAlphaMove);
});

alphaStrip.addEventListener('mouseup', e => {
  alphaStrip.removeEventListener('mousemove', onAlphaMove);
});

alphaStrip.addEventListener('mouseleave', e => {
  alphaStrip.removeEventListener('mousemove', onAlphaMove);
});


// handle hue
const onHueMove = e => {
  const { offsetX, offsetY, target } = e;
  if (target !== hueStrip) return;
  hueSlider.style.top = offsetY + 'px';
  const yRatio = offsetY / hueStripRect.height;
  hue = yRatio * 360;
  drawSaturationColor();
  setCurrentColor();
}

hueStrip.addEventListener('mousedown', e => {
  hueStrip.addEventListener('mousemove', onHueMove);
});

hueStrip.addEventListener('mouseup', e => {
  hueStrip.removeEventListener('mousemove', onHueMove);
});

hueStrip.addEventListener('mouseleave', e => {
  hueStrip.removeEventListener('mousemove', onHueMove);
});



