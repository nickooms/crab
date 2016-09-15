import { expect } from 'chai';
import { log } from '../CRAB';

describe('CRAB', () => {
  describe('log', () => {
    it('returns the same arguments', () => {
      const args = log(1, 2);
      const [arg1, arg2] = args;
      expect(arg1).to.equal(1);
      expect(arg2).to.equal(2);
    });
  });
});
