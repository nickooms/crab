import CrabObject, { CrabObjecten, toEntry, toMap, groupBy } from './CrabObject';
import { SorteerVeld } from './constants';

const NAME = 'Gewest';
const NAMES = `${NAME}en`;
const ID = `${NAME}Id`;

class Gewesten extends CrabObjecten {}

class GewestTaal extends CrabObject {
  static new = x => new GewestTaal(x);

  static map = x => ({
    id: x.TaalCodeGewestNaam,
    naam: x.GewestNaam,
  })
}

export default class Gewest extends CrabObject {
  static new = x => new Gewest(x);

  static map = x => ({
    id: +x[ID],
    talen: toMap(x.talen.map(taal => GewestTaal.new(taal))),
  });

  static group = x => groupBy(x, [ID], 'talen');

  /* taal(taalId) {
    return { id: this.id, naam: this.talen.get(taalId).naam };
  }*/

  get naam() {
    return this.talen.get('nl').naam;
  }

  static async list() {
    const x = await this.crab(`List${NAMES}`, { SorteerVeld });
    const grouped = Gewest.group(x);
    return new Gewesten(grouped.map(Gewest.new).map(toEntry));
  }

  static async get(gewest) {
    const id = this.id(gewest);
    const x = await this.crab(`List${NAMES}`, { SorteerVeld });
    const grouped = Gewest.group(x);
    const gewesten = new Gewesten(grouped.map(Gewest.new).map(toEntry));
    return gewesten.get(id);
  }
}
