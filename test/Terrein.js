import mocha from 'mocha';
import { Terrein } from '../CRAB';
import SVG, { SVGRect } from '../SVG';
import { Count, Markt19 as Huisnummer, Markt19Terrein as terrein } from './constants';
import { isList, testObject, expect } from './util';

const get = async x => await Terrein.get(x);
const { id, naam, aard } = terrein;
const obj = x => {
  expect(x.id).to.equal(id);
  expect(x.aard).to.equal(aard);
};
const list = (x, count = 1) => obj(isList(x, count)[0]);
const OK = `returns Terrein [${naam}]`;

mocha.timeout = 5000;

testObject(Terrein, {
  get: [obj, OK, [{ Terrein: terrein }, { id }]],
  byHuisnummer: [list, OK, [{ Huisnummer }, { id: Huisnummer.id }]],
});

describe('terrein.', () => {
  describe('get()', () => it(`${OK} details`, async () => obj(await(await get(id)).get())));
  describe('draw(SVG)', () => it('draws SVGRect', async () => {
    const svg = new SVG();
    await(await get(id)).draw(svg);
    expect(svg.children[0]).to.be.instanceof(SVGRect);
  }));
});
