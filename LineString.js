import Point from './Point';

const RE = /LINESTRING \(|\)/g;

const coord = x => new Point(x.split(' ').map(parseFloat));

// const lineString = x => x.replace(RE, '').split(', ').map(coord);

export default class LineString {
  static of = x => x.replace(RE, '').split(', ').map(coord);
}
