const config = {
  API_ENDPOINT_PATH: "/api",
  LOCAL_STORAGE_ACCESS_TOKEN_KEY: "ac/access_token",
  LOCAL_STORAGE_USER_KEY: "ac/user",
  OAUTH_PUBLIC_KEY: process.env.OAUTH_PUBLIC_KEY
};

export const API_ENDPOINT_PATH = config.API_ENDPOINT_PATH;
export const LOCAL_STORAGE_ACCESS_TOKEN_KEY =
  config.LOCAL_STORAGE_ACCESS_TOKEN_KEY;
export const LOCAL_STORAGE_USER_KEY = config.LOCAL_STORAGE_USER_KEY;
export const OAUTH_PUBLIC_KEY = config.OAUTH_PUBLIC_KEY;
export const authApiUrl = process.env.AUTH_URL;
export const directoryUrl = process.env.DIRECTORY_URL;
export const oauthPublicKey = process.env.OAUTH_PUBLIC_KEY;
export const demo = process.env.DEMO === "demo";

export default config;
