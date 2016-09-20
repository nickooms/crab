import CrabObject, { CrabObjecten, toEntry } from './CrabObject';
import { SorteerVeld } from './constants';

const NAME = 'Taal';
const NAMES = 'Talen';
const ID = 'Code';

class Talen extends CrabObjecten {}

export default class Taal extends CrabObject {
  static new = x => new Taal(x);

  static map = x => ({
    id: x[ID],
    naam: x.Naam,
    definitie: x.Definitie,
  });

  static async list() {
    const x = await this.crab(`List${NAMES}`, { SorteerVeld });
    return new Talen(x.map(Taal.new).map(toEntry));
  }

  static async get(taal) {
    const id = this.id(taal);
    const x = await this.crab(`List${NAMES}`, { SorteerVeld });
    return new Talen(x.map(Taal.new).map(toEntry)).get(id);
  }
}

Object.assign(Taal, { ID, NAME, NAMES });
