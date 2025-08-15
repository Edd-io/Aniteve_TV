import AnimeItem from "../models/anime_item";
import { ProgressDataAnime, ProgressData } from "../types/progress";
import { TMDBData } from "../types/tmdb";
import { Season } from "../types/user";

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
  Resume: { progressList: ProgressData[] };
  Login: undefined;
  ChooseUser: undefined;
};