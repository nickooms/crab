import {
  Taal, Gewest, Gemeente, Straat, Huisnummer,
  Gebouw, Wegobject, Wegsegment, log,
} from './CRAB';
import SVG from './SVG';
import express from 'express';
import './Object.entries';

const PORT = 80;
const SVGStyle = 'svg { transform-origin: 50% 50%; transform: scale(1,-1); }';

const app = express();

const plural = [
  'Talen', 'Gewesten', 'Gemeenten', 'Straten', 'Huisnummers',
  'Wegobjecten', 'Wegsegmenten', 'Gebouwen',
];
const Ids = [
  'taal', 'gewest', 'gemeente', 'straat', 'huisnummer',
  'wegobject', 'wegsegment', 'gebouw',
];

const slash = x => `/${x}`;

const formPath = x => `${x}/:${Ids[plural.indexOf(x)]}Id`;

const getForm = (...x) => slash(x.map(formPath).join('/'));

const makePath = ([key, value]) => `${plural[Ids.indexOf(key)]}/${value}`;

const getPath = x => slash(Object.entries(x).map(makePath).join('/'));

const tag = name => x => `<${name}>${x instanceof Array ? x.join('') : x}</${name}>`;

const ids = req => Object.entries(req.params).map(([name, value]) => ({
  [name.replace('Id', '')]: `${parseInt(value, 10)}` === `${value}` ? parseInt(value, 10) : value,
})).reduce((obj, x) => {
  Object.assign(obj, x);
  return obj;
}, {});

const html = tag('html');
const head = tag('head');
const style = tag('style');
const title = tag('title');
const body = tag('body');
const h1 = tag('h1');
const ul = tag('ul');
const th = tag('th');
const div = tag('div');

const li = (list, fn) => list.map(x => `<li>${fn(x)}</li>`).join('');

const a = (href, x) => `<a href="${href}">${x}</a>`;

const table = (cols, rows, path) => `<table>
  <tr>${cols.map(th).join('')}</tr>
  ${rows.map(row => `<tr>
    ${cols.map(col => `<td>${a(`${path}/${row.id}`, row[col])}</td>`).join('')}
  </tr>`).join('')}
</table>`;

const form = (rows, object) => `<table>
  ${rows.map(row => `<tr>
    <th align="right">${row} :</th>
    <td>${object[row]}</td>
  </tr>`).join('')}
</table>`;

async function listTalen(req, res) {
  const list = [...(await Taal.list()).values()];
  res.send(html([head(title('Talen')), body([
    a('/', 'CRAB'),
    h1('Talen'),
    table(['id', 'naam', 'definitie'], list, 'Talen'),
  ])]));
}

async function showTaal(req, res) {
  const { taal } = ids(req);
  const object = await Taal.get(taal);
  const path = getPath({ taal });
  res.send(html([head(title('Taal')), body([
    a(`${path}/..`, 'Talen'),
    h1('Taal'),
    form(['id', 'naam', 'definitie'], object, path),
    a(`${path}/Gewesten`, 'Gewesten'),
  ])]));
}

async function listGewesten(req, res) {
  const list = (await Gewest.list()).toArray();
  res.send(html([head(title('Gewesten')), body([
    h1('Gewesten'),
    table(['id', 'naam'], list, '/Gewesten'),
  ])]));
}

async function showGewest(req, res) {
  const { gewest } = ids(req);
  const object = await Gewest.get(gewest);
  const path = getPath({ gewest });
  res.send(html([head(title('Gewest')), body([
    a('/Gewesten', 'Gewesten'),
    h1('Gewest'),
    form(['id', 'naam'], object, path),
    a(`${path}/Gemeenten`, 'Gemeenten'),
  ])]));
}

async function listGemeenten(req, res) {
  const { gewest } = ids(req);
  const object = await Gewest.get(gewest);
  const list = (await Gemeente.byGewest(gewest)).toArray();
  const path = '/Gemeenten';
  res.send(html([head(title('Gemeenten')), body([
    a(getPath({ gewest }), `Gewest ${object.naam}`),
    h1('Gemeenten'),
    table(['id', 'naam', 'nisId'], list, path),
  ])]));
}

async function jsonGemeenten(req, res) {
  const { gewest } = ids(req);
  const list = await Gemeente.byGewest(gewest);
  res.send(JSON.stringify(list));
}

async function showGemeente(req, res) {
  const { gemeente } = ids(req);
  const object = await Gemeente.get(gemeente);
  const gewest = await Gewest.get(object.gewest);
  const path = getPath({ gemeente });
  res.send(html([head(title('Gemeente')), body([
    a(getPath({ gewest: gewest.id }), `Gewest ${gewest.naam}`),
    h1('Gemeente'),
    form(['id', 'naam', 'nisId'], object, path),
    a(`${path}/Straten`, 'Straten'),
  ])]));
}

async function listStraten(req, res) {
  const { gemeente } = ids(req);
  const object = await Gemeente.get(gemeente);
  const list = (await Straat.byGemeente(gemeente)).toArray();
  const path = '/Straten';
  res.send(html([head(title('Straten')), body([
    a(getPath({ gemeente }), `Gemeente ${object.naam}`),
    h1('Straten'),
    table(['id', 'naam', 'taalCode2deTaal'], list, path),
  ])]));
}

async function jsonStraten(req, res) {
  const { gemeente } = ids(req);
  const list = (await Straat.byGemeente(gemeente)).toArray();
  res.send(JSON.stringify(list));
}

async function showStraat(req, res) {
  const { straat } = ids(req);
  const object = await Straat.get(straat);
  const gemeente = await Gemeente.get(object.gemeente);
  const path = getPath({ straat });
  res.send(html([head(title('Straat')), body([
    a(getPath({ gemeente: gemeente.id }), `Gemeente ${gemeente.naam}`),
    h1('Straat'),
    form(['id', 'naam'], object, path),
    a(`${path}/Huisnummers`, 'Huisnummers'),
    a(`${path}/Wegobjecten`, 'Wegobjecten'),
    a(`${path}/Wegsegmenten`, 'Wegsegmenten'),
  ])]));
}

async function listHuisnummers(req, res) {
  const { straat } = ids(req);
  const object = await Straat.get(straat);
  const list = (await Huisnummer.byStraatnaam(straat)).toArray();
  const path = '/Huisnummers';
  res.send(html([head(title('Huisnummers')), body([
    a(getPath({ straat }), `Straat ${object.naam}`),
    h1('Huisnummers'),
    table(['id', 'huisnummer'], list, path),
  ])]));
}

async function showHuisnummer(req, res) {
  const { huisnummer } = ids(req);
  const object = await Huisnummer.get(huisnummer);
  const straat = await Straat.get(object.straat);
  const path = getPath({ huisnummer });
  res.send(html([head(title('Huisnummer')), body([
    a(getPath({ straat: straat.id }), `Straat ${straat.naam}`),
    h1('Huisnummer'),
    form(['id', 'huisnummer'], object, path),
    a(`${path}/Gebouwen`, 'Gebouwen'),
  ])]));
}

async function listWegobjecten(req, res) {
  const { straat } = ids(req);
  const object = await Straat.get(straat);
  const list = (await Wegobject.byStraat(straat)).toArray();
  const path = '/Wegobjecten';
  res.send(html([head(title('Wegobjecten')), body([
    a(getPath({ straat }), `Straat ${object.naam}`),
    h1('Wegobjecten'),
    table(['id', 'aard'], list, path),
  ])]));
}

async function showWegobject(req, res) {
  const { wegobject } = ids(req);
  const object = await Wegobject.get(wegobject);
  const straten = (await object.straten()).toArray();
  const path = getPath({ wegobject });
  res.send(html([head(title('Wegobject')), body([
    div(straten.map(x => a(getPath({ straat: x.id }), `Straat ${x.naam}`))),
    h1('Wegobject'),
    form(['id', 'aard'], object, path),
  ])]));
}

async function listWegsegmenten(req, res) {
  const { straat } = ids(req);
  const object = await Straat.get(straat);
  const list = (await Wegsegment.byStraat(straat)).toArray();
  const path = '/Wegsegmenten';
  res.send(html([head(title('Wegsegmenten')), body([
    a(getPath({ straat }), `Straat ${object.naam}`),
    h1('Wegsegmenten'),
    table(['id', 'status'], list, path),
  ])]));
}

async function showWegsegment(req, res) {
  const { wegsegment } = ids(req);
  const object = await Wegsegment.get(wegsegment);
  const straten = (await object.straten()).toArray();
  const path = getPath({ wegsegment });
  res.send(html([head(title('Wegsegment')), body([
    div(straten.map(x => a(getPath({ straat: x.id }), `Straat ${x.naam}`))),
    h1('Wegsegment'),
    form(['id', 'status'], object, path),
  ])]));
}

async function listGebouwen(req, res) {
  const { huisnummer } = ids(req);
  const list = (await Gebouw.byHuisnummer(huisnummer)).toArray();
  const parent = await Huisnummer.get(huisnummer);
  const path = '/Gebouwen';
  res.send(html([head(title('Gebouwen')), body([
    a(getPath({ huisnummer }), `Huisnummer ${parent.huisnummer}`),
    h1('Gebouwen'),
    table(['id', 'aard', 'status'], list, path),
  ])]));
}

async function showGebouw(req, res) {
  const { gebouw: id } = ids(req);
  const gebouw = await Gebouw.get(id);
  const svg = new SVG();
  gebouw.draw(svg);
  svg.bbox.grow();
  svg.viewBox = svg.bbox.viewBox;
  // console.log(svg.children[0].toSVG());
  // console.log(svg.toSVG());
  const huisnummers = (await gebouw.huisnummers()).toArray();
  const path = getPath({ gebouw: id });
  res.send(html([head([title('Gebouw'), style(SVGStyle)]), body([
    div(huisnummers.map(x => a(getPath({ huisnummer: x.id }), `Huisnummer ${x.huisnummer}`))),
    h1('Gebouw'),
    form(['id', 'aard', 'status'], gebouw, path),
    div([svg.toSVG()]),
  ])]));
}

app.get('/', (req, res) => res.send(ul(li(plural, x => `<a href="${x}">${x}</a>`))));
app.get('/Talen', (req, res) => listTalen(req, res).catch(log));
app.get(getForm('Talen'), (req, res) => showTaal(req, res).catch(log));
app.get('/Gewesten', (req, res) => listGewesten(req, res).catch(log));
app.get(getForm('Gewesten'), (req, res) => showGewest(req, res).catch(log));
app.get('/Gewesten/:gewestId/Gemeenten', (req, res) => listGemeenten(req, res).catch(log));
app.get('/api/Gewesten/:gewestId/Gemeenten', (req, res) => jsonGemeenten(req, res).catch(log));
app.get(getForm('Gemeenten'), (req, res) => showGemeente(req, res).catch(log));
app.get('/Gemeenten/:gemeenteId/Straten', (req, res) => listStraten(req, res).catch(log));
app.get('/api/Gemeenten/:gemeenteId/Straten', (req, res) => jsonStraten(req, res).catch(log));
app.get(getForm('Straten'), (req, res) => showStraat(req, res).catch(log));
app.get('/Straten/:straatId/Huisnummers', (req, res) => listHuisnummers(req, res).catch(log));
app.get(getForm('Huisnummers'), (req, res) => showHuisnummer(req, res).catch(log));
app.get('/Straten/:straatId/Wegobjecten', (req, res) => listWegobjecten(req, res).catch(log));
app.get(getForm('Wegobjecten'), (req, res) => showWegobject(req, res).catch(log));
app.get('/Straten/:straatId/Wegsegmenten', (req, res) => listWegsegmenten(req, res).catch(log));
app.get(getForm('Wegsegmenten'), (req, res) => showWegsegment(req, res).catch(log));
app.get('/Huisnummers/:huisnummerId/Gebouwen', (req, res) => listGebouwen(req, res).catch(log));
app.get(getForm('Gebouwen'), (req, res) => showGebouw(req, res).catch(log));

app.listen(PORT, () => log(`CRAB app listening on port ${PORT}!`));
