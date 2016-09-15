export default class SVGRect {
  constructor({ x, y, width, height }) {
    Object.assign(this, { x, y, width, height });
  }

  toSVG(style = 'stroke: red; fill: none;') {
    const { x, y, width, height } = this;
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" style="${style}" />`;
  }
}
