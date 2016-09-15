import CrabObject, { CrabObjecten, toEntry } from './CrabObject';
import { SorteerVeld } from './constants';

const NAME = 'Organisatie';
const NAMES = `${NAME}s`;
const ID = 'Code';

class Organisaties extends CrabObjecten {}

export default class Organisatie extends CrabObject {
  static new = x => new Organisatie(x);

  static map = x => ({
    id: +x[ID],
    naam: x.Naam,
    definitie: x.Definitie,
  });

  static async list() {
    const x = await this.crab(`List${NAMES}`, { SorteerVeld });
    return new Organisaties(x.map(Organisatie.new).map(toEntry));
  }
}
