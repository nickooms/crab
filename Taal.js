import CrabObject, { CrabObjecten, toEntry } from './CrabObject';
import { SorteerVeld } from './constants';

class Talen extends CrabObjecten {}

export default class Taal extends CrabObject {
  static new = x => new Taal(x);

  static map = x => ({
    id: x.Code,
    naam: x.Naam,
    definitie: x.Definitie,
  });

  static async list() {
    const x = await this.crab('ListTalen', { SorteerVeld });
    return new Talen(x.map(Taal.new).map(toEntry));
  }

  static async get(taal) {
    const id = this.id(taal);
    const x = await this.crab('ListTalen', { SorteerVeld });
    return new Talen(x.map(Taal.new).map(toEntry)).get(id);
  }
}
