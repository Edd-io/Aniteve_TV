import { AnimeEpisodesData, ProgressDataAnime, Season, TMDBData } from "../data/anime_api_service";
import AnimeItem from "../models/anime_item";

export type RootStackParamList = {
  Home: undefined;
  Anime: { anime: AnimeItem };
  Player: {
    anime: AnimeItem,
    episodeIndex: number;
    seasonIndex: number;
    seasons: Season[];
    tmdbData?: TMDBData | null;
    averageColor: number[];
    ProgressDataAnime?: ProgressDataAnime | null;
  };
  Login: undefined;
  ChooseUser: undefined;
};