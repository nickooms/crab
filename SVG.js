import BBOX from './BBOX';
import SVGLine from './SVGLine';
import SVGRect from './SVGRect';
import SVGCircle from './SVGCircle';
import SVGPolygon from './SVGPolygon';

const toSVG = x =>
`<svg width="${x.width}" height="${x.height}" viewBox="${x.viewBox.join(' ')}">
  ${x.children.map(c => c.toSVG()).join('\n')}
</svg>`;

export default class SVG {
  constructor({ width = '100%', height = '100%', viewBox, bbox = new BBOX() } = {}, ...children) {
    Object.assign(this, { width, height, viewBox, bbox, children });
  }

  add = x => this.children.push(x);

  toSVG = () => toSVG(this);
}

export { SVGLine, SVGRect, SVGCircle, SVGPolygon };
