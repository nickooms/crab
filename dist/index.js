'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var initMemoize = _interopDefault(require('persistent-memoize'));
var initBlobStore = _interopDefault(require('fs-blob-store'));
var querystring = _interopDefault(require('querystring'));
var request = _interopDefault(require('request-promise'));
var htmlparser2 = require('htmlparser2');
var fs = _interopDefault(require('fs'));
var http = _interopDefault(require('http'));

const doMemoize = initMemoize(initBlobStore('cache'), { name: 'icky', version: '1.0.0' });

const memoize = fn => doMemoize(fn, fn.name);

const Options = { decodeEntities: true };
const cols = [];

let rows;
let row = {};
let index = 0;

const ontext = text => {
  if (rows === undefined) {
    cols.push(text);
  } else {
    row[cols[index++]] = text; // === 'NULL' ? null : text;
  }
};

const onclosetag = name => {
  if (name === 'tr') {
    if (rows === undefined) {
      rows = [];
    } else {
      rows.push(row);
      row = {};
    }
    index = 0;
  }
};

const parse = html => {
  rows = undefined;
  cols.length = 0;
  index = 0;
  const parser = new htmlparser2.Parser({ ontext, onclosetag }, Options);
  parser.parseComplete(html);
  return rows;
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

var crabRequest$1 = memoize(crabRequest);

class CrabObjecten extends Map {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.toArray = () => [...this.values()], _temp;
  }

}

class CrabObject {
  constructor(x) {
    Object.assign(this, this.constructor.map(x));
  }

  static crab(operation, parameters) {
    return asyncToGenerator(function* () {
      return yield crabRequest$1(operation, parameters);
    })();
  }
}

CrabObject.id = x => typeof x === 'object' ? x.id : x;

const begin = x => ({
  datum: new Date(x.BeginDatum),
  tijd: new Date(x.BeginTijd),
  bewerking: +x.BeginBewerking,
  organisatie: +x.BeginOrganisatie
});

const toEntry = x => [x.id, x];

const toMap = x => new Map(x.map(toEntry));

const groupByFn = groupBys => (groups, x) => {
  const keys = [];
  groupBys.forEach(groupBy => {
    const key = x[groupBy];
    delete x[groupBy];
    keys.push(key);
  });
  const key = JSON.stringify(keys);
  if (!groups.has(key)) {
    groups.set(key, []);
  }
  groups.get(key).push(x);
  return groups;
};

const groupFn = (groupBys, groupField) => ([keys, value]) => {
  const keysObject = JSON.parse(keys);
  const entry = {};
  groupBys.forEach((groupBy, index) => {
    Object.assign(entry, { [groupBy]: keysObject[index] });
  });
  Object.assign(entry, { [groupField]: value });
  return entry;
};

const groupBy = (x, groupBys, group) => [...x.reduce(groupByFn(groupBys), new Map())].map(groupFn(groupBys, group));

const SorteerVeld = 0;

const NAME = 'Gewest';
const NAMES = `${ NAME }en`;
const ID = `${ NAME }Id`;

class Gewesten extends CrabObjecten {}

class GewestTaal extends CrabObject {}

GewestTaal.new = x => new GewestTaal(x);

GewestTaal.map = x => ({
  id: x.TaalCodeGewestNaam,
  naam: x.GewestNaam
});

class Gewest extends CrabObject {

  taal(taalId) {
    return { id: this.id, naam: this.talen.get(taalId).naam };
  }

  static list() {
    var _this = this;

    return asyncToGenerator(function* () {
      const x = yield _this.crab(`List${ NAMES }`, { SorteerVeld });
      const grouped = Gewest.group(x);
      return new Gewesten(grouped.map(Gewest.new).map(toEntry));
    })();
  }

  static get(gewest) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      const id = _this2.id(gewest);
      const x = yield _this2.crab(`List${ NAMES }`, { SorteerVeld });
      const grouped = Gewest.group(x);
      const gewesten = new Gewesten(grouped.map(Gewest.new).map(toEntry));
      return gewesten.get(id);
    })();
  }
}

Gewest.new = x => new Gewest(x);

Gewest.map = x => ({
  id: +x[ID],
  talen: toMap(x.talen.map(taal => GewestTaal.new(taal)))
});

Gewest.group = x => groupBy(x, [ID], 'talen');

class Point {
  constructor(...args) {
    switch (args.length) {
      case 1:
        {
          const arg = args[0];
          if (arg instanceof Point) {
            this.x = arg.x;
            this.y = arg.y;
          }
          if (arg instanceof Array) {
            const [x, y] = arg;
            if (typeof x === 'number' && typeof y === 'number') {
              this.x = x;
              this.y = y;
            } else {
              this.x = parseFloat(x.replace(',', '.'));
              this.y = parseFloat(y.replace(',', '.'));
            }
          }
          break;
        }
      case 2:
        {
          const [arg1, arg2] = args;
          if (typeof arg1 === 'number') this.x = arg1;
          if (typeof arg2 === 'number') this.y = arg2;
          break;
        }
      default:
        break;
    }
  }

  move(x, y) {
    this.x += x;
    this.y += y;
  }
}

const NAME$2 = 'Gemeente';
const NAMES$3 = `${ NAME$2 }n`;
const ID$3 = `${ NAME$2 }Id`;

const Groups = ['GemeenteId', 'TaalCode', 'TaalCodeTweedeTaal', 'NISGemeenteCode'];

// const taal = (x, taalId) => ({ id: x.id, naam: x.talen.get(taalId).naam, nisId: x.nisId });

class Gemeenten extends CrabObjecten {}
/* taal(taalId) {
  return this.toArray().map(x => ({ id: x.id, naam: x.talen.get(taalId).naam, nisId: x.nisId }));
}*/


/* class GemeenteTaal extends CrabObject {
  static new = x => new GemeenteTaal(x);

  static map = x => ({
    id: x.TaalCodeGemeenteNaam,
    naam: x.GemeenteNaam,
  })
}*/

class Gemeente extends CrabObject {

  static get(gemeente) {
    var _this = this;

    return asyncToGenerator(function* () {
      const GemeenteId = _this.id(gemeente);
      return _this.getResult((yield _this.crab(`Get${ NAME$2 }By${ ID$3 }`, { GemeenteId })));
    })();
  }

  /* static taal(x, taalId) {
    return taal(x, taalId);
  }*/

  static byPostkanton(PostkantonCode) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      const x = yield _this2.crab(`Find${ NAMES$3 }ByPostkanton`, { PostkantonCode, SorteerVeld });
      return _this2.getResult(x);
    })();
  }

  static byNaam(GemeenteNaam, gewest) {
    var _this3 = this;

    return asyncToGenerator(function* () {
      const GewestId = Gewest.id(gewest);
      const x = yield _this3.crab(`Find${ NAMES$3 }`, { GemeenteNaam, GewestId, SorteerVeld });
      return _this3.getResult(x);
    })();
  }

  static byGewest(gewest) {
    var _this4 = this;

    return asyncToGenerator(function* () {
      const GewestId = Gewest.id(gewest);
      const x = yield _this4.crab(`List${ NAMES$3 }ByGewestId`, { GewestId, SorteerVeld });
      return _this4.result(x);
    })();
  }
}

Gemeente.new = x => new Gemeente(x);

Gemeente.map = x => ({
  id: +x[ID$3],
  naam: x[`${ NAME$2 }Naam`],
  // talen: toMap(x.talen.map(GemeenteTaal.new)),
  taal: x.TaalCode,
  taal2: x.TaalCodeTweedeTaal,
  nisId: +x[`NIS${ NAME$2 }Code`]
});

Gemeente.object = x => Object.assign(Gemeente.new(x), Gemeente.getMap(x));

Gemeente.getMap = x => ({
  center: new Point(x.CenterX, x.CenterY),
  min: new Point(x.MinimumX, x.MinimumY),
  max: new Point(x.MaximumX, x.MaximumY)
});

Gemeente.group = x => groupBy(x, Groups, 'talen');

Gemeente.result = x => new Gemeenten(Gemeente.group(x).map(Gemeente.new).map(toEntry));

Gemeente.getResult = x => x.map(Gemeente.object)[0];

const NAME$3 = 'Straatnaam';
const NAMES$4 = 'Straatnamen';
const ID$4 = `${ NAME$3 }Id`;

class Straten extends CrabObjecten {}

class Straat extends CrabObject {

  static byGemeente(gemeente) {
    var _this = this;

    return asyncToGenerator(function* () {
      const GemeenteId = Gemeente.id(gemeente);
      return _this.result((yield _this.crab(`List${ NAMES$4 }ByGemeenteId`, { GemeenteId, SorteerVeld })));
    })();
  }

  static byNaam(Straatnaam, gemeente) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      const GemeenteId = Gemeente.id(gemeente);
      return _this2.result((yield _this2.crab(`Find${ NAMES$4 }`, { Straatnaam, GemeenteId, SorteerVeld })));
    })();
  }

  static get(straat) {
    var _this3 = this;

    return asyncToGenerator(function* () {
      const StraatnaamId = _this3.id(straat);
      return _this3.getResult((yield _this3.crab(`Get${ NAME$3 }By${ ID$4 }`, { StraatnaamId })));
    })();
  }

  static getByNaam(Straatnaam, gemeente) {
    var _this4 = this;

    return asyncToGenerator(function* () {
      const GemeenteId = Gemeente.id(gemeente);
      return _this4.getResult((yield _this4.crab(`Get${ NAME$3 }By${ NAME$3 }`, { Straatnaam, GemeenteId })));
    })();
  }

  huisnummers() {
    var _this5 = this;

    return asyncToGenerator(function* () {
      return (yield Huisnummer.byStraatnaam(_this5.id)).toArray();
    })();
  }

  wegobjecten() {
    var _this6 = this;

    return asyncToGenerator(function* () {
      return (yield Wegobject.byStraat(_this6.id)).toArray();
    })();
  }

  wegsegmenten() {
    var _this7 = this;

    return asyncToGenerator(function* () {
      return (yield Wegsegment.byStraat(_this7.id)).toArray();
    })();
  }

  gebouwen() {
    var _this8 = this;

    return asyncToGenerator(function* () {
      const huisnummers = yield _this8.huisnummers();
      const gebouwen = [];
      for (const huisnummer of huisnummers) {
        gebouwen.push(...(yield huisnummer.gebouwen()).toArray());
      }
      return gebouwen;
    })();
  }

  terreinen() {
    var _this9 = this;

    return asyncToGenerator(function* () {
      const huisnummers = yield _this9.huisnummers();
      const terreinen = [];
      for (const huisnummer of huisnummers) {
        terreinen.push(...(yield huisnummer.terreinen()).toArray());
      }
      return terreinen;
    })();
  }
}

Straat.new = x => new Straat(x);

Straat.object = x => Object.assign(Straat.new(x), Straat.getMap(x));

Straat.map = x => ({
  id: +x[ID$4],
  naam: x[NAME$3],
  naam2deTaal: x[`${ NAME$3 }TweedeTaal`],
  taalCode: x.TaalCode,
  taalCode2deTaal: x.TaalCodeTweedeTaal,
  label: x[`${ NAME$3 }Label`]
});

Straat.getMap = x => ({ begin: begin(x) });

Straat.result = x => new Straten(x.map(Straat.new).map(toEntry));

Straat.getResult = x => x.map(Straat.object)[0];

const NAME$4 = 'Huisnummer';
const NAMES$5 = `${ NAME$4 }s`;
const ID$5 = `${ NAME$4 }Id`;

class Huisnummers extends CrabObjecten {}

class Huisnummer extends CrabObject {

  static byStraatnaam(straatnaam) {
    var _this = this;

    return asyncToGenerator(function* () {
      const operation = `List${ NAMES$5 }ByStraatnaamId`;
      const StraatnaamId = Straat.id(straatnaam);
      return _this.result((yield _this.crab(operation, { StraatnaamId, SorteerVeld })));
    })();
  }

  static get(huisnummer) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      const operation = `Get${ NAME$4 }By${ ID$5 }`;
      const HuisnummerId = Huisnummer.id(huisnummer);
      return _this2.getResult((yield _this2.crab(operation, { HuisnummerId })));
    })();
  }

  get() {
    var _this3 = this;

    return asyncToGenerator(function* () {
      return yield Huisnummer.get(_this3.id);
    })();
  }

  gebouwen() {
    var _this4 = this;

    return asyncToGenerator(function* () {
      return yield Gebouw.byHuisnummer(_this4.id);
    })();
  }

  terreinen() {
    var _this5 = this;

    return asyncToGenerator(function* () {
      return yield Terrein.byHuisnummer(_this5.id);
    })();
  }
}

Huisnummer.new = x => new Huisnummer(x);

Huisnummer.object = x => Object.assign(Huisnummer.new(x), Huisnummer.getMap(x));

Huisnummer.map = x => ({
  id: +x[ID$5],
  huisnummer: x[NAME$4]
});

Huisnummer.getMap = x => ({
  straat: +x.StraatnaamId,
  begin: begin(x)
});

Huisnummer.result = x => new Huisnummers(x.map(Huisnummer.new).map(toEntry));

Huisnummer.getResult = x => x.map(Huisnummer.object)[0];

class BBOX {

  constructor(points) {
    this.min = new Point([Infinity, Infinity]);
    this.max = new Point([-Infinity, -Infinity]);

    if (points) {
      const x = points.map(point => point.x);
      const y = points.map(point => point.y);
      this.min = new Point([Math.min(...x), Math.min(...y)]);
      this.max = new Point([Math.max(...x), Math.max(...y)]);
    }
  }

  add(points = []) {
    if (points.length > 0) {
      const x = points.map(point => point.x);
      const y = points.map(point => point.y);
      this.min = new Point([Math.min(this.min.x, ...x), Math.min(this.min.y, ...y)]);
      this.max = new Point([Math.max(this.max.x, ...x), Math.max(this.max.y, ...y)]);
    }
  }

  grow(amount = 1) {
    this.min.move(-amount, -amount);
    this.max.move(amount, amount);
  }

  get width() {
    return this.max.x - this.min.x;
  }

  get height() {
    return this.max.y - this.min.y;
  }

  get viewBox() {
    const { min, width, height } = this;
    return [min.x, min.y, width, height];
  }

  csv() {
    const { min, max } = this;
    return [min.x, min.y, max.x, max.y].join(',');
  }

  get center() {
    const { min, max } = this;
    return new Point((min.x + max.x) / 2, (min.y + max.y) / 2);
  }
}

const strokeLineCap = 'stroke-linecap="round"';
const strokeDashArray = 'stroke-dasharray="5, 5"';

class SVGLine {
  constructor(points) {
    this.points = points;
  }

  toSVG(style = 'fill: none; stroke: purple; stroke-width: 1;') {
    const points = this.points.map(({ x, y }) => [x, y].join(',')).join(' ');
    return `<polyline ${ strokeLineCap } ${ strokeDashArray } points="${ points }" style="${ style }" />`;
  }
}

class SVGRect {
  constructor({ x, y, width, height }) {
    Object.assign(this, { x, y, width, height });
  }

  toSVG(style = 'stroke: red; fill: none;') {
    const { x, y, width, height } = this;
    return `<rect x="${ x }" y="${ y }" width="${ width }" height="${ height }" style="${ style }" />`;
  }
}

class SVGCircle {
  constructor(point) {
    this.point = point;
  }

  toSVG(style = 'fill: green;') {
    const { x, y } = this.point;
    return `<circle cx="${ x }" cy="${ y }" r="0.5" style="${ style }" />`;
  }
}

class SVGPolygon {
  constructor(points) {
    this.points = points;
  }

  toSVG(style = 'fill: lime; stroke: purple; stroke-width: 0.5;') {
    const points = this.points.map(({ x, y }) => [x, y].join(',')).join(' ');
    return `<polygon points="${ points }" style="${ style }" />`;
  }
}

const toSVG = x => `<svg width="${ x.width }" height="${ x.height }" viewBox="${ x.viewBox.join(' ') }">
  ${ x.children.map(c => c.toSVG()).join('\n') }
</svg>`;

class SVG {
  constructor({ width = '100%', height = '100%', viewBox, bbox = new BBOX() } = {}, ...children) {
    this.add = x => this.children.push(x);

    this.toSVG = () => toSVG(this);

    Object.assign(this, { width, height, viewBox, bbox, children });
  }

}

const RE = /POLYGON \(\(|\)\)/g;

const coord = x => new Point(x.split(' ').map(parseFloat));

// const polygon = x => x.replace(RE, '').split(', ').map(coord);

class Polygon {}

Polygon.of = x => x.replace(RE, '').split(', ').map(coord);

class Gebouwen extends Map {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.toArray = () => [...this.values()], _temp;
  }

}

class Gebouw extends CrabObject {
  constructor(...args) {
    var _temp2;

    return _temp2 = super(...args), this.draw = svg /* , layers = {}*/ => {
      const { geometrie } = this;
      svg.bbox.add(geometrie);
      svg.add(new SVGPolygon(geometrie));
      /* if (layers) {
        geometrie.forEach(p => svg.add(new SVGCircle(p)));
        const heights = [];
        for (let layer in layers) {
          const height = [];
          let i = 0;
          geometrie.forEach(p => {
            const h = layers[layer][i++];
            //svg.add(new SVGText(p, h));
            height.push(h);
          });
          for (let x = 0; x < height.length; x++) {
            if (heights[x] == undefined) {
              heights[x] = height[x];
            } else {
              heights[x] += ' - ' + height[x];
            }
          }
          //heights.push(height);
        }
        let ii = 0;
        geometrie.forEach(p => {
          //const h = layers[layer][i++];
          svg.add(new SVGText(p, heights[ii++]));
          //height.push(h);
        });
        console.log(heights);
      }*/
    }, _temp2;
  }

  static byHuisnummer(huisnummer) {
    var _this = this;

    return asyncToGenerator(function* () {
      const operation = 'ListGebouwenByHuisnummerId';
      const HuisnummerId = Huisnummer.id(huisnummer);
      return _this.result((yield _this.crab(operation, { HuisnummerId, SorteerVeld })));
    })();
  }

  static get(gebouw) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      const operation = 'GetGebouwByIdentificatorGebouw';
      const IdentificatorGebouw = Gebouw.id(gebouw);
      return _this2.getResult((yield _this2.crab(operation, { IdentificatorGebouw })));
    })();
  }

  get() {
    var _this3 = this;

    return asyncToGenerator(function* () {
      return yield Gebouw.get(_this3);
    })();
  }

}

Gebouw.new = x => new Gebouw(x);

Gebouw.object = x => Object.assign(Gebouw.new(x), Gebouw.getMap(x));

Gebouw.map = x => ({
  id: +x.IdentificatorGebouw,
  aard: +x.AardGebouw,
  status: +x.StatusGebouw
});

Gebouw.getMap = x => ({
  geometriemethodeGebouw: +x.GeometriemethodeGebouw,
  geometrie: Polygon.of(x.Geometrie),
  begin: begin(x)
});

Gebouw.result = x => new Gebouwen(x.map(Gebouw.new).map(toEntry));

Gebouw.getResult = x => x.map(Gebouw.object)[0];

const NAME$5 = 'Terreinobject';
const NAMES$6 = `${ NAME$5 }en`;
const ID$6 = `Identificator${ NAME$5 }`;

class Terreinen extends CrabObjecten {}

class Terrein extends CrabObject {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.draw = svg => {
      const { min, max, center } = this;
      const points = [min, max, center];
      svg.bbox.add(points);
      // points.map(point => new SVGCircle(point)).forEach(circle => svg.add(circle));
      svg.add(new SVGRect({ x: min.x, y: min.y, width: max.x - min.x, height: max.y - min.y }));
      svg.add(new SVGCircle(center));
    }, _temp;
  }

  static byHuisnummer(huisnummer) {
    var _this = this;

    return asyncToGenerator(function* () {
      const operation = `List${ NAMES$6 }ByHuisnummerId`;
      const HuisnummerId = Huisnummer.id(huisnummer);
      return _this.result((yield _this.crab(operation, { HuisnummerId, SorteerVeld })));
    })();
  }

  static get(terrein) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      const operation = `Get${ NAME$5 }By${ ID$6 }`;
      const IdentificatorTerreinobject = Terrein.id(terrein);
      return _this2.getResult((yield _this2.crab(operation, { IdentificatorTerreinobject })));
    })();
  }

  get() {
    var _this3 = this;

    return asyncToGenerator(function* () {
      return yield Terrein.get(_this3);
    })();
  }

}

Terrein.new = x => new Terrein(x);

Terrein.object = x => Object.assign(Terrein.new(x), Terrein.getMap(x));

Terrein.map = x => ({
  id: x[ID$6],
  aard: +x[`Aard${ NAME$5 }`]
});

Terrein.getMap = x => ({
  center: new Point([x.CenterX, x.CenterY]),
  min: new Point([x.MinimumX, x.MinimumY]),
  max: new Point([x.MaximumX, x.MaximumY]),
  begin: begin(x)
});

Terrein.result = x => new Terreinen(x.map(Terrein.new).map(toEntry));

Terrein.getResult = x => x.map(Terrein.object)[0];

class Wegobjecten extends Map {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.toArray = () => [...this.values()], _temp;
  }

}

class Wegobject extends CrabObject {
  constructor(...args) {
    var _temp2;

    return _temp2 = super(...args), this.draw = svg => {
      const { min, max, center } = this;
      const points = [min, max, center];
      svg.bbox.add(points);
      // points.map(point => new SVGCircle(point)).forEach(circle => svg.add(circle));
      svg.add(new SVGRect({ x: min.x, y: min.y, width: max.x - min.x, height: max.y - min.y }));
      svg.add(new SVGCircle(center));
    }, _temp2;
  }

  static byStraat(straat) {
    var _this = this;

    return asyncToGenerator(function* () {
      const operation = 'ListWegobjectenByStraatnaamId';
      const StraatnaamId = Straat.id(straat);
      return _this.result((yield _this.crab(operation, { StraatnaamId, SorteerVeld })));
    })();
  }

  static get(wegobject) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      const operation = 'GetWegobjectByIdentificatorWegobject';
      const IdentificatorWegobject = Wegobject.id(wegobject);
      return _this2.getResult((yield _this2.crab(operation, { IdentificatorWegobject })));
    })();
  }

  get() {
    var _this3 = this;

    return asyncToGenerator(function* () {
      return yield Wegobject.get(_this3);
    })();
  }

}

Wegobject.new = x => new Wegobject(x);

Wegobject.object = x => Object.assign(Wegobject.new(x), Wegobject.getMap(x));

Wegobject.map = x => ({
  id: +x.IdentificatorWegobject,
  aard: +x.AardWegobject
});

Wegobject.getMap = x => ({
  center: new Point([x.CenterX, x.CenterY]),
  min: new Point([x.MinimumX, x.MinimumY]),
  max: new Point([x.MaximumX, x.MaximumY]),
  begin: begin(x)
});

Wegobject.result = x => new Wegobjecten(x.map(Wegobject.new).map(toEntry));

Wegobject.getResult = x => x.map(Wegobject.object)[0];

const RE$1 = /LINESTRING \(|\)/g;

const coord$1 = x => new Point(x.split(' ').map(parseFloat));

// const lineString = x => x.replace(RE, '').split(', ').map(coord);

class LineString {}

LineString.of = x => x.replace(RE$1, '').split(', ').map(coord$1);

const NAME$6 = 'Wegsegment';
const NAMES$7 = `${ NAME$6 }en`;
const ID$7 = `Identificator${ NAME$6 }`;

class Wegsegmenten extends CrabObjecten {}

class Wegsegment extends CrabObject {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.draw = svg => {
      const { geometrie } = this;
      // console.log(this);
      // const { min, max, center } = this;
      // const points = [min, max, center];
      svg.bbox.add(geometrie);
      // points.map(point => new SVGCircle(point)).forEach(circle => svg.add(circle));
      // svg.add(new SVGRect({ x: min.x, y: min.y, width: max.x - min.x, height: max.y - min.y }));
      svg.add(new SVGLine(geometrie));
    }, _temp;
  }

  static byStraat(straat) {
    var _this = this;

    return asyncToGenerator(function* () {
      const operation = `List${ NAMES$7 }ByStraatnaamId`;
      const StraatnaamId = Straat.id(straat);
      return _this.result((yield _this.crab(operation, { StraatnaamId, SorteerVeld })));
    })();
  }

  static get(wegsegment) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      const operation = `Get${ NAME$6 }By${ ID$7 }`;
      const IdentificatorWegsegment = Wegsegment.id(wegsegment);
      return _this2.getResult((yield _this2.crab(operation, { IdentificatorWegsegment })));
    })();
  }

  get() {
    var _this3 = this;

    return asyncToGenerator(function* () {
      return yield Wegsegment.get(_this3);
    })();
  }

}

Wegsegment.new = x => new Wegsegment(x);

Wegsegment.object = x => Object.assign(Wegsegment.new(x), Wegsegment.getMap(x));

Wegsegment.map = x => ({
  id: +x[ID$7],
  status: +x[`Status${ NAME$6 }`]
});

Wegsegment.getMap = x => ({
  geometrie: LineString.of(x.Geometrie),
  /* center: new Point([x.CenterX, x.CenterY]),
  min: new Point([x.MinimumX, x.MinimumY]),
  max: new Point([x.MaximumX, x.MaximumY]),*/
  begin: begin(x)
});

Wegsegment.result = x => new Wegsegmenten(x.map(Wegsegment.new).map(toEntry));

Wegsegment.getResult = x => x.map(Wegsegment.object)[0];

const log = (...args) => console.log(...args) || [...args];

const STYLE = `<style>
  body { margin: 0px; }
  svg { transform-origin: 50% 50%; transform: scale(1,-1); }
</style>
`;

let getFeatureInfo = (() => {
  var _ref = asyncToGenerator(function* ({ bbox, width = 512, height = 512, i = 255, j = 255 }) {
    const REQUEST = 'GetFeatureInfo';
    const INFO_FORMAT = 'application/vnd.esri.wms_featureinfo_xml';
    const layer = 'DHMVII_DSM_1m';
    const layers = layer;
    const QUERY_LAYERS = layer;
    const FEATURE_COUNT = 10;
    const baseQuery = Object.assign({ REQUEST, layers, width, height, bbox }, base);
    const query = Object.assign({ INFO_FORMAT, QUERY_LAYERS, FEATURE_COUNT, i, j }, baseQuery);
    return yield request(`${ URL$1 }${ querystring$1(query) }`, { method: method$1, headers: headers$1 });
  });

  return function getFeatureInfo(_x) {
    return _ref.apply(this, arguments);
  };
})();

let getMap = (() => {
  var _ref2 = asyncToGenerator(function* (bbox) {
    const REQUEST = 'GetMap';
    const layers = 'DHMVII_DSM_5m';
    const width = 2000;
    const height = 2000;
    const query = Object.assign({ REQUEST, layers, width, height, bbox }, base);
    return yield request(`${ URL$1 }${ querystring$1(query) }`, { method: method$1, headers: headers$1, encoding: 'binary' });
  });

  return function getMap(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

let get3DMap = (() => {
  var _ref3 = asyncToGenerator(function* ({ bbox, width = 2048, height = 2048 }) {
    const REQUEST = 'GetMap';
    const layers = 'GRBGEBL1D2';
    const query = Object.assign({ REQUEST, layers, width, height, bbox }, base);
    return yield request(`${ URL3D }${ querystring$1(query) }`, { method: method$1, headers: headers$1, encoding: 'binary' });
  });

  return function get3DMap(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

const BASE_URL = 'http://geoservices.informatievlaanderen.be/raadpleegdiensten/';
const URL$1 = `${ BASE_URL }DHMV/wms?`;
const URL3D = `${ BASE_URL }3DGRB/wms?`;

const method$1 = 'GET';
const headers$1 = { 'Content-Type': 'application/x-www-form-urlencoded' };

const service = 'WMS';
const crs = 'EPSG:31370';
const format = 'image/png';
const transparent = 'TRUE';
const styles = 'default';
const version = '1.3.0';

const base = { service, crs, format, transparent, styles, version };

const querystring$1 = query => Object.entries(query).map(x => x.join('=')).join('&');

class WMS {}
WMS.getFeatureInfo = memoize(getFeatureInfo);
WMS.getMap = memoize(getMap);
WMS.get3DMap = memoize(get3DMap);

const Options$1 = { decodeEntities: true, xmlMode: true };

const values$1 = {};

let fieldName = null;
let field = { name: '', value: '' };

const ontext$1 = text => {
  switch (fieldName) {
    case 'FieldName':
      field.name += text;
      break;
    case 'FieldValue':
      field.value += text;
      break;
    default:
      break;
  }
};

const onopentag = name => {
  switch (name) {
    case 'FieldName':
    case 'FieldValue':
      fieldName = name;
      break;
    default:
      break;
  }
};

const onclosetag$1 = name => {
  switch (name) {
    case 'FieldValue':
      values$1[field.name.replace(/ /g, '')] = +field.value;
      field = { name: '', value: '' };
      fieldName = null;
      break;
    case 'FieldName':
      fieldName = null;
      break;
    default:
      break;
  }
};

const parse$1 = features => {
  const parser = new htmlparser2.Parser({ ontext: ontext$1, onopentag, onclosetag: onclosetag$1 }, Options$1);
  parser.parseComplete(features);
  return values$1;
};

let drawGebouwen = (() => {
  var _ref = asyncToGenerator(function* () {
    const svg = new SVG();
    /* const straat = await Straat.get(7338);
    const gebouwen = await straat.gebouwen();
    for (const gebouw of gebouwen) {
      (await gebouw.get()).draw(svg);
    }*/
    // for (const gebouw of await getGebouwen(2384)) gebouw.draw(svg);
    (yield Gebouw.get(1874906)).draw(svg);
    /* for (let terreinobject of await straat.terreinobjecten()) {
      (await terreinobject.get()).draw(svg);
    }*/
    /* for (let wegobject of await straat.wegobjecten()) {
      (await wegobject.get()).draw(svg);
    }
    for (let wegsegment of await straat.wegsegmenten()) {
      (await wegsegment.get()).draw(svg);
    }*/
    svg.bbox.grow();
    svg.viewBox = svg.bbox.viewBox;
    const html = STYLE + svg.toSVG();
    /* fs.writeFile('svg.html', html, err => {
      if (err) log(err);
      log('SVG saved');
      console.log(html);
    });*/
    http.createServer(function (req, res) {
      res.write(html);
      res.end();
    }).listen(3000);
  });

  return function drawGebouwen() {
    return _ref.apply(this, arguments);
  };
})();

let getGebouwen = (() => {
  var _ref2 = asyncToGenerator(function* (straatId) {
    const gebouwen = [];
    const straat = yield Straat.get(straatId);
    const list = yield straat.gebouwen();
    for (const item of list) {
      gebouwen.push((yield item.get()));
    }
    return gebouwen;
  });

  return function getGebouwen(_x) {
    return _ref2.apply(this, arguments);
  };
})();

let getHoogte = (() => {
  var _ref3 = asyncToGenerator(function* () {
    const markt19 = yield Gebouw.get((yield Gebouw.byHuisnummer(1373962)).toArray()[0]);
    const { geometrie } = markt19;
    const bbox = new BBOX(geometrie).csv();
    // const center = new BBOX(geometrie).center;
    const h = yield WMS.getFeatureInfo({ bbox, width: 512, height: 512, i: 255, j: 255 });
    console.log(h);
    const value = parse$1(h).PixelValue;
    log(value);
    const png = yield WMS.get3DMap({ bbox, width: 512, height: 512 });
    fs.writeFile('hoogte.png', png, 'binary', function (err) {
      if (err) log(err);
      log('PNG saved');
    });
  });

  return function getHoogte() {
    return _ref3.apply(this, arguments);
  };
})();

let run = (() => {
  var _ref4 = asyncToGenerator(function* () {
    /* log(await Organisatie.list());
    log(await Bewerking.list());
    log(await Huisnummer.byStraatnaam(7338));
    log(await Huisnummer.get(1373962));*/
    // await getHoogte();
    /* const heights = [];
    // log(geometrie);
    const layers = {};
    for (let layer of ['DHMVII_DTM_1m', 'DHMVII_DSM_1m']) {
      layers[layer] = [];
      for (let point of geometrie) {
        const bbox = new BBOX([point]);
        bbox.grow(0.1);
        const features = await WMS.getFeatureInfo(bbox.csv(), layer);
        const value = parse(features).PixelValue;
        log(value);
        layers[layer].push(value);
      }
    }
    log(layers);*/
    yield drawGebouwen();
  });

  return function run() {
    return _ref4.apply(this, arguments);
  };
})();

run().catch(log);