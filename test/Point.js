import { expect } from 'chai';
import Point from '../Point';

const [X, Y] = [1, 2];

const isPoint = x => expect(x).to.be.instanceof(Point);

describe('Point', () => {
  describe('constructor()', () => {
    it('creates a Point', () => {
      isPoint(new Point());
    });

    it(`creates a Point from ${X}, ${Y}`, () => {
      isPoint(new Point(X, Y));
    });

    it(`creates a Point from ['${X}', '${Y}']`, () => {
      isPoint(new Point([X.toString(), Y.toString()]));
    });

    it(`creates a Point from new Point(${X}, ${Y})`, () => {
      isPoint(new Point(new Point(X, Y)));
    });
  });
});
