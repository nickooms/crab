import Gebouw, { get } from '../Gebouw';
import SVG, { SVGPolygon } from '../SVG';
import { Markt19 as Huisnummer, Markt19Gebouw as gebouw } from './constants';
import { isList, testObject, expect } from './util';

const { id, naam, aard, status } = gebouw;
const obj = x => {
  expect(x.id).to.equal(id);
  expect(x.aard).to.equal(aard);
  expect(x.status).to.equal(status);
};
const list = x => obj(isList(x, 1)[0]);
const OK = `returns Gebouw [${naam}]`;

testObject(Gebouw, {
  get: [obj, OK, [{ Gebouw: gebouw }, { id }]],
  byHuisnummer: [list, OK, [{ Huisnummer }, { id: Huisnummer.id }]],
});

describe('gebouw.', () => {
  describe('get()', () => it(`${OK} details`, async () => obj(await (await get(id)).get())));
  describe('draw(SVG)', () => it('draws SVGPolygon', async () => {
    const svg = new SVG();
    await (await get(id)).draw(svg);
    expect(svg.children[0]).to.be.instanceof(SVGPolygon);
  }));
});
