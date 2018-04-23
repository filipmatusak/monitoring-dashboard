const config = {
    API_ENDPOINT_PATH: '/api',
    LOCAL_STORAGE_ACCESS_TOKEN_KEY: 'ac/access_token',
    LOCAL_STORAGE_USER_KEY: 'ac/user',
    OAUTH_PUBLIC_KEY: process.env.OAUTH_PUBLIC_KEY
  };
  
  export const API_ENDPOINT_PATH = config.API_ENDPOINT_PATH;
  export const LOCAL_STORAGE_ACCESS_TOKEN_KEY = config.LOCAL_STORAGE_ACCESS_TOKEN_KEY;
  export const LOCAL_STORAGE_USER_KEY = config.LOCAL_STORAGE_USER_KEY;
  export const OAUTH_PUBLIC_KEY = config.OAUTH_PUBLIC_KEY;
  export default config;
  