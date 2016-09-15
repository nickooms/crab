const curry = fn => {
  const arity = fn.length;
  return (...args) => {
    const firstArgs = args.length;
    if (firstArgs >= arity) {
      return fn(...args);
    }
    return (...secondArgs) => fn(...[...args, ...secondArgs]);
  };
};

const curriedAdd = curry((x, y) => x + y);

const add1 = curriedAdd(1);

console.log(add1(2));
