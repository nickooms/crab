import { Straat, Gebouw, log } from './CRAB';
import fs from 'fs';
import SVG from './SVG';
import BBOX from './BBOX';
import STYLE from './STYLE';
import WMS from './WMS';
import parse from './FeatureInfoParser';
import http from 'http';

async function drawGebouwen() {
  const svg = new SVG();
  /* const straat = await Straat.get(7338);
  const gebouwen = await straat.gebouwen();
  for (const gebouw of gebouwen) {
    (await gebouw.get()).draw(svg);
  }*/
  // for (const gebouw of await getGebouwen(2384)) gebouw.draw(svg);
  (await Gebouw.get(1544288)).draw(svg);
  /* for (let terreinobject of await straat.terreinobjecten()) {
    (await terreinobject.get()).draw(svg);
  }*/
  /* for (let wegobject of await straat.wegobjecten()) {
    (await wegobject.get()).draw(svg);
  }
  for (let wegsegment of await straat.wegsegmenten()) {
    (await wegsegment.get()).draw(svg);
  }*/
  svg.bbox.grow();
  svg.viewBox = svg.bbox.viewBox;
  const html = STYLE + svg.toSVG();
  /* fs.writeFile('svg.html', html, err => {
    if (err) log(err);
    log('SVG saved');
    console.log(html);
  });*/
  http.createServer((req, res) => {
    res.write(html);
    res.end();
  }).listen(3000);
}

async function getGebouwen(straatId) {
  const gebouwen = [];
  const straat = await Straat.get(straatId);
  const list = await straat.gebouwen();
  for (const item of list) {
    gebouwen.push(await item.get());
  }
  return gebouwen;
}

async function getHoogte() {
  const markt19 = (await Gebouw.get((await Gebouw.byHuisnummer(1373962)).toArray()[0]));
  const { geometrie } = markt19;
  const bbox = new BBOX(geometrie).csv();
  // const center = new BBOX(geometrie).center;
  const h = await WMS.getFeatureInfo({ bbox, width: 512, height: 512, i: 255, j: 255 });
  console.log(h);
  const value = parse(h).PixelValue;
  log(value);
  const png = await WMS.get3DMap({ bbox, width: 512, height: 512 });
  fs.writeFile('hoogte.png', png, 'binary', err => {
    if (err) log(err);
    log('PNG saved');
  });
}

async function run() {
  /* log(await Organisatie.list());
  log(await Bewerking.list());
  log(await Huisnummer.byStraatnaam(7338));
  log(await Huisnummer.get(1373962));*/
  // await getHoogte();
  /* const heights = [];
  // log(geometrie);
  const layers = {};
  for (let layer of ['DHMVII_DTM_1m', 'DHMVII_DSM_1m']) {
    layers[layer] = [];
    for (let point of geometrie) {
      const bbox = new BBOX([point]);
      bbox.grow(0.1);
      const features = await WMS.getFeatureInfo(bbox.csv(), layer);
      const value = parse(features).PixelValue;
      log(value);
      layers[layer].push(value);
    }
  }
  log(layers);*/
  await drawGebouwen();
}

run().catch(log);
