const values = x => Object.keys(x).map(key => x[key]);

Object.values = Object.values || values;
