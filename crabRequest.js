import memoize from './memoize';
import querystring from 'querystring';
import request from 'request-promise';
import parse from './parse';
import './Object.entries';
import './Object.values';

const URL = 'http://crab.agiv.be/Examples/Home/ExecOperation';
const method = 'POST';
const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

const parameterMapping = ([Name, Value]) => ({ Name, Value });

const encodeParameters = x => Object.entries(x).map(parameterMapping);

export async function crabRequest(operation, parameters) {
  const parametersJson = JSON.stringify(encodeParameters(parameters));
  const body = querystring.stringify({ operation, parametersJson });
  const html = await request(URL, { method, headers, body });
  return parse(html);
}

export default memoize(crabRequest);
