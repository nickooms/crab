import Taal from './Taal';
import Gewest from './Gewest';
import Bewerking from './Bewerking';
import Organisatie from './Organisatie';
import Gemeente from './Gemeente';
import Straat from './Straat';
import Huisnummer from './Huisnummer';
import Gebouw from './Gebouw';
import Terrein from './Terrein';
import Wegobject from './Wegobject';
import Wegsegment from './Wegsegment';

export const log = (...args) => console.log(...args) || [...args];

export {
  Taal,
  Gewest,
  Organisatie,
  Bewerking,
  Gemeente,
  Straat,
  Huisnummer,
  Gebouw,
  Terrein,
  Wegobject,
  Wegsegment,
};
