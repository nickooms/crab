import { Taal } from '../CRAB';
import { Count, Nederlands as taal } from './constants';
import { isList, testObject, expect } from './util';

const { id, naam } = taal;
const obj = x => {
  expect(x.id).to.equal(id);
  expect(x.naam).to.equal(naam);
};
const list = x => obj(isList(x, Count.talen)[2]);
const OK = `returns Taal [${naam}]`;

testObject(Taal, {
  get: [obj, OK, [{ Taal: taal }, { id }]],
  list: [list, OK, [{}]],
});
