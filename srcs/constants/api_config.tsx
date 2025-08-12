export const API_CONFIG = {
  ENDPOINTS: {
    GET_ALL_ANIME: "/api/get_all_anime",
    GET_ANIME_SEASON: "/api/get_anime_season",
    GET_PROGRESS: "/api/get_progress",
    GET_AVERAGE_COLOR: "/api/get_average_color",
    UPDATE_PROGRESS: "/api/update_progress",
    TMDB_PROXY: "/api/tmdb",
    GET_ALL_PROGRESS: "/api/get_all_progress",
    CHECK_TOKEN: "/api/check_token",
    LOGIN: "/api/login",
    GET_USERS: "/api/get_users",
    GET_ANIME_EPISODES: "/api/get_anime_episodes",
  },
  TMDB: {
    BASE_URL_IMG: "https://image.tmdb.org/t/p/original/",
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
