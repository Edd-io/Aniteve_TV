import AnimeItem from "../models/anime_item";

export type RootStackParamList = {
  Home: undefined;
  Anime: { anime: AnimeItem };
};