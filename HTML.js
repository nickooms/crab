const tag = name => x => `<${name}>${x instanceof Array ? x.join('') : x}</${name}>`;

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

export { html, head, style, title, body, h1, ul, th, div, li, a, table, form }
