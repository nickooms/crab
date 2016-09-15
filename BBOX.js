import Point from './Point';

export default class BBOX {
  min = new Point([Infinity, Infinity]);
  max = new Point([-Infinity, -Infinity]);

  constructor(points) {
    if (points) {
      const x = points.map(point => point.x);
      const y = points.map(point => point.y);
      this.min = new Point([Math.min(...x), Math.min(...y)]);
      this.max = new Point([Math.max(...x), Math.max(...y)]);
    }
  }

  add(points = []) {
    if (points.length > 0) {
      const x = points.map(point => point.x);
      const y = points.map(point => point.y);
      this.min = new Point([Math.min(this.min.x, ...x), Math.min(this.min.y, ...y)]);
      this.max = new Point([Math.max(this.max.x, ...x), Math.max(this.max.y, ...y)]);
    }
  }

  grow(amount = 1) {
    this.min.move(-amount, -amount);
    this.max.move(amount, amount);
  }

  get width() {
    return this.max.x - this.min.x;
  }

  get height() {
    return this.max.y - this.min.y;
  }

  get viewBox() {
    const { min, width, height } = this;
    return [min.x, min.y, width, height];
  }

  csv() {
    const { min, max } = this;
    return [min.x, min.y, max.x, max.y].join(',');
  }

  get center() {
    const { min, max } = this;
    return new Point((min.x + max.x) / 2, (min.y + max.y) / 2);
  }
}
