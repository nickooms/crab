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
    begin: begin(x),
  });

  static result = x => new Wegsegmenten(x.map(Wegsegment.new).map(toEntry));

  static getResult = x => x.map(Wegsegment.object)[0];

  static async byStraat(straat) {
    const operation = `List${NAMES}By${Straat.ID}`;
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

  async straten() {
    return await Straat.byWegsegment(this);
  }

  draw = svg => {
    const { geometrie } = this;
    svg.bbox.add(geometrie);
    svg.add(new SVGLine(geometrie));
  }
}

Object.assign(Wegsegment, { ID, NAME, NAMES });
