export default class Color {
  constructor(uInt32) {
    this.value = uInt32;
  }

  static of = x => new Color(x);

  comp(index) { return (this.value >> (index * 8)) & 0xff; }

  inverse() {
    const r = 0xff - this.r;
    const g = 0xff - this.g;
    const b = 0xff - this.b;
    return Color.of(r | g << 8 | b << 16 | 0xff << 24);
  }

  get hex() { return this.value.toString(16); }

  get r() { return this.comp(0); }

  get g() { return this.comp(1); }

  get b() { return this.comp(2); }

  get a() { return this.comp(3); }

  get rgba() { return `rgba(${this.r},${this.g},${this.b},${this.a})`; }

  get int() {
    return ((this.r >> 5) << 6) | ((this.g >> 5) << 3) | ((this.b >> 5) << 0);
  }
}
