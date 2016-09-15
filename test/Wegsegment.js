import { Wegsegment } from '../CRAB';
import SVG, { SVGLine } from '../SVG';
import { Count, Markt as Straat, MarktWegsegment as wegsegment } from './constants';
import { isList, testObject, expect } from './util';

const get = async x => await Wegsegment.get(x);
const { id, status, naam } = wegsegment;
const obj = x => {
  expect(x.id).to.equal(id);
  expect(x.status).to.equal(status);
};
const list = x => obj(isList(x, Count.wegsegmenten)[0]);
const OK = `returns Wegsegment [${naam}]`;

testObject(Wegsegment, {
  get: [obj, OK, [{ Wegsegment: wegsegment }, { id }]],
  byStraat: [list, OK, [{ Straat }, { id: Straat.id }]],
});

describe('wegsegment.', () => {
  describe('get()', () => it(`${OK} details`, async () => obj(await(await get(id)).get())));
  describe('draw(SVG)', () => it('draws SVGLine', async () => {
    const svg = new SVG();
    await(await get(id)).draw(svg);
    expect(svg.children[0]).to.be.instanceof(SVGLine);
  }));
});
