import CrabObject, { CrabObjecten, toEntry } from './CrabObject';
import { SorteerVeld } from './constants';

const NAMES = 'Bewerkingen';
const ID = 'Code';

class Bewerkingen extends CrabObjecten {}

export default class Bewerking extends CrabObject {
  static new = x => new Bewerking(x);

  static map = x => ({
    id: +x[ID],
    naam: x.Naam,
    definitie: x.Definitie,
  });

  static async list() {
    const x = await this.crab(`List${NAMES}`, { SorteerVeld });
    return new Bewerkingen(x.map(Bewerking.new).map(toEntry));
  }
}
