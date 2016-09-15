import Point from './Point';

const RE = /POLYGON \(\(|\)\)/g;

const coord = x => new Point(x.split(' ').map(parseFloat));

// const polygon = x => x.replace(RE, '').split(', ').map(coord);

export default class Polygon {
  static of = x => x.replace(RE, '').split(', ').map(coord);
}
