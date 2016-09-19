import CrabObject, { CrabObjecten, toEntry, begin } from './CrabObject';
import { SorteerVeld } from './constants';
import { Huisnummer } from './CRAB';
import { SVGRect, SVGCircle } from './SVG';
import Point from './Point';

const NAME = 'Terreinobject';
const NAMES = `${NAME}en`;
const ID = `Identificator${NAME}`;

class Terreinen extends CrabObjecten {}

export default class Terrein extends CrabObject {
  static new = x => new Terrein(x);

  static object = x => Object.assign(Terrein.new(x), Terrein.getMap(x));

  static map = x => ({
    id: x[ID],
    aard: +x[`Aard${NAME}`],
  });

  static getMap = x => ({
    center: new Point([x.CenterX, x.CenterY]),
    min: new Point([x.MinimumX, x.MinimumY]),
    max: new Point([x.MaximumX, x.MaximumY]),
    begin: begin(x),
  });

  static result = x => new Terreinen(x.map(Terrein.new).map(toEntry));

  static getResult = x => x.map(Terrein.object)[0];

  static async byHuisnummer(huisnummer) {
    const operation = `List${NAMES}By${Huisnummer.ID}`;
    const HuisnummerId = Huisnummer.id(huisnummer);
    return this.result(await this.crab(operation, { HuisnummerId, SorteerVeld }));
  }

  static async get(terrein) {
    const operation = `Get${NAME}By${ID}`;
    const IdentificatorTerreinobject = Terrein.id(terrein);
    return this.getResult(await this.crab(operation, { IdentificatorTerreinobject }));
  }

  async get() {
    return await Terrein.get(this);
  }

  draw = svg => {
    const { min, max, center } = this;
    const points = [min, max, center];
    svg.bbox.add(points);
    svg.add(new SVGRect({ x: min.x, y: min.y, width: max.x - min.x, height: max.y - min.y }));
    svg.add(new SVGCircle(center));
  }
}

Object.assign(Terrein, { ID, NAME, NAMES });
