import { Taal, Gewest, Gemeente, Straat, Huisnummer, Gebouw, log } from './CRAB';
import express from 'express';
import './Object.entries';

const PORT = 5000;

const app = express();

const plural = ['Talen', 'Gewesten', 'Gemeenten', 'Straten', 'Huisnummers', 'Gebouwen'];
const Ids = ['taal', 'gewest', 'gemeente', 'straat', 'huisnummer', 'gebouw'];

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
const title = tag('title');
const body = tag('body');
const h1 = tag('h1');
const ul = tag('ul');
const th = tag('th');

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
  const talen = [...(await Taal.list()).values()];
  res.send(html([head(title('Talen')), body([
    a('/', 'CRAB'),
    h1('Talen'),
    table(['id', 'naam', 'definitie'], talen, 'Talen'),
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

const gewestTaal = taalId => x => ({ id: x.id, naam: x.talen.get(taalId).naam });

async function listGewesten(req, res) {
  const { taal } = ids(req);
  const gewesten = [...(await Gewest.list()).values()].map(gewestTaal(taal));
  const path = getPath({ taal });
  res.send(html([head(title('Gewesten')), body([
    a(`${path}/..`, 'Taal'),
    h1('Gewesten'),
    table(['id', 'naam'], gewesten, `${path}/Gewesten`),
  ])]));
}

async function showGewest(req, res) {
  const { taal, gewest } = ids(req);
  const object = (await Gewest.get(gewest)).taal(taal);
  const path = getPath({ taal, gewest });
  res.send(html([head(title('Gewest')), body([
    a(`${path}/..`, 'Gewesten'),
    h1('Gewest'),
    form(['id', 'naam'], object, path),
    a(`${path}/Gemeenten`, 'Gemeenten'),
  ])]));
}

async function listGemeenten(req, res) {
  const { taal, gewest } = ids(req);
  const gemeenten = (await Gemeente.byGewest(gewest)).taal(taal);
  const path = `${getPath({ taal, gewest })}/Gemeenten`;
  res.send(html([head(title('Gemeenten')), body([
    a(`${path}/..`, 'Gewest'),
    h1('Gemeenten'),
    table(['id', 'naam', 'nisId'], gemeenten, path),
  ])]));
}

async function jsonGemeenten(req, res) {
  const { taal, gewest } = ids(req);
  const gemeenten = (await Gemeente.byGewest(gewest)).taal(taal);
  res.send(JSON.stringify(gemeenten));
}

async function showGemeente(req, res) {
  const { taal, gewest, gemeente } = ids(req);
  const x = (await Gemeente.byGewest(gewest)).get(gemeente);
  const object = Gemeente.taal(x, taal);
  const path = getPath({ taal, gewest, gemeente });
  res.send(html([head(title('Gemeente')), body([
    a(`${path}/..`, 'Gemeenten'),
    h1('Gemeente'),
    form(['id', 'naam', 'nisId'], object, path),
    a(`${path}/Straten`, 'Straten'),
  ])]));
}

async function listStraten(req, res) {
  const { taal, gewest, gemeente } = ids(req);
  const straten = (await Straat.byGemeente(gemeente)).toArray();
  const path = `${getPath({ taal, gewest, gemeente })}/Straten`;
  res.send(html([head(title('Straten')), body([
    a(`${path}/..`, 'Gemeente'),
    h1('Straten'),
    table(['id', 'naam', 'taalCode2deTaal'], straten, path),
  ])]));
}

async function jsonStraten(req, res) {
  const id = ids(req);
  const straten = (await Straat.byGemeente(id.gemeente)).toArray();
  res.send(JSON.stringify(straten));
}

async function showStraat(req, res) {
  const { taal, gewest, gemeente, straat } = ids(req);
  const object = (await Straat.byGemeente(gemeente)).get(straat);
  const path = getPath({ taal, gewest, gemeente, straat });
  res.send(html([head(title('Straat')), body([
    a(`${path}/..`, 'Straten'),
    h1('Straat'),
    form(['id', 'naam'], object, path),
    a(`${path}/Huisnummers`, 'Huisnummers'),
    a(`${path}/Wegobjecten`, 'Wegobjecten'),
    a(`${path}/Wegsegmenten`, 'Wegsegmenten'),
  ])]));
}

async function listHuisnummers(req, res) {
  const { taal, gewest, gemeente, straat } = ids(req);
  const huisnummers = (await Huisnummer.byStraatnaam(straat)).toArray();
  const path = `${getPath({ taal, gewest, gemeente, straat })}/Huisnummers`;
  res.send(html([head(title('Huisnummers')), body([
    a(`${path}/..`, 'Straat'),
    h1('Huisnummers'),
    table(['id', 'huisnummer'], huisnummers, path),
  ])]));
}

async function showHuisnummer(req, res) {
  const { taal, gewest, gemeente, straat, huisnummer } = ids(req);
  const object = (await Huisnummer.byStraatnaam(straat)).get(huisnummer);
  const path = getPath({ taal, gewest, gemeente, straat, huisnummer });
  res.send(html([head(title('Huisnummer')), body([
    a(`${path}/..`, 'Huisnummers'),
    h1('Huisnummer'),
    form(['id', 'huisnummer'], object, path),
    a(`${path}/Gebouwen`, 'Gebouwen'),
  ])]));
}

async function listGebouwen(req, res) {
  const { taal, gewest, gemeente, straat, huisnummer } = ids(req);
  const gebouwen = (await Gebouw.byHuisnummer(huisnummer)).toArray();
  const path = `${getPath({ taal, gewest, gemeente, straat, huisnummer })}/Gebouwen`;
  res.send(html([head(title('Gebouwen')), body([
    a(`${path}/..`, 'Huisnummer'),
    h1('Gebouwen'),
    table(['id', 'gebouw'], gebouwen, path),
  ])]));
}

app.get('/', (req, res) => res.send(ul(li(plural, x => `<a href="${x}">${x}</a>`))));
app.get('/Talen', (req, res) => listTalen(req, res).catch(log));
app.get(getForm('Talen'), (req, res) => showTaal(req, res).catch(log));
app.get('/Talen/:taalId/Gewesten', (req, res) => listGewesten(req, res).catch(log));
app.get(getForm('Talen', 'Gewesten'), (req, res) => showGewest(req, res).catch(log));
app.get('/Talen/:taalId/Gewesten/:gewestId/Gemeenten',
  (req, res) => listGemeenten(req, res).catch(log)
);
app.get('/api/Talen/:taalId/Gewesten/:gewestId/Gemeenten',
  (req, res) => jsonGemeenten(req, res).catch(log)
);
app.get(getForm('Talen', 'Gewesten', 'Gemeenten'),
  (req, res) => showGemeente(req, res).catch(log)
);
app.get('/Talen/:taalId/Gewesten/:gewestId/Gemeenten/:gemeenteId/Straten',
  (req, res) => listStraten(req, res).catch(log)
);
app.get('/api/Talen/:taalId/Gewesten/:gewestId/Gemeenten/:gemeenteId/Straten',
  (req, res) => jsonStraten(req, res).catch(log)
);
app.get(getForm('Talen', 'Gewesten', 'Gemeenten', 'Straten'),
  (req, res) => showStraat(req, res).catch(log)
);
app.get('/Talen/:taalId/Gewesten/:gewestId/Gemeenten/:gemeenteId/Straten/:straatId/Huisnummers',
  (req, res) => listHuisnummers(req, res).catch(log)
);
app.get('/Talen/:taalId/Gewesten/:gewestId/Gemeenten/:gemeenteId/Straten/:straatId/Huisnummers/:huisnummerId/Gebouwen',
  (req, res) => listGebouwen(req, res).catch(log)
);
app.get(getForm('Talen', 'Gewesten', 'Gemeenten', 'Straten', 'Huisnummers'),
  (req, res) => showHuisnummer(req, res).catch(log)
);

app.listen(PORT, () => log(`CRAB app listening on port ${PORT}!`));
