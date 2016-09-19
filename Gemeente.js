import CrabObject, { CrabObjecten, toEntry } from './CrabObject';
import { Gewest } from './CRAB';
import { SorteerVeld } from './constants';
import Point from './Point';

const NAME = 'Gemeente';
const NAMES = `${NAME}n`;
const ID = `${NAME}Id`;

class Gemeenten extends CrabObjecten {}

export default class Gemeente extends CrabObject {
  static new = x => new Gemeente(x);

  static map = x => ({
    id: +x[ID],
    naam: x[`${NAME}Naam`],
    taal: x.TaalCode,
    taal2: x.TaalCodeTweedeTaal,
    nisId: +x[`NIS${NAME}Code`],
    gewest: +x[Gewest.ID],
  });

  static object = x => Object.assign(Gemeente.new(x), Gemeente.getMap(x));

  static getMap = x => ({
    nisId: +x[`Nis${NAME}Code`],
    center: new Point(x.CenterX, x.CenterY),
    min: new Point(x.MinimumX, x.MinimumY),
    max: new Point(x.MaximumX, x.MaximumY),
  });

  static result = x => new Gemeenten(x.map(Gemeente.new).map(toEntry));

  static getResult = x => x.map(Gemeente.object)[0];

  static async get(gemeente) {
    const operation = `Get${NAME}By${ID}`;
    const GemeenteId = this.id(gemeente);
    return this.getResult(await this.crab(operation, { GemeenteId }));
  }

  static async byPostkanton(PostkantonCode) {
    const operation = `Find${NAMES}ByPostkanton`;
    return this.getResult(await this.crab(operation, { PostkantonCode, SorteerVeld }));
  }

  static async byNaam(GemeenteNaam, gewest) {
    const operation = `Find${NAMES}`;
    const GewestId = Gewest.id(gewest);
    return this.getResult(await this.crab(operation, { GemeenteNaam, GewestId, SorteerVeld }));
  }

  static async byGewest(gewest) {
    const operation = `List${NAMES}By${Gewest.ID}`;
    const GewestId = Gewest.id(gewest);
    return this.result(await this.crab(operation, { GewestId, SorteerVeld }));
  }
}

Object.assign(Gemeente, { ID, NAME, NAMES });
