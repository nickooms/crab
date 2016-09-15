import { Parser } from 'htmlparser2';

const Options = { decodeEntities: true, xmlMode: true };

const values = {};

let fieldName = null;
let field = { name: '', value: '' };

const ontext = text => {
  switch (fieldName) {
    case 'FieldName':
      field.name += text;
      break;
    case 'FieldValue':
      field.value += text;
      break;
    default:
      break;
  }
};

const onopentag = name => {
  switch (name) {
    case 'FieldName':
    case 'FieldValue':
      fieldName = name;
      break;
    default:
      break;
  }
};

const onclosetag = name => {
  switch (name) {
    case 'FieldValue':
      values[field.name.replace(/ /g, '')] = +field.value;
      field = { name: '', value: '' };
      fieldName = null;
      break;
    case 'FieldName':
      fieldName = null;
      break;
    default:
      break;
  }
};

const parse = features => {
  const parser = new Parser({ ontext, onopentag, onclosetag }, Options);
  parser.parseComplete(features);
  return values;
};

export default parse;
