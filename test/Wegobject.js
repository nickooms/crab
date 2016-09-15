import { Wegobject } from '../CRAB';
import SVG, { SVGRect } from '../SVG';
import { Count, Markt as Straat, MarktWegobject as wegobject } from './constants';
import { isList, testObject, expect } from './util';

const get = async x => await Wegobject.get(x);
const { id, aard, naam } = wegobject;
const obj = x => {
  expect(x.id).to.equal(id);
  expect(x.aard).to.equal(aard);
};
const list = x => obj(isList(x, Count.wegobjecten)[0]);
const OK = `returns Wegobject [${naam}]`;

testObject(Wegobject, {
  get: [obj, OK, [{ Wegobject: wegobject }, { id }]],
  byStraat: [list, OK, [{ Straat }, { id: Straat.id }]],
});

describe('wegobject.', () => {
  describe('get()', () => it(`${OK} details`, async () => obj(await(await get(id)).get())));
  describe('draw(SVG)', () => it('draws SVGRect', async () => {
    const svg = new SVG();
    await(await get(id)).draw(svg);
    expect(svg.children[0]).to.be.instanceof(SVGRect);
  }));
});
