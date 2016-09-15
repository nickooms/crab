export default class SVGPolygon {
  constructor(points) {
    this.points = points;
  }

  toSVG(style = 'fill: lime; stroke: purple; stroke-width: 0.5;') {
    const points = this.points.map(({ x, y }) => [x, y].join(',')).join(' ');
    return `<polygon points="${points}" style="${style}" />`;
  }
}
