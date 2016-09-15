const pipe = (...fns) => (...args) =>
  fns.slice(1).reduce(
    (result, fn) => fn(result), fns[0](args[0])
  );

const compose = (...fns) => (...args) =>
  fns.reverse().slice(1).reduce(
    (result, fn) => fn(result),
    fns[0](args[0])
  );

export default { pipe, compose };
