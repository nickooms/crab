const entries = x => Object.keys(x).map(key => [key, x[key]]);

Object.entries = Object.entries || entries;
