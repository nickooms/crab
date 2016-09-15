import { expect } from 'chai';
import { Gemeente } from '../CRAB';
import { Count, VlaamsGewest as gewest, Stabroek, PostCode2940 } from './constants';
import { json, isList } from './util';

const { id: gewestId } = gewest;
const { id, naam } = Stabroek;

const isStabroek = x => {
  expect(x.id).to.equal(id);
  expect(x.naam).to.equal(naam);
};

describe('Gemeente', () => {
  describe('byGewest()', () => {
    it(`finds ${Count.gemeenten} gemeenten by ${json({ gewest })}`, async () => {
      isList(await Gemeente.byGewest(gewest), Count.gemeenten);
    });

    it(`finds ${Count.gemeenten} gemeenten by ${json({ gewestId })}`, async () => {
      isList(await Gemeente.byGewest(gewestId), Count.gemeenten);
    });
  });

  describe('get()', () => {
    it(`finds ${naam} by ${json({ id })}`, async () => {
      isStabroek(await Gemeente.get(id));
    });

    it(`finds ${naam} by ${json({ Stabroek })}`, async () => {
      isStabroek(await Gemeente.get(Stabroek));
    });
  });

  describe('byPostkanton()', () => {
    it(`finds ${naam} by ${json({ PostCode2940 })}`, async () => {
      isStabroek(await Gemeente.byPostkanton(2940));
    });
  });

  describe('byNaam()', () => {
    it(`finds ${naam} by ${json({ naam, gewest })}`, async () => {
      isStabroek(await Gemeente.byNaam(naam, gewest));
    });
  });
});
