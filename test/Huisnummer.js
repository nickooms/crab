import { expect } from 'chai';
import { Huisnummer } from '../CRAB';
import { Count, Markt19 as huisnummer, Markt as Straat } from './constants';
import { isList, testObject } from './util';

const get = async x => await Huisnummer.get(x);
const { id, naam, huisnummer: nummer } = huisnummer;
const obj = x => {
  expect(x.id).to.equal(id);
  expect(x.huisnummer).to.equal(nummer);
};
const list = x => obj(isList(x, Count.huisnummers)[11]);
const OK = `returns Huisnummer [${naam}]`;

testObject(Huisnummer, {
  get: [obj, OK, [{ Huisnummer: huisnummer }, { id }]],
  byStraat: [list, OK, [{ Straat }, { id: Straat.id }]],
});

describe('huisnummer.', () => {
  describe('get()', () => it(`${OK} details`, async () => obj(await (await get(id)).get())));
});
