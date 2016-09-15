export default class SVGText {
  constructor(point, text) {
    this.point = point;
    this.text = text;
  }

  toSVG(style = 'fill: black;') {
    const { x, y } = this.point;
    return `<text x="${x}" y="${y}" font-size="0.5" style="${style}">${this.text}</text>`;
  }
}
