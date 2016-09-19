import { Gewest } from '../CRAB';
import { Count, VlaamsGewest as gewest } from './constants';
import { isList, testObject, expect } from './util';

const { id, naam } = gewest;
const obj = x => {
  expect(x.id).to.equal(id);
  expect(x.naam).to.equal(naam);
};
const list = x => obj(isList(x, Count.gewesten)[1]);
const OK = `returns Gewest [${naam}]`;

testObject(Gewest, {
  get: [obj, OK, [{ Gewest: gewest }, { id }]],
  list: [list, OK, [{}]],
});
