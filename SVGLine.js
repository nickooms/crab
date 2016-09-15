const strokeLineCap = 'stroke-linecap="round"';
const strokeDashArray = 'stroke-dasharray="5, 5"';

export default class SVGLine {
  constructor(points) {
    this.points = points;
  }

  toSVG(style = 'fill: none; stroke: purple; stroke-width: 1;') {
    const points = this.points.map(({ x, y }) => [x, y].join(',')).join(' ');
    return `<polyline ${strokeLineCap} ${strokeDashArray} points="${points}" style="${style}" />`;
  }
}
