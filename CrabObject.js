import crabRequest from './crabRequest';

export class CrabObjecten extends Map {
  toArray = () => [...this.values()];
}

export default class CrabObject {
  constructor(x) {
    Object.assign(this, this.constructor.map(x));
  }

  static id = x => (typeof x === 'object' ? x.id : x);

  static async crab(operation, parameters) {
    return await crabRequest(operation, parameters);
  }
}

export const begin = x => ({
  datum: new Date(x.BeginDatum),
  tijd: new Date(x.BeginTijd),
  bewerking: +x.BeginBewerking,
  organisatie: +x.BeginOrganisatie,
});

export const toEntry = x => [x.id, x];

export const toMap = x => new Map(x.map(toEntry));

export const groupByFn = groupBys => (groups, x) => {
  const keys = [];
  groupBys.forEach(groupBy => {
    const key = x[groupBy];
    delete x[groupBy];
    keys.push(key);
  });
  const key = JSON.stringify(keys);
  if (!groups.has(key)) {
    groups.set(key, []);
  }
  groups.get(key).push(x);
  return groups;
};

export const groupFn = (groupBys, groupField) => ([keys, value]) => {
  const keysObject = JSON.parse(keys);
  const entry = {};
  groupBys.forEach((groupBy, index) => {
    Object.assign(entry, { [groupBy]: keysObject[index] });
  });
  Object.assign(entry, { [groupField]: value });
  return entry;
};

export const groupBy = (x, groupBys, group) =>
  [...x.reduce(groupByFn(groupBys), new Map())].map(groupFn(groupBys, group));
