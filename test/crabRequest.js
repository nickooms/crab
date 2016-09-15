import mocha from 'mocha';
import { expect } from 'chai';
import { crabRequest } from '../crabRequest';
import { VlaamsGewest, Nederlands } from './constants';
import { json } from './util';

const { id: TaalCode } = Nederlands;
const { id: GewestId, naam } = VlaamsGewest;

mocha.timeout = 5000;

describe('crabRequest', () => {
  it(`finds ${naam} by ${json({ GewestId, TaalCode })}`, async () => {
    const [gewest] = await crabRequest('GetGewestByGewestIdAndTaalCode', { GewestId, TaalCode });
    expect(gewest.GewestId).to.equal(GewestId.toString());
  });
});
