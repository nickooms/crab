import { Organisatie } from '../CRAB';
import { Count } from './constants';
import { isList } from './util';

describe('Organisatie', () => {
  describe('list()', () => {
    it(`finds ${Count.organisaties} organisaties`, async () => {
      isList(await Organisatie.list(), Count.organisaties);
    });
  });
});
