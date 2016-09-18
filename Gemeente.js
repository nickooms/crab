import CrabObject, { CrabObjecten, toEntry, groupBy } from './CrabObject';
import { Gewest } from './CRAB';
import { SorteerVeld } from './constants';
import Point from './Point';

const NAME = 'Gemeente';
const NAMES = `${NAME}n`;
const ID = `${NAME}Id`;

const Groups = ['GemeenteId', 'TaalCode', 'TaalCodeTweedeTaal', 'NISGemeenteCode'];

// const taal = (x, taalId) => ({ id: x.id, naam: x.talen.get(taalId).naam, nisId: x.nisId });

class Gemeenten extends CrabObjecten {
  /* taal(taalId) {
    return this.toArray().map(x => ({ id: x.id, naam: x.talen.get(taalId).naam, nisId: x.nisId }));
  }*/
}

/* class GemeenteTaal extends CrabObject {
  static new = x => new GemeenteTaal(x);

  static map = x => ({
    id: x.TaalCodeGemeenteNaam,
    naam: x.GemeenteNaam,
  })
}*/

export default class Gemeente extends CrabObject {
  static new = x => new Gemeente(x);

  static map = x => ({
    id: +x[ID],
    naam: x[`${NAME}Naam`],
    // talen: toMap(x.talen.map(GemeenteTaal.new)),
    taal: x.TaalCode,
    taal2: x.TaalCodeTweedeTaal,
    nisId: +x[`NIS${NAME}Code`],
    gewest: +x.GewestId,
  });

  static object = x => Object.assign(Gemeente.new(x), Gemeente.getMap(x));

  static getMap = x => ({
    nisId: +x[`Nis${NAME}Code`],
    center: new Point(x.CenterX, x.CenterY),
    min: new Point(x.MinimumX, x.MinimumY),
    max: new Point(x.MaximumX, x.MaximumY),
  });

  /* static taal(x, taalId) {
    return taal(x, taalId);
  }*/

  static group = x => groupBy(x, Groups, 'talen');

  // static result = x => new Gemeenten(Gemeente.group(x).map(Gemeente.new).map(toEntry));
  static result = x => new Gemeenten(x.map(Gemeente.new).map(toEntry));

  static getResult = x => x.map(Gemeente.object)[0];

  static async get(gemeente) {
    const GemeenteId = this.id(gemeente);
    return this.getResult(await this.crab(`Get${NAME}By${ID}`, { GemeenteId }));
  }

  static async byPostkanton(PostkantonCode) {
    const x = await this.crab(`Find${NAMES}ByPostkanton`, { PostkantonCode, SorteerVeld });
    return this.getResult(x);
  }

  static async byNaam(GemeenteNaam, gewest) {
    const GewestId = Gewest.id(gewest);
    const x = await this.crab(`Find${NAMES}`, { GemeenteNaam, GewestId, SorteerVeld });
    return this.getResult(x);
  }

  static async byGewest(gewest) {
    const GewestId = Gewest.id(gewest);
    const x = await this.crab(`List${NAMES}ByGewestId`, { GewestId, SorteerVeld });
    return this.result(x);
  }
}
