import { expect } from 'chai';

const json = x => JSON.stringify(x);

const isArray = (x, length) => {
  expect(x.length).to.equal(length);
};

const isList = (x, length) => {
  const array = x.toArray();
  isArray(array, length);
  return array;
};

const testObject = (o, fn) => describe(`${o.name}.`, () => {
  Object.entries(fn).forEach(([name, test]) => {
    const f = o[name].bind(o);
    const [type, ok, args] = test;
    args.forEach(arg => {
      describe(`${name}(${Object.keys(arg).join(', ')})`, () => {
        it(ok, async () => type(await f(...Object.values(arg))));
      });
    });
  });
});

export { json, isArray, isList, testObject, expect };
