import { Bewerking } from '../CRAB';
import { Count } from './constants';
import { isList } from './util';

describe('Bewerking', () => {
  describe('list()', () => {
    it(`finds ${Count.bewerkingen} bewerkingen`, async () => {
      isList(await Bewerking.list(), Count.bewerkingen);
    });
  });
});
