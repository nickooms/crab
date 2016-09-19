import CrabObject, { CrabObjecten, toEntry, begin } from './CrabObject';
import { SorteerVeld } from './constants';
import { Straat, Gebouw, Terrein } from './CRAB';

const NAME = 'Huisnummer';
const NAMES = `${NAME}s`;
const ID = `${NAME}Id`;

class Huisnummers extends CrabObjecten {}

export default class Huisnummer extends CrabObject {
  static new = x => new Huisnummer(x);

  static object = x => Object.assign(Huisnummer.new(x), Huisnummer.getMap(x));

  static map = x => ({
    id: +x[ID],
    huisnummer: x[NAME],
  });

  static getMap = x => ({
    straat: +x[Straat.ID],
    begin: begin(x),
  });

  static result = x => new Huisnummers(x.map(Huisnummer.new).map(toEntry));

  static getResult = x => x.map(Huisnummer.object)[0];

  static async get(huisnummer) {
    const operation = `Get${NAME}By${ID}`;
    const HuisnummerId = Huisnummer.id(huisnummer);
    return this.getResult(await this.crab(operation, { HuisnummerId }));
  }

  static async byStraatnaam(straatnaam) {
    const operation = `List${NAMES}By${Straat.ID}`;
    const StraatnaamId = Straat.id(straatnaam);
    return this.result(await this.crab(operation, { StraatnaamId, SorteerVeld }));
  }

  static async byGebouw(gebouw) {
    const operation = `List${NAMES}WithStatusBy${Gebouw.ID}`;
    const IdentificatorGebouw = Gebouw.id(gebouw);
    return this.result(await this.crab(operation, { IdentificatorGebouw, SorteerVeld }));
  }

  async get() {
    return await Huisnummer.get(this.id);
  }

  async gebouwen() {
    return await Gebouw.byHuisnummer(this.id);
  }

  async terreinen() {
    return await Terrein.byHuisnummer(this.id);
  }
}

Object.assign(Huisnummer, { ID, NAME, NAMES });
