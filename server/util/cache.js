import cache from 'memory-cache';
import { decode } from './jwt';

export const saveRefreshToken = (token) => {
  const decoded = decode(token.accessToken);
  console.log("decoded = " + decoded);
  cache.put(`${decoded.sub}`, token.refreshToken);
};

export const removeRefreshToken = (token) => {
  const decoded = decode(token.accessToken);
  cache.remove(decoded.sub);
};

export const getRefreshToken = (token) => {
  const decoded = decode(token);
  console.log('get from cache', cache.exportJson());
  return cache.get(decoded.sub);
};
