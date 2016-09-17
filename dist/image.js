'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var initMemoize = _interopDefault(require('persistent-memoize'));
var initBlobStore = _interopDefault(require('fs-blob-store'));
var querystring = _interopDefault(require('querystring'));
var request = _interopDefault(require('request-promise'));
var htmlparser2 = require('htmlparser2');
var Canvas = _interopDefault(require('canvas'));
var fs = _interopDefault(require('fs'));

const doMemoize = initMemoize(initBlobStore('cache'), { name: 'icky', version: '1.0.0' });

const memoize = fn => doMemoize(fn, fn.name);

const Options = { decodeEntities: true };
const cols = [];

let rows$1;
let row = {};
let index = 0;

const ontext = text => {
  if (rows$1 === undefined) {
    cols.push(text);
  } else {
    row[cols[index++]] = text; // === 'NULL' ? null : text;
  }
};

const onclosetag = name => {
  if (name === 'tr') {
    if (rows$1 === undefined) {
      rows$1 = [];
    } else {
      rows$1.push(row);
      row = {};
    }
    index = 0;
  }
};

const parse = html => {
  rows$1 = undefined;
  cols.length = 0;
  index = 0;
  const parser = new htmlparser2.Parser({ ontext, onclosetag }, Options);
  parser.parseComplete(html);
  return rows$1;
};

const entries = x => Object.keys(x).map(key => [key, x[key]]);

Object.entries = Object.entries || entries;

const values = x => Object.keys(x).map(key => x[key]);

Object.values = Object.values || values;

var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            return step("next", value);
          }, function (err) {
            return step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

const URL = 'http://crab.agiv.be/Examples/Home/ExecOperation';
const method = 'POST';
const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

const parameterMapping = ([Name, Value]) => ({ Name, Value });

const encodeParameters = x => Object.entries(x).map(parameterMapping);

let crabRequest = (() => {
  var _ref = asyncToGenerator(function* (operation, parameters) {
    const parametersJson = JSON.stringify(encodeParameters(parameters));
    const body = querystring.stringify({ operation, parametersJson });
    const html = yield request(URL, { method, headers, body });
    return parse(html);
  });

  return function crabRequest(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

memoize(crabRequest);

const log = (...args) => console.log(...args) || [...args];

class Color {
  constructor(uInt32) {
    this.value = uInt32;
  }

  comp(index) {
    return this.value >> index * 8 & 0xff;
  }

  inverse() {
    const r = 0xff - this.r;
    const g = 0xff - this.g;
    const b = 0xff - this.b;
    return Color.of(r | g << 8 | b << 16 | 0xff << 24);
  }

  get hex() {
    return this.value.toString(16);
  }

  get r() {
    return this.comp(0);
  }

  get g() {
    return this.comp(1);
  }

  get b() {
    return this.comp(2);
  }

  get a() {
    return this.comp(3);
  }

  get rgba() {
    return `rgba(${ this.r },${ this.g },${ this.b },${ this.a })`;
  }

  get int() {
    return this.r >> 5 << 6 | this.g >> 5 << 3 | this.b >> 5 << 0;
  }
}

Color.of = x => new Color(x);

const CSS = {
  color: x => `color: ${ x };`,
  bgColor: x => `background-color: ${ x };`
};

const { Image } = Canvas;

const styles = props => `style="${ props.join(' ') }"`;

const toRows = ({ count, color, rgba, int }) => ({ count, color, rgba, style: styles([CSS.bgColor(rgba)]), int });

const rows = ({ count, color, rgba, style, int }) => `      <tr ${ style }>
        <td align="right">${ count }</td>
        <td align="right">${ color.value.toString(16) }</td>
        <td>${ rgba }</td>
        <td align="right">${ int }</td>
      </tr>`;

const html = x => `<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    ${ x }
  </body>
</html>`;

const saveFile = (name, file) => fs.writeFile(name, file, err => {
  if (err) log(err);
  console.timeEnd('save');
  log(`${ name } saved`);
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
    if (pixel !== 0xff000000 && pixel !== 0xff1c0000 && pixel !== 0xff5a3300 && pixel !== 0xff000090 && pixel !== 0xff000066 && pixel !== 0xff00003a) {
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
${ colors.map(({ count, color }) => ({ count, hex: color.hex, color, rgba: color.rgba, int: color.int })).map(toRows).map(rows).join('\n') }
    </table>`);
  console.timeEnd('map');
  console.time('save');
  saveFile('color-map.html', colorMap);
});