import memoize from './memoize';
import request from 'request-promise';

const BASE_URL = 'http://geoservices.informatievlaanderen.be/raadpleegdiensten/';
const URL = `${BASE_URL}DHMV/wms?`;
const URL3D = `${BASE_URL}3DGRB/wms?`;

const method = 'GET';
const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

const service = 'WMS';
const crs = 'EPSG:31370';
const format = 'image/png';
const transparent = 'TRUE';
const styles = 'default';
const version = '1.3.0';

const base = { service, crs, format, transparent, styles, version };

const querystring = query => Object.entries(query).map(x => x.join('=')).join('&');

async function getFeatureInfo({ bbox, width = 512, height = 512, i = 255, j = 255 }) {
  const REQUEST = 'GetFeatureInfo';
  const INFO_FORMAT = 'application/vnd.esri.wms_featureinfo_xml';
  const layer = 'DHMVII_DSM_1m';
  const layers = layer;
  const QUERY_LAYERS = layer;
  const FEATURE_COUNT = 10;
  const baseQuery = Object.assign({ REQUEST, layers, width, height, bbox }, base);
  const query = Object.assign({ INFO_FORMAT, QUERY_LAYERS, FEATURE_COUNT, i, j }, baseQuery);
  return await request(`${URL}${querystring(query)}`, { method, headers });
}

async function getMap(bbox) {
  const REQUEST = 'GetMap';
  const layers = 'DHMVII_DSM_5m';
  const width = 2000;
  const height = 2000;
  const query = Object.assign({ REQUEST, layers, width, height, bbox }, base);
  return await request(`${URL}${querystring(query)}`, { method, headers, encoding: 'binary' });
}

async function get3DMap({ bbox, width = 2048, height = 2048 }) {
  const REQUEST = 'GetMap';
  const layers = 'GRBGEBL1D2';
  const query = Object.assign({ REQUEST, layers, width, height, bbox }, base);
  return await request(`${URL3D}${querystring(query)}`, { method, headers, encoding: 'binary' });
}

export default class WMS {
  static getFeatureInfo = memoize(getFeatureInfo);

  static getMap = memoize(getMap);

  static get3DMap = memoize(get3DMap);
}
