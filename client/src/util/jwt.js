import { LOCAL_STORAGE_ACCESS_TOKEN_KEY } from '../config';

const invalidate = () => {
  localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
};

const setToken = (token) => {
  localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, token);
};

export const getToken = () => localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY) || null;

export default {
  setToken,
  getToken,
  invalidate
};


