export default class SVGCircle {
  constructor(point) {
    this.point = point;
  }

  toSVG(style = 'fill: green;') {
    const { x, y } = this.point;
    return `<circle cx="${x}" cy="${y}" r="0.5" style="${style}" />`;
  }
}
