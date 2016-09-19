import CrabObject, { CrabObjecten, toEntry, begin } from './CrabObject';
import { SorteerVeld } from './constants';
import { Huisnummer } from './CRAB';
import { SVGPolygon } from './SVG';
import Polygon from './Polygon';

const NAME = 'Gebouw';
const NAMES = `${NAME}en`;
const ID = `Identificator${NAME}`;

class Gebouwen extends CrabObjecten {}

export default class Gebouw extends CrabObject {
  static new = x => new Gebouw(x);

  static object = x => Object.assign(Gebouw.new(x), Gebouw.getMap(x));

  static map = x => ({
    id: +x[ID],
    aard: +x[`Aard${NAME}`],
    status: +x[`Status${NAME}`],
  });

  static getMap = x => ({
    geometriemethode: +x[`Geometriemethode${NAME}`],
    geometrie: Polygon.of(x.Geometrie),
    begin: begin(x),
  });

  static result = x => new Gebouwen(x.map(Gebouw.new).map(toEntry));

  static getResult = x => x.map(Gebouw.object)[0];

  static async get(gebouw) {
    const operation = `Get${NAME}By${ID}`;
    const IdentificatorGebouw = Gebouw.id(gebouw);
    return this.getResult(await this.crab(operation, { IdentificatorGebouw }));
  }

  static async byHuisnummer(huisnummer) {
    const operation = `List${NAMES}By${Huisnummer.ID}`;
    const HuisnummerId = Huisnummer.id(huisnummer);
    return this.result(await this.crab(operation, { HuisnummerId, SorteerVeld }));
  }

  async get() {
    return await Gebouw.get(this);
  }

  async huisnummers() {
    return await Huisnummer.byGebouw(this);
  }

  draw = svg => {
    const { geometrie } = this;
    svg.bbox.add(geometrie);
    svg.add(new SVGPolygon(geometrie));
  }
}

const get = async x => await Gebouw.get(x);

Object.assign(Gebouw, { ID, NAME, NAMES });

export { get };
