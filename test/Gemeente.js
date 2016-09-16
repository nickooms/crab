import { CrabObjecten } from '../CrabObject';
import { Gemeente } from '../CRAB';
import { VlaamsGewest as Gewest, Stabroek as gemeente, PostCode2940 } from './constants';
import { testObject, expect } from './util';

const { id, naam } = gemeente;
const obj = x => {
  expect(x.id).to.equal(id);
  expect(x.naam).to.equal(naam);
};
const list = x => expect(x).to.be.an.instanceof(CrabObjecten);
const OK = `returns Gemeente [${naam}]`;

testObject(Gemeente, {
  get: [obj, OK, [{ Gemeente: gemeente }, { id }]],
  byNaam: [obj, OK, [{ naam, Gewest }]],
  byGewest: [list, OK, [{ Gewest }, { gewestId: Gewest.id }]],
  byPostkanton: [obj, OK, [{ postCode: PostCode2940.id }]],
});
