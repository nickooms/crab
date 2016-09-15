import { Gebouw } from '../CRAB';
import SVG, { SVGPolygon } from '../SVG';
import { Markt19 as huisnummer, Markt19Gebouw as gebouw } from './constants';
import { json, isList, testObject, expect } from './util';

const { id, naam, aard, status } = gebouw;
const obj = x => {
  expect(x.id).to.equal(id);
  expect(x.aard).to.equal(aard);
  expect(x.status).to.equal(status);
};
const list = x => obj(isList(x, 1)[0]);
const OK = `returns Huisnummer [${naam}]`;

testObject(Gebouw, {
  byHuisnummer: [list, OK, [{ Huisnummer: huisnummer }, { id: huisnummer.id }]],
});

describe('Gebouw', () => {
  /* describe('byHuisnummer()', () => {
    it(`finds ${naam} by ${json({ huisnummer.id })}`, async () => {
      list(await Gebouw.byHuisnummer(huisnummer.id));
    });
    it(`finds ${naam} by ${json({ huisnummer })}`, async () => {
      list(await Gebouw.byHuisnummer(huisnummer));
    });
  });*/
  describe('get()', () => {
    it(`finds ${naam} by ${json({ id })}`, async () => {
      obj(await Gebouw.get(id));
    });
    it(`finds ${naam} by ${json(gebouw)}`, async () => {
      obj(await Gebouw.get(gebouw));
    });
  });
  describe('#get()', () => {
    it(`finds ${naam}`, async () => {
      obj(await (await Gebouw.get(gebouw)).get());
    });
  });
  describe('#draw()', () => {
    it(`draws ${naam}`, async () => {
      const svg = new SVG();
      await (await Gebouw.get(gebouw)).draw(svg);
      expect(svg.children[0]).to.be.instanceof(SVGPolygon);
    });
  });
});
