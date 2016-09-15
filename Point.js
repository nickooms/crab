export default class Point {
  constructor(...args) {
    switch (args.length) {
      case 1: {
        const arg = args[0];
        if (arg instanceof Point) {
          this.x = arg.x;
          this.y = arg.y;
        }
        if (arg instanceof Array) {
          const [x, y] = arg;
          if (typeof x === 'number' && typeof y === 'number') {
            this.x = x;
            this.y = y;
          } else {
            this.x = parseFloat(x.replace(',', '.'));
            this.y = parseFloat(y.replace(',', '.'));
          }
        }
        break;
      }
      case 2: {
        const [arg1, arg2] = args;
        if (typeof arg1 === 'number') this.x = arg1;
        if (typeof arg2 === 'number') this.y = arg2;
        break;
      }
      default:
        break;
    }
  }

  move(x, y) {
    this.x += x;
    this.y += y;
  }
}
