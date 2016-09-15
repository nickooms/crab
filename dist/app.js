'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var initMemoize = _interopDefault(require('persistent-memoize'));
var initBlobStore = _interopDefault(require('fs-blob-store'));
var querystring = _interopDefault(require('querystring'));
var request = _interopDefault(require('request-promise'));
var htmlparser2 = require('htmlparser2');
var express = _interopDefault(require('express'));

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
    row[cols[index++]] = text === 'NULL' ? null : text;
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

const URL = 'http://crab.agiv.be/Examples/Home/ExecOperation';
const method = 'POST';
const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

const parameterMapping = ([Name, Value]) => ({ Name, Value });

const encodeParameters = x => Object.entries(x).map(parameterMapping);

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

class Talen extends CrabObjecten {}

class Taal extends CrabObject {

  static list() {
    var _this = this;

    return asyncToGenerator(function* () {
      const x = yield _this.crab('ListTalen', { SorteerVeld });
      return new Talen(x.map(Taal.new).map(toEntry));
    })();
  }

  static get(taal) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      const id = _this2.id(taal);
      const x = yield _this2.crab('ListTalen', { SorteerVeld });
      return new Talen(x.map(Taal.new).map(toEntry)).get(id);
    })();
  }
}

Taal.new = x => new Taal(x);

Taal.map = x => ({
  id: x.Code,
  naam: x.Naam,
  definitie: x.Definitie
});

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
      return (yield Wegobject.byStraatnaam(_this6.id)).toArray();
    })();
  }

  wegsegmenten() {
    var _this7 = this;

    return asyncToGenerator(function* () {
      return (yield Wegsegment.byStraatnaam(_this7.id)).toArray();
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

  terreinobjecten() {
    var _this9 = this;

    return asyncToGenerator(function* () {
      const huisnummers = yield _this9.huisnummers();
      const terreinobjecten = [];
      for (const huisnummer of huisnummers) {
        terreinobjecten.push(...(yield huisnummer.terreinobjecten()).toArray());
      }
      return terreinobjecten;
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

  terreinobjecten() {
    var _this5 = this;

    return asyncToGenerator(function* () {
      return yield Terreinobject.byHuisnummer(_this5.id);
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

class SVGPolygon {
  constructor(points) {
    this.points = points;
  }

  toSVG(style = 'fill: lime; stroke: purple; stroke-width: 0.5;') {
    const points = this.points.map(({ x, y }) => [x, y].join(',')).join(' ');
    return `<polygon points="${ points }" style="${ style }" />`;
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

class SVGCircle {
  constructor(point) {
    this.point = point;
  }

  toSVG(style = 'fill: green;') {
    const { x, y } = this.point;
    return `<circle cx="${ x }" cy="${ y }" r="0.5" style="${ style }" />`;
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

const NAME$5 = 'Terreinobject';
const NAMES$6 = `${ NAME$5 }en`;
const ID$6 = `Identificator${ NAME$5 }`;

class Terreinobjecten extends CrabObjecten {}

class Terreinobject extends CrabObject {
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

  static get(terreinobject) {
    var _this2 = this;

    return asyncToGenerator(function* () {
      const operation = `Get${ NAME$5 }By${ ID$6 }`;
      const IdentificatorTerreinobject = Terreinobject.id(terreinobject);
      return _this2.getResult((yield _this2.crab(operation, { IdentificatorTerreinobject })));
    })();
  }

  get() {
    var _this3 = this;

    return asyncToGenerator(function* () {
      return yield Terreinobject.get(_this3);
    })();
  }

}

Terreinobject.new = x => new Terreinobject(x);

Terreinobject.object = x => Object.assign(Terreinobject.new(x), Terreinobject.getMap(x));

Terreinobject.map = x => ({
  id: x[ID$6],
  aard: +x[`Aard${ NAME$5 }`]
});

Terreinobject.getMap = x => ({
  center: new Point([x.CenterX, x.CenterY]),
  min: new Point([x.MinimumX, x.MinimumY]),
  max: new Point([x.MaximumX, x.MaximumY]),
  begin: begin(x)
});

Terreinobject.result = x => new Terreinobjecten(x.map(Terreinobject.new).map(toEntry));

Terreinobject.getResult = x => x.map(Terreinobject.object)[0];

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

  static byStraatnaam(straatnaam) {
    var _this = this;

    return asyncToGenerator(function* () {
      const operation = 'ListWegobjectenByStraatnaamId';
      const StraatnaamId = Straat.id(straatnaam);
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

const RE$1 = /LINESTRING \(|\)/g;

const coord$1 = x => new Point(x.split(' ').map(parseFloat));

// const lineString = x => x.replace(RE, '').split(', ').map(coord);

class LineString {}

LineString.of = x => x.replace(RE$1, '').split(', ').map(coord$1);

// import SVGCircle from './SVGCircle';
// import Point from './Point';

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

  static byStraatnaam(straatnaam) {
    var _this = this;

    return asyncToGenerator(function* () {
      const operation = `List${ NAMES$7 }ByStraatnaamId`;
      const StraatnaamId = Straat.id(straatnaam);
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

let listTalen = (() => {
  var _ref = asyncToGenerator(function* (req, res) {
    const talen = [...(yield Taal.list()).values()];
    res.send(html([head(title('Talen')), body([a('/', 'CRAB'), h1('Talen'), table(['id', 'naam', 'definitie'], talen, 'Talen')])]));
  });

  return function listTalen(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let showTaal = (() => {
  var _ref2 = asyncToGenerator(function* (req, res) {
    const { taal } = ids(req);
    const object = yield Taal.get(taal);
    const path = getPath({ taal });
    res.send(html([head(title('Taal')), body([a(`${ path }/..`, 'Talen'), h1('Taal'), form(['id', 'naam', 'definitie'], object, path), a(`${ path }/Gewesten`, 'Gewesten')])]));
  });

  return function showTaal(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

let listGewesten = (() => {
  var _ref3 = asyncToGenerator(function* (req, res) {
    const { taal } = ids(req);
    const gewesten = [...(yield Gewest.list()).values()].map(gewestTaal(taal));
    const path = getPath({ taal });
    res.send(html([head(title('Gewesten')), body([a(`${ path }/..`, 'Taal'), h1('Gewesten'), table(['id', 'naam'], gewesten, `${ path }/Gewesten`)])]));
  });

  return function listGewesten(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
})();

let showGewest = (() => {
  var _ref4 = asyncToGenerator(function* (req, res) {
    const { taal, gewest } = ids(req);
    const object = (yield Gewest.get(gewest)).taal(taal);
    const path = getPath({ taal, gewest });
    res.send(html([head(title('Gewest')), body([a(`${ path }/..`, 'Gewesten'), h1('Gewest'), form(['id', 'naam'], object, path), a(`${ path }/Gemeenten`, 'Gemeenten')])]));
  });

  return function showGewest(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
})();

let listGemeenten = (() => {
  var _ref5 = asyncToGenerator(function* (req, res) {
    const { taal, gewest } = ids(req);
    const gemeenten = (yield Gemeente.byGewest(gewest)).taal(taal);
    const path = `${ getPath({ taal, gewest }) }/Gemeenten`;
    res.send(html([head(title('Gemeenten')), body([a(`${ path }/..`, 'Gewest'), h1('Gemeenten'), table(['id', 'naam', 'nisId'], gemeenten, path)])]));
  });

  return function listGemeenten(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
})();

let jsonGemeenten = (() => {
  var _ref6 = asyncToGenerator(function* (req, res) {
    const { taal, gewest } = ids(req);
    const gemeenten = (yield Gemeente.byGewest(gewest)).taal(taal);
    res.send(JSON.stringify(gemeenten));
  });

  return function jsonGemeenten(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
})();

let showGemeente = (() => {
  var _ref7 = asyncToGenerator(function* (req, res) {
    const { taal, gewest, gemeente } = ids(req);
    const x = (yield Gemeente.byGewest(gewest)).get(gemeente);
    const object = Gemeente.taal(x, taal);
    const path = getPath({ taal, gewest, gemeente });
    res.send(html([head(title('Gemeente')), body([a(`${ path }/..`, 'Gemeenten'), h1('Gemeente'), form(['id', 'naam', 'nisId'], object, path), a(`${ path }/Straten`, 'Straten')])]));
  });

  return function showGemeente(_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
})();

let listStraten = (() => {
  var _ref8 = asyncToGenerator(function* (req, res) {
    const { taal, gewest, gemeente } = ids(req);
    const straten = (yield Straat.byGemeente(gemeente)).toArray();
    const path = `${ getPath({ taal, gewest, gemeente }) }/Straten`;
    res.send(html([head(title('Straten')), body([a(`${ path }/..`, 'Gemeente'), h1('Straten'), table(['id', 'naam', 'taalCode2deTaal'], straten, path)])]));
  });

  return function listStraten(_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
})();

let jsonStraten = (() => {
  var _ref9 = asyncToGenerator(function* (req, res) {
    const id = ids(req);
    const straten = (yield Straat.byGemeente(id.gemeente)).toArray();
    res.send(JSON.stringify(straten));
  });

  return function jsonStraten(_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
})();

let showStraat = (() => {
  var _ref10 = asyncToGenerator(function* (req, res) {
    const { taal, gewest, gemeente, straat } = ids(req);
    const object = (yield Straat.byGemeente(gemeente)).get(straat);
    const path = getPath({ taal, gewest, gemeente, straat });
    res.send(html([head(title('Straat')), body([a(`${ path }/..`, 'Straten'), h1('Straat'), form(['id', 'naam'], object, path), a(`${ path }/Huisnummers`, 'Huisnummers'), a(`${ path }/Wegobjecten`, 'Wegobjecten'), a(`${ path }/Wegsegmenten`, 'Wegsegmenten')])]));
  });

  return function showStraat(_x19, _x20) {
    return _ref10.apply(this, arguments);
  };
})();

let listHuisnummers = (() => {
  var _ref11 = asyncToGenerator(function* (req, res) {
    const { taal, gewest, gemeente, straat } = ids(req);
    const huisnummers = (yield Huisnummer.byStraatnaam(straat)).toArray();
    const path = `${ getPath({ taal, gewest, gemeente, straat }) }/Huisnummers`;
    res.send(html([head(title('Huisnummers')), body([a(`${ path }/..`, 'Straat'), h1('Huisnummers'), table(['id', 'huisnummer'], huisnummers, path)])]));
  });

  return function listHuisnummers(_x21, _x22) {
    return _ref11.apply(this, arguments);
  };
})();

let showHuisnummer = (() => {
  var _ref12 = asyncToGenerator(function* (req, res) {
    const { taal, gewest, gemeente, straat, huisnummer } = ids(req);
    const object = (yield Huisnummer.byStraatnaam(straat)).get(huisnummer);
    const path = getPath({ taal, gewest, gemeente, straat, huisnummer });
    res.send(html([head(title('Huisnummer')), body([a(`${ path }/..`, 'Huisnummers'), h1('Huisnummer'), form(['id', 'huisnummer'], object, path), a(`${ path }/Gebouwen`, 'Gebouwen')])]));
  });

  return function showHuisnummer(_x23, _x24) {
    return _ref12.apply(this, arguments);
  };
})();

const PORT = 5000;

const app = express();

const plural = ['Talen', 'Gewesten', 'Gemeenten', 'Straten', 'Huisnummers', 'Gebouwen'];
const Ids = ['taal', 'gewest', 'gemeente', 'straat', 'huisnummer', 'gebouw'];

const slash = x => `/${ x }`;

const formPath = x => `${ x }/:${ Ids[plural.indexOf(x)] }Id`;

const getForm = (...x) => slash(x.map(formPath).join('/'));

const makePath = ([key, value]) => `${ plural[Ids.indexOf(key)] }/${ value }`;

const getPath = x => slash(Object.entries(x).map(makePath).join('/'));

const tag = name => x => `<${ name }>${ x instanceof Array ? x.join('') : x }</${ name }>`;

const ids = req => Object.entries(req.params).map(([name, value]) => ({
  [name.replace('Id', '')]: `${ parseInt(value, 10) }` === `${ value }` ? parseInt(value, 10) : value
})).reduce((obj, x) => {
  Object.assign(obj, x);
  return obj;
}, {});

const html = tag('html');
const head = tag('head');
const title = tag('title');
const body = tag('body');
const h1 = tag('h1');
const ul = tag('ul');
const th = tag('th');

const li = (list, fn) => list.map(x => `<li>${ fn(x) }</li>`).join('');

const a = (href, x) => `<a href="${ href }">${ x }</a>`;

const table = (cols, rows, path) => `<table>
  <tr>${ cols.map(th).join('') }</tr>
  ${ rows.map(row => `<tr>
    ${ cols.map(col => `<td>${ a(`${ path }/${ row.id }`, row[col]) }</td>`).join('') }
  </tr>`).join('') }
</table>`;

const form = (rows, object) => `<table>
  ${ rows.map(row => `<tr>
    <th align="right">${ row } :</th>
    <td>${ object[row] }</td>
  </tr>`).join('') }
</table>`;

const gewestTaal = taalId => x => ({ id: x.id, naam: x.talen.get(taalId).naam });

app.get('/', (req, res) => res.send(ul(li(plural, x => `<a href="${ x }">${ x }</a>`))));
app.get('/Talen', (req, res) => listTalen(req, res).catch(log));
app.get(getForm('Talen'), (req, res) => showTaal(req, res).catch(log));
app.get('/Talen/:taalId/Gewesten', (req, res) => listGewesten(req, res).catch(log));
app.get(getForm('Talen', 'Gewesten'), (req, res) => showGewest(req, res).catch(log));
app.get('/Talen/:taalId/Gewesten/:gewestId/Gemeenten', (req, res) => listGemeenten(req, res).catch(log));
app.get('/api/Talen/:taalId/Gewesten/:gewestId/Gemeenten', (req, res) => jsonGemeenten(req, res).catch(log));
app.get(getForm('Talen', 'Gewesten', 'Gemeenten'), (req, res) => showGemeente(req, res).catch(log));
app.get('/Talen/:taalId/Gewesten/:gewestId/Gemeenten/:gemeenteId/Straten', (req, res) => listStraten(req, res).catch(log));
app.get('/api/Talen/:taalId/Gewesten/:gewestId/Gemeenten/:gemeenteId/Straten', (req, res) => jsonStraten(req, res).catch(log));
app.get(getForm('Talen', 'Gewesten', 'Gemeenten', 'Straten'), (req, res) => showStraat(req, res).catch(log));
app.get('/Talen/:taalId/Gewesten/:gewestId/Gemeenten/:gemeenteId/Straten/:straatId/Huisnummers', (req, res) => listHuisnummers(req, res).catch(log));
app.get(getForm('Talen', 'Gewesten', 'Gemeenten', 'Straten', 'Huisnummers'), (req, res) => showHuisnummer(req, res).catch(log));

app.listen(PORT, () => log(`CRAB app listening on port ${ PORT }!`));