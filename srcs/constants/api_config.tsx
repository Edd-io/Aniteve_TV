import Secrets from "./secrets";

export const API_CONFIG = {
  BASE_URL: Secrets.API_URL,
  ENDPOINTS: {
    GET_ALL_ANIME: "/api/get_all_anime",
    GET_ANIME_SEASON: "/api/get_anime_season",
    GET_PROGRESS: "/api/get_progress",
    GET_AVERAGE_COLOR: "/api/get_average_color",
    UPDATE_PROGRESS: "/api/update_progress",
    TMDB_PROXY: "/api/tmdb"
  },
  TMDB: {
    BASE_IMAGE_URL: "https://image.tmdb.org/t/p/w1280",
    POSTER_BASE_URL: "https://image.tmdb.org/t/p/w500",
  }
};

export interface LocalData {
  addr: string;
  token: string;
}

export const createHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  'Authorization': token || '',
});
