import CrabObject, { toEntry, begin } from './CrabObject';
import { SorteerVeld } from './constants';
import { Huisnummer } from './CRAB';
import { SVGPolygon } from './SVG';
import Polygon from './Polygon';

class Gebouwen extends Map {
  toArray = () => [...this.values()];
}

export default class Gebouw extends CrabObject {
  static new = x => new Gebouw(x);

  static object = x => Object.assign(Gebouw.new(x), Gebouw.getMap(x));

  static map = x => ({
    id: +x.IdentificatorGebouw,
    aard: +x.AardGebouw,
    status: +x.StatusGebouw,
  });

  static getMap = x => ({
    geometriemethodeGebouw: +x.GeometriemethodeGebouw,
    geometrie: Polygon.of(x.Geometrie),
    begin: begin(x),
  });

  static result = x => new Gebouwen(x.map(Gebouw.new).map(toEntry));

  static getResult = x => x.map(Gebouw.object)[0];

  static async byHuisnummer(huisnummer) {
    const operation = 'ListGebouwenByHuisnummerId';
    const HuisnummerId = Huisnummer.id(huisnummer);
    return this.result(await this.crab(operation, { HuisnummerId, SorteerVeld }));
  }

  static async get(gebouw) {
    const operation = 'GetGebouwByIdentificatorGebouw';
    const IdentificatorGebouw = Gebouw.id(gebouw);
    return this.getResult(await this.crab(operation, { IdentificatorGebouw }));
  }

  async get() {
    return await Gebouw.get(this);
  }

  draw = (svg/* , layers = {}*/) => {
    const { geometrie } = this;
    svg.bbox.add(geometrie);
    svg.add(new SVGPolygon(geometrie));
    /* if (layers) {
      geometrie.forEach(p => svg.add(new SVGCircle(p)));
      const heights = [];
      for (let layer in layers) {
        const height = [];
        let i = 0;
        geometrie.forEach(p => {
          const h = layers[layer][i++];
          //svg.add(new SVGText(p, h));
          height.push(h);
        });
        for (let x = 0; x < height.length; x++) {
          if (heights[x] == undefined) {
            heights[x] = height[x];
          } else {
            heights[x] += ' - ' + height[x];
          }
        }
        //heights.push(height);
      }
      let ii = 0;
      geometrie.forEach(p => {
        //const h = layers[layer][i++];
        svg.add(new SVGText(p, heights[ii++]));
        //height.push(h);
      });
      console.log(heights);
    }*/
  }
}
