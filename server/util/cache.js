import cache from 'memory-cache';
import { decode } from './jwt';

export const saveRefreshToken = (token) => {
  console.log("for decoding " + JSON.stringify(token));
  const decoded = decode(token.access_token);
  console.log("decoded = " + JSON.stringify(decoded));
  console.log("access token = " + token.access_token);
  cache.put(`${decoded.sub}`, token.refresh_token);
};

export const removeRefreshToken = (token) => {
  const decoded = decode(token.access_token);
  cache.remove(decoded.sub);
};

export const getRefreshToken = (token) => {
  const decoded = decode(token);
  console.log('get from cache', cache.exportJson());
  return cache.get(decoded.sub);
};