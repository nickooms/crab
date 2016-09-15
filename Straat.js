import CrabObject, { CrabObjecten, toEntry, begin } from './CrabObject';
import { SorteerVeld } from './constants';
import { Gemeente, Huisnummer, Wegobject, Wegsegment } from './CRAB';

const NAME = 'Straatnaam';
const NAMES = 'Straatnamen';
const ID = `${NAME}Id`;

class Straten extends CrabObjecten {}

export default class Straat extends CrabObject {
  static new = x => new Straat(x);

  static object = x => Object.assign(Straat.new(x), Straat.getMap(x));

  static map = x => ({
    id: +x[ID],
    naam: x[NAME],
    naam2deTaal: x[`${NAME}TweedeTaal`],
    taalCode: x.TaalCode,
    taalCode2deTaal: x.TaalCodeTweedeTaal,
    label: x[`${NAME}Label`],
  });

  static getMap = x => ({ begin: begin(x) });

  static result = x => new Straten(x.map(Straat.new).map(toEntry));

  static getResult = x => x.map(Straat.object)[0];

  static async byGemeente(gemeente) {
    const GemeenteId = Gemeente.id(gemeente);
    return this.result(await this.crab(`List${NAMES}ByGemeenteId`, { GemeenteId, SorteerVeld }));
  }

  static async byNaam(Straatnaam, gemeente) {
    const GemeenteId = Gemeente.id(gemeente);
    return this.result(await this.crab(`Find${NAMES}`, { Straatnaam, GemeenteId, SorteerVeld }));
  }

  static async get(straat) {
    const StraatnaamId = this.id(straat);
    return this.getResult(await this.crab(`Get${NAME}By${ID}`, { StraatnaamId }));
  }

  static async getByNaam(Straatnaam, gemeente) {
    const GemeenteId = Gemeente.id(gemeente);
    return this.getResult(await this.crab(`Get${NAME}By${NAME}`, { Straatnaam, GemeenteId }));
  }

  async huisnummers() {
    return (await Huisnummer.byStraatnaam(this.id)).toArray();
  }

  async wegobjecten() {
    return (await Wegobject.byStraat(this.id)).toArray();
  }

  async wegsegmenten() {
    return (await Wegsegment.byStraat(this.id)).toArray();
  }

  async gebouwen() {
    const huisnummers = await this.huisnummers();
    const gebouwen = [];
    for (const huisnummer of huisnummers) {
      gebouwen.push(...(await huisnummer.gebouwen()).toArray());
    }
    return gebouwen;
  }

  async terreinen() {
    const huisnummers = await this.huisnummers();
    const terreinen = [];
    for (const huisnummer of huisnummers) {
      terreinen.push(...(await huisnummer.terreinen()).toArray());
    }
    return terreinen;
  }
}
