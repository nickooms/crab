import mocha from 'mocha';
import { expect } from 'chai';
import { Straat } from '../CRAB';
import {
  Count, Markt,
  Stabroek as Gemeente,
  MarktWegobject as Wegobject,
  MarktWegsegment as Wegsegment,
} from './constants';
import { isArray, testObject } from './util';

const { huisnummers, wegobjecten, wegsegmenten, gebouwen, terreinen } = Count;
const get = async x => await Straat.get(x);
const { id: gemeenteId } = Gemeente;
const { id, naam } = Markt;
const obj = x => {
  expect(x.id).to.equal(id);
  expect(x.naam).to.equal(naam);
};
const hasSize = size => x => {
  expect(x.size).to.equal(size);
  return x;
};
const OK = `returns Straat [${naam}]`;
const retList = x => `returns ${Object.values(x)[0]} ${Object.keys(x)[0]}`;

mocha.timeout = 5000;

testObject(Straat, {
  get: [obj, OK, [{ Straat: Markt }, { id }]],
  byNaam: [hasSize(1), OK, [{ naam, Gemeente }, { naam, gemeenteId }]],
  byGemeente: [hasSize(154), OK, [{ Gemeente }, { id: gemeenteId }]],
  byWegobject: [hasSize(1), OK, [{ Wegobject }, { id: Wegobject.id }]],
  byWegsegment: [hasSize(1), OK, [{ Wegsegment }, { id: Wegsegment.id }]],
  getByNaam: [obj, OK, [{ naam, Gemeente }, { naam, gemeenteId }]],
});
describe('straat.', () => {
  let straat = null;
  mocha.before(async () => { straat = await get(id); });
  describe('huisnummers()', () => {
    it(retList({ huisnummers }), async () => isArray(await straat.huisnummers(), huisnummers));
  });
  describe('wegobjecten()', () => {
    it(retList({ wegobjecten }), async () => isArray(await straat.wegobjecten(), wegobjecten));
  });
  describe('wegsegmenten()', () => {
    it(retList({ wegsegmenten }), async () => isArray(await straat.wegsegmenten(), wegsegmenten));
  });
  describe('gebouwen()', () => {
    it(retList({ gebouwen }), async () => isArray(await straat.gebouwen(), gebouwen));
  });
  describe('terreinen()', () => {
    it(retList({ terreinen }), async () => isArray(await straat.terreinen(), terreinen));
  });
});
