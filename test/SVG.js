import { expect } from 'chai';
import SVG, { SVGLine, SVGRect, SVGPolygon, SVGCircle } from '../SVG';
import { Point11, Point22, Point12, Point21 } from './constants';
import { json } from './util';

const width = 200;
const height = 200;
const viewBox = [0, 0, 200, 200];
const Start = '<svg width="200" height="200" viewBox="0 0 200 200">';
const End = '</svg>';
const strokeLinecap = 'stroke-linecap="round"';
const strokeDasharray = 'stroke-dasharray="5, 5"';
const style = 'style="fill: none; stroke: purple; stroke-width: 1;"';
const Line = `<polyline ${strokeLinecap} ${strokeDasharray} points="1,1 2,2" ${style} />`;
const Circle = '<circle cx="1" cy="1" r="0.5" style="fill: green;" />';
const Rect = '<rect x="1" y="1" width="1" height="1" style="stroke: red; fill: none;" />';
const Points = 'points="1,1 1,2 2,2 2,1"';
const Polygon = `<polygon ${Points} style="fill: lime; stroke: purple; stroke-width: 0.5;" />`;

describe('SVG', () => {
  describe('constructor()', () => {
    it(`creates SVG with ${json({ width, height })}`, () => {
      const svg = new SVG({ width, height });
      expect(svg.width).to.equal(width);
      expect(svg.height).to.equal(height);
    });
  });

  describe('#toSVG()', () => {
    it(`creates SVG with ${json({ width, height, viewBox })}`, () => {
      const svg = new SVG({ width, height, viewBox });
      expect(svg.toSVG()).to.equal(`${Start}\n  \n${End}`);
    });

    it(`creates SVG with ${json({ width, height, viewBox })} and SVGLine`, () => {
      const svg = new SVG({ width, height, viewBox });
      svg.add(new SVGLine([Point11, Point22]));
      svg.add(new SVGCircle(Point11));
      svg.add(new SVGRect({ x: 1, y: 1, width: 1, height: 1 }));
      svg.add(new SVGPolygon([Point11, Point12, Point22, Point21]));
      expect(svg.toSVG()).to.equal(`${Start}\n  ${Line}\n${Circle}\n${Rect}\n${Polygon}\n${End}`);
    });
  });
});
