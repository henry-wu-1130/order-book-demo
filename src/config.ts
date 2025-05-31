const BASE_URL = 'wss://ws.btse.com/ws';

export const config = {
  ws: {
    baseUrl: import.meta.env.VITE_WS_BASE_URL || BASE_URL,
    paths: {
      futures: import.meta.env.VITE_WS_FUTURES_PATH || '/futures',
      ossFutures: import.meta.env.VITE_WS_OSS_FUTURES_PATH || '/oss/futures'
    }
  }
} as const;

export const getWsEndpoint = (path: keyof typeof config.ws.paths) => {
  return `${config.ws.baseUrl}${config.ws.paths[path]}`;
};
