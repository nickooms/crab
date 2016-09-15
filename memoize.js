import initMemoize from 'persistent-memoize';
import initBlobStore from 'fs-blob-store';

const doMemoize = initMemoize(initBlobStore('cache'), { name: 'icky', version: '1.0.0' });

const memoize = fn => doMemoize(fn, fn.name);

export default memoize;
