import CrabObject, { toEntry, begin } from './CrabObject';
import { SorteerVeld } from './constants';
import { Straat } from './CRAB';
import { SVGRect, SVGCircle } from './SVG';
import Point from './Point';

class Wegobjecten extends Map {
  toArray = () => [...this.values()];
}

export default class Wegobject extends CrabObject {
  static new = x => new Wegobject(x);

  static object = x => Object.assign(Wegobject.new(x), Wegobject.getMap(x));

  static map = x => ({
    id: +x.IdentificatorWegobject,
    aard: +x.AardWegobject,
  });

  static getMap = x => ({
    center: new Point([x.CenterX, x.CenterY]),
    min: new Point([x.MinimumX, x.MinimumY]),
    max: new Point([x.MaximumX, x.MaximumY]),
    begin: begin(x),
  });

  static result = x => new Wegobjecten(x.map(Wegobject.new).map(toEntry));

  static getResult = x => x.map(Wegobject.object)[0];

  static async byStraat(straat) {
    const operation = 'ListWegobjectenByStraatnaamId';
    const StraatnaamId = Straat.id(straat);
    return this.result(await this.crab(operation, { StraatnaamId, SorteerVeld }));
  }

  static async get(wegobject) {
    const operation = 'GetWegobjectByIdentificatorWegobject';
    const IdentificatorWegobject = Wegobject.id(wegobject);
    return this.getResult(await this.crab(operation, { IdentificatorWegobject }));
  }

  async get() {
    return await Wegobject.get(this);
  }

  draw = svg => {
    const { min, max, center } = this;
    const points = [min, max, center];
    svg.bbox.add(points);
    // points.map(point => new SVGCircle(point)).forEach(circle => svg.add(circle));
    svg.add(new SVGRect({ x: min.x, y: min.y, width: max.x - min.x, height: max.y - min.y }));
    svg.add(new SVGCircle(center));
  }
}
