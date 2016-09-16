import BBOX from '../BBOX';
import Point from '../Point';
import { Point11, Point22 } from './constants';
import { json, expect } from './util';

const point11 = new Point(Point11.x, Point11.y);
const point22 = new Point(Point22.x, Point22.y);

describe('BBOX', () => {
  describe('constructor()', () => {
    it(`creates a BBOX by ${json({ Point11, Point22 })}`, () => {
      const bbox = new BBOX([point11, point22]);
      expect(bbox.width).to.equal(1);
      expect(bbox.height).to.equal(1);
    });
  });

  describe('#add()', () => {
    it('works without point list', () => {
      const bbox = new BBOX([point11, point22]);
      bbox.add();
      expect(bbox.width).to.equal(1);
      expect(bbox.height).to.equal(1);
    });

    it('works with empty list', () => {
      const bbox = new BBOX([point11, point22]);
      bbox.add([]);
      expect(bbox.width).to.equal(1);
      expect(bbox.height).to.equal(1);
    });
  });

  describe('#grow()', () => {
    it('grows a BBOX', () => {
      const bbox = new BBOX([point11, point22]);
      bbox.grow();
      expect(bbox.width).to.equal(3);
      expect(bbox.height).to.equal(3);
    });

    it(`grows a BBOX by ${2}`, () => {
      const bbox = new BBOX([point11, point22]);
      bbox.grow(2);
      expect(bbox.width).to.equal(5);
      expect(bbox.height).to.equal(5);
    });
  });

  describe('#viewBox', () => {
    it('returns a viewBox', () => {
      const bbox = new BBOX([point11, point22]);
      expect(bbox.viewBox).to.deep.equal([1, 1, 1, 1]);
    });
  });

  describe('#csv()', () => {
    it('returns a csv', () => {
      const bbox = new BBOX([point11, point22]);
      expect(bbox.csv()).to.equal('1,1,2,2');
    });
  });

  describe('#center', () => {
    it('returns a point', () => {
      const bbox = new BBOX([point11, point22]);
      expect(bbox.center.x).to.equal(1.5);
      expect(bbox.center.y).to.equal(1.5);
    });
  });
});
