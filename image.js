import { log } from './CRAB';
import Canvas from 'canvas';
import fs from 'fs';
import Color from './Color';
import CSS from './CSS';

const { Image } = Canvas;

const styles = props => `style="${props.join(' ')}"`;

const toRows = ({ count, color, rgba, int }) =>
  ({ count, color, rgba, style: styles([CSS.bgColor(rgba)]), int });

const rows = ({ count, color, rgba, style, int }) => `      <tr ${style}>
        <td align="right">${count}</td>
        <td align="right">${color.value.toString(16)}</td>
        <td>${rgba}</td>
        <td align="right">${int}</td>
      </tr>`;

const html = x => `<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    ${x}
  </body>
</html>`;

const saveFile = (name, file) => fs.writeFile(name, file, err => {
  if (err) log(err);
  console.timeEnd('save');
  log(`${name} saved`);
});

const loadImage = src => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = err => reject(err);
  image.src = src;
});

console.time('loading');
loadImage('hoogte.png').then(image => {
  console.timeEnd('loading');
  console.time('canvas');
  const { width, height } = image;
  const canvas = new Canvas(width, height);
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  console.timeEnd('canvas');
  console.time('imagedata');
  const imagedata = context.getImageData(0, 0, width, height);
  const { data } = imagedata;
  const data32 = new Uint32Array(data.buffer);
  console.timeEnd('imagedata');
  data32.forEach((pixel, index) => {
    if (
      pixel !== 0xff000000 &&
      pixel !== 0xff1c0000 &&
      pixel !== 0xff5a3300 &&
      pixel !== 0xff000090 &&
      pixel !== 0xff000066 &&
      pixel !== 0xff00003a
    ) {
      data32[index] = 0;
    } else {
      data32[index] = 0xff000000;
    }
    /* if (pixel === 0 || pixel === 0xff0000ff || pixel === 0xff7f7fff) {
      data32[index] = 0;
    } else {
      // data32[index] = 0xff000000;
    }*/
  });
  context.putImageData(imagedata, 0, 0);
  fs.writeFileSync('hoogte2.png', canvas.toBuffer(), 'binary');
  console.time('map');
  const map = new Map();
  const set = new Set();
  for (const pixel of data32) {
    if (!set.has(pixel)) {
      set.add(pixel);
      map.set(pixel, 0);
    } else {
      map.set(pixel, map.get(pixel) + 1);
    }
  }
  const colors = [...set].map(x => ({ count: map.get(x), color: Color.of(x) }));
  colors.sort((a, b) => b.color.int - a.color.int || b.count - a.count);
  const colorMap = html(`<table>
      <tr>
        <th>#</th>
        <th>Hex</th>
        <th>RGBA</th>
        <th>Int</th>
      </tr>
${colors
    .map(({ count, color }) => ({ count, hex: color.hex, color, rgba: color.rgba, int: color.int }))
    .map(toRows)
    .map(rows).join('\n')}
    </table>`);
  console.timeEnd('map');
  console.time('save');
  saveFile('color-map.html', colorMap);
});
