import { AnimeEpisodesData, TMDBData } from "../data/anime_api_service";
import AnimeItem from "../models/anime_item";

export type RootStackParamList = {
  Home: undefined;
  Anime: { anime: AnimeItem };
  Player: {
    anime: AnimeItem,
    episodeIndex: number;
    seasonIndex: number;
    episodes: AnimeEpisodesData;
    seasons: String[];
    tmdbData?: TMDBData | null;
    averageColor: number[];
  };
};