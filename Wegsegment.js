import CrabObject, { CrabObjecten, toEntry, begin } from './CrabObject';
import { SorteerVeld } from './constants';
import { Straat } from './CRAB';
import { SVGLine } from './SVG';
import LineString from './LineString';

const NAME = 'Wegsegment';
const NAMES = `${NAME}en`;
const ID = `Identificator${NAME}`;

class Wegsegmenten extends CrabObjecten {}

export default class Wegsegment extends CrabObject {
  static new = x => new Wegsegment(x);

  static object = x => Object.assign(Wegsegment.new(x), Wegsegment.getMap(x));

  static map = x => ({
    id: +x[ID],
    status: +x[`Status${NAME}`],
  });

  static getMap = x => ({
    geometrie: LineString.of(x.Geometrie),
    /* center: new Point([x.CenterX, x.CenterY]),
    min: new Point([x.MinimumX, x.MinimumY]),
    max: new Point([x.MaximumX, x.MaximumY]),*/
    begin: begin(x),
  });

  static result = x => new Wegsegmenten(x.map(Wegsegment.new).map(toEntry));

  static getResult = x => x.map(Wegsegment.object)[0];

  static async byStraat(straat) {
    const operation = `List${NAMES}ByStraatnaamId`;
    const StraatnaamId = Straat.id(straat);
    return this.result(await this.crab(operation, { StraatnaamId, SorteerVeld }));
  }

  static async get(wegsegment) {
    const operation = `Get${NAME}By${ID}`;
    const IdentificatorWegsegment = Wegsegment.id(wegsegment);
    return this.getResult(await this.crab(operation, { IdentificatorWegsegment }));
  }

  async get() {
    return await Wegsegment.get(this);
  }

  draw = svg => {
    const { geometrie } = this;
    // console.log(this);
    // const { min, max, center } = this;
    // const points = [min, max, center];
    svg.bbox.add(geometrie);
    // points.map(point => new SVGCircle(point)).forEach(circle => svg.add(circle));
    // svg.add(new SVGRect({ x: min.x, y: min.y, width: max.x - min.x, height: max.y - min.y }));
    svg.add(new SVGLine(geometrie));
  }
}
