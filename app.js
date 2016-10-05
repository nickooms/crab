import {
  Taal, Gewest, Gemeente, Straat, Huisnummer,
  Gebouw, Wegobject, Wegsegment, log,
} from './CRAB';
import SVG from './SVG';
import express from 'express';
import './Object.entries';
import { html, head, style, title, body, h1, ul, th, div, li, a, table, form } from './HTML';

const PORT = 80;
const SVGStyle = 'svg { transform-origin: 50% 50%; transform: scale(1,-1); }';

const app = express();

const Model = new Map([
  [Taal, { parent: null, plural: 'Talen', columns: ['naam', 'definitie'] }],
  [Gewest, { parent: null, plural: 'Gewesten', columns: ['naam'] }],
  [Gemeente, { parent: Gewest, plural: 'Gemeenten', columns: ['naam', 'nisId'] }],
  [Straat, { parent: Gemeente, plural: 'Straten', columns: ['naam', 'taalCode2deTaal'] }],
  [Huisnummer, { parent: Straat, plural: 'Huisnummers', columns: ['huisnummer'] }],
  [Wegobject, { parent: Straat, plural: 'Wegobjecten', columns: ['aard'] }],
  [Wegsegment, { parent: Straat, plural: 'Wegsegmenten', columns: ['status'] }],
  [Gebouw, { parent: Huisnummer, plural: 'Gebouwen', columns: ['aard', 'status'] }],
]);

const plural = [...Model.values()].map(({ plural }) => plural);
const Ids = [...Model.keys()].map(({ name }) => name.toLowerCase());

const slash = x => `/${x}`;

const formPath = x => `${x}/:${Ids[plural.indexOf(x)]}Id`;

const getForm = (...x) => slash(x.map(formPath).join('/'));

const makePath = ([key, value]) => `${plural[Ids.indexOf(key)]}/${value}`;

const getPath = x => slash(Object.entries(x).map(makePath).join('/'));

const ids = req => Object.entries(req.params).map(([name, value]) => ({
  [name.replace('Id', '')]: `${parseInt(value, 10)}` === `${value}` ? parseInt(value, 10) : value,
})).reduce((obj, x) => {
  Object.assign(obj, x);
  return obj;
}, {});

const Parent = new Map([...Model.entries()].map(([Class, { parent }]) => [Class, parent]));
const getParent = Class => Parent.get(Class);

const Plurals = new Map([...Model.entries()].map(([Class, { plural }]) => [Class, plural]));
const getPlural = Class => Plurals.get(Class);

const Columns = new Map([...Model.entries()].map(([Class, { columns }]) => [Class, columns]));
const getColumns = Class => ['id'].concat(Columns.get(Class));

const getByParent = Class => async id => await Class[getParent(Class) ? `by${getParent(Class).name}` : 'list' ](id);

const getParentId = Class => req => getParent(Class) ? req.params[`${getParent(Class).name.toLowerCase()}Id`] : null;

const getDef = Class => async req => {
  const parentClass = getParent(Class);
  const parentName = parentClass ? parentClass.name : null;
  const parentIdString = getParentId(Class)(req);
  const parentIdInt = parseInt(parentIdString, 10);
  const parentId = Number.isInteger(parentIdInt) ? parentIdInt : parentIdString;
  const byParent = getByParent(Class);
  const plural = getPlural(Class);
  const list = await byParent(parentId);
  const parent = await (parentClass ? parentClass.get(parentId) : null);
  const columns = getColumns(Class);
  const parentLink = parentClass
    ? a(getPath({ [parentName.toLowerCase()]: parentId }), `${parentName} ${parent[getColumns(parentClass)[1]]}`)
    : a('/', 'CRAB');
  const jsonLink = parentClass
    ? a(`/api${getPath({ [parentName.toLowerCase()]: parentId })}/${plural}`, 'JSON')
    : a(`/api/${plural}`, 'JSON');
  return { parentClass, parentName, parentId, byParent, plural, list, parent, columns, parentLink, jsonLink };
};

const Children = new Map([...Model.keys()].map(Class => [Class, [...Model.entries()].filter(([Child, { parent }]) => parent === Class).map(([Child]) => Child)]));

const getClassDef = Class => {
  const { name } = Class;
  const plural = getPlural(Class);
  const columns = getColumns(Class);
  const children = Children.get(Class);
  const parent = Parent.get(Class);
  return { name, plural, columns, children, parent };
};

const getDefinition = Class => async req => {
  const { name, plural, columns, children, parent: parentClass } = getClassDef(Class);
  const { [name.toLowerCase()]: id } = ids(req);
  const object = await Class.get(id);
  const path = getPath({ [name.toLowerCase()]: id });
  const childLinks = children.map(Child => Model.get(Child).plural).map(names => a(`${path}/${names}`, names));
  return { name, plural, columns, id, object, path, children, childLinks, parentClass };
};

const listPage = Class => async req => {
  const { plural, list, columns, parentLink, jsonLink } = await getDef(Class)(req);
  return html([
    head(title(plural)), body([
      parentLink,
      h1([`${plural} `, jsonLink]),
      table(columns, list.toArray(), slash(plural)),
    ])
  ]);
};

const list = Class => async req => await listPage(Class)(req);

const parentLink = ({ name, parent, column }) => a(getPath({ [name.toLowerCase()]: parent.id }), `${name} ${parent[column]}`);

const Show = new Map([
  [Taal, async (req, res) => {
    const { name, columns, plural, id, object, path, children, childLinks, parentClass } = await getDefinition(Taal)(req);
    res.send(html([head(title(name)), body([
      a(slash(plural), plural),
      h1(name),
      form(columns, object, path),
      div(childLinks),
    ])]));
  }],
  [Gewest, async (req, res) => {
    const { name, columns, plural, id, object, path, children, childLinks, parentClass } = await getDefinition(Gewest)(req);
    res.send(html([head(title(name)), body([
      a(slash(plural), plural),
      h1(name),
      form(columns, object, path),
      div(childLinks),
    ])]));
  }],
  [Gemeente, async (req, res) => {
    const { name, columns, plural, id, object, path, children, childLinks, parentClass } = await getDefinition(Gemeente)(req);
    const { name: parentName, columns: [, column] } = getClassDef(parentClass);
    const parents = [await parentClass.get(object[parentName.toLowerCase()])];
    const parentLinks = parents.map(parent => parentLink({ name: parentName, parent, column }));
    res.send(html([head(title(name)), body([
      div(parentLinks),
      h1(name),
      form(columns, object, path),
      div(childLinks),
    ])]));
  }],
  [Straat, async (req, res) => {
    const { name, columns, plural, id, object, path, children, childLinks, parentClass } = await getDefinition(Straat)(req);
    const { name: parentName, columns: [, column] } = getClassDef(parentClass);
    const parents = [await parentClass.get(object[parentName.toLowerCase()])];
    const parentLinks = parents.map(parent => parentLink({ name: parentName, parent, column }));
    res.send(html([head(title(name)), body([
      div(parentLinks),
      h1(name),
      form(columns, object, path),
      div(childLinks),
    ])]));
  }],
  [Huisnummer, async (req, res) => {
    const { name, columns, plural, id, object, path, children, childLinks, parentClass } = await getDefinition(Huisnummer)(req);
    const { name: parentName, columns: [, column] } = getClassDef(parentClass);
    const parents = [await parentClass.get(object[parentName.toLowerCase()])];
    const parentLinks = parents.map(parent => parentLink({ name: parentName, parent, column }));
    res.send(html([head(title(name)), body([
      div(parentLinks),
      h1(name),
      form(columns, object, path),
      div(childLinks),
    ])]));
  }],
  [Wegobject, async (req, res) => {
    const { name, columns, plural, id, object, path, children, childLinks, parentClass } = await getDefinition(Wegobject)(req);
    const { name: parentName, columns: [, column] } = getClassDef(parentClass);
    const parents = (await object.straten()).toArray();
    const parentLinks = parents.map(parent => parentLink({ name: parentName, parent, column }));
    res.send(html([head(title(name)), body([
      div(parentLinks),
      h1(name),
      form(columns, object, path),
      div(childLinks),
    ])]));
  }],
  [Wegsegment, async (req, res) => {
    const { name, columns, plural, id, object, path, children, childLinks, parentClass } = await getDefinition(Wegsegment)(req);
    const { name: parentName, columns: [, column] } = getClassDef(parentClass);
    const parents = (await object.straten()).toArray();
    const parentLinks = parents.map(parent => parentLink({ name: parentName, parent, column }))
    res.send(html([head(title(name)), body([
      div(parentLinks),
      h1(name),
      form(columns, object, path),
      div(childLinks),
    ])]));
  }],
  [Gebouw, async (req, res) => {
    const { name, columns, plural, id, object, path, children, childLinks, parentClass } = await getDefinition(Gebouw)(req);
    const { name: parentName, columns: [, column] } = getClassDef(parentClass);
    const parents = (await object.huisnummers()).toArray();
    const parentLinks = parents.map(parent => parentLink({ name: parentName, parent, column }));
    const svg = new SVG();
    object.draw(svg);
    svg.bbox.grow();
    svg.viewBox = svg.bbox.viewBox;
    res.send(html([head([title(name), style(SVGStyle)]), body([
      div(parentLinks),
      h1(name),
      form(columns, object, path),
      div(childLinks),
      div([svg.toSVG()]),
    ])]));
  }],
]);

const Json = new Map([
  [Taal, async (req, res) => res.send(JSON.stringify((await Taal.list()).toArray()))],
  [Gewest, async (req, res) => res.send(JSON.stringify((await Gewest.list()).toArray()))],
  [Gemeente, async (req, res) => res.send(JSON.stringify((await Gemeente.byGewest(ids(req).gewest)).toArray()))],
  [Straat, async (req, res) => res.send(JSON.stringify((await Straat.byGemeente(ids(req).gemeente)).toArray()))],
  [Huisnummer, async (req, res) => res.send(JSON.stringify((await Huisnummer.byStraat(ids(req).straat)).toArray()))],
  [Wegobject, async (req, res) => res.send(JSON.stringify((await Wegobject.byStraat(ids(req).straat)).toArray()))],
  [Wegsegment, async (req, res) => res.send(JSON.stringify((await Wegsegment.byStraat(ids(req).straat)).toArray()))],
  [Gebouw, async (req, res) => res.send(JSON.stringify((await Gebouw.byHuisnummer(ids(req).huisnummer)).toArray()))],
]);

app.get('/', (req, res) => res.send(ul(li(plural, x => `<a href="${x}">${x}</a>`))));
app.get('/Talen', (req, res) => list(Taal)(req).then(x => res.send(x)).catch(log));
app.get('/Gewesten', (req, res) => list(Gewest)(req).then(x => res.send(x)).catch(log));
app.get('/Gewesten/:gewestId/Gemeenten', (req, res) => list(Gemeente)(req).then(x => res.send(x)).catch(log));
app.get('/Gemeenten/:gemeenteId/Straten', (req, res) => list(Straat)(req).then(x => res.send(x)).catch(log));
app.get('/Straten/:straatId/Huisnummers', (req, res) => list(Huisnummer)(req).then(x => res.send(x)).catch(log));
app.get('/Straten/:straatId/Wegobjecten', (req, res) => list(Wegobject)(req).then(x => res.send(x)).catch(log));
app.get('/Straten/:straatId/Wegsegmenten', (req, res) => list(Wegsegment)(req).then(x => res.send(x)).catch(log));
app.get('/Huisnummers/:huisnummerId/Gebouwen', (req, res) => list(Gebouw)(req).then(x => res.send(x)).catch(log));
app.get('/api/Talen', (req, res) => Json.get(Taal)(req, res).catch(log));
app.get('/api/Gewesten', (req, res) => Json.get(Gewest)(req, res).catch(log));
app.get('/api/Gewesten/:gewestId/Gemeenten', (req, res) => Json.get(Gemeente)(req, res).catch(log));
app.get('/api/Gemeenten/:gemeenteId/Straten', (req, res) => Json.get(Straat)(req, res).catch(log));
app.get('/api/Straten/:straatId/Huisnummers', (req, res) => Json.get(Huisnummer)(req, res).catch(log));
app.get('/api/Straten/:straatId/Wegobjecten', (req, res) => Json.get(Wegobject)(req, res).catch(log));
app.get('/api/Straten/:straatId/Wegsegmenten', (req, res) => Json.get(Wegsegment)(req, res).catch(log));
app.get('/api/Huisnummers/:huisnummerId/Gebouwen', (req, res) => Json.get(Gebouw)(req, res).catch(log));
app.get(getForm('Talen'), (req, res) => Show.get(Taal)(req, res).catch(log));
app.get(getForm('Gewesten'), (req, res) => Show.get(Gewest)(req, res).catch(log));
app.get(getForm('Gemeenten'), (req, res) => Show.get(Gemeente)(req, res).catch(log));
app.get(getForm('Straten'), (req, res) => Show.get(Straat)(req, res).catch(log));
app.get(getForm('Huisnummers'), (req, res) => Show.get(Huisnummer)(req, res).catch(log));
app.get(getForm('Wegobjecten'), (req, res) => Show.get(Wegobject)(req, res).catch(log));
app.get(getForm('Wegsegmenten'), (req, res) => Show.get(Wegsegment)(req, res).catch(log));
app.get(getForm('Gebouwen'), (req, res) => Show.get(Gebouw)(req, res).catch(log));

app.listen(PORT, () => log(`CRAB app listening on port ${PORT}!`));
