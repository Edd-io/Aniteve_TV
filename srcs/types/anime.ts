import AnimeItem from "../models/anime_item";
import { TMDBData } from "./tmdb";
import { AnimeEpisodesData, ProgressDataAnime } from "./progress";
import { Season } from "./user";

export enum Side {
	LEFT = 0,
	RIGHT = 1
}

export enum LeftMenuButtons {
	START = 0,
	SEASONS = 1,
	INFO = 2,
}

export interface LeftPanelProps {
	anime: AnimeItem,
	logo: string | null;
	tmdbData: TMDBData | null;
	ProgressDataAnime: ProgressDataAnime | null;
	averageColor: number[];
	indexLeftMenu: number;
	focusMenu: Side;
	haveEpisodes?: boolean;
}

export interface RightPanelProps {
    episodesData: AnimeEpisodesData | null;
    loadingEpisodes: boolean;
    selectedSeason: Season | null;
    averageColor: number[];
    focusMenu: Side;
    setFocusMenu?: (side: Side) => void;
    isMovie: boolean;
    animeSeasonData: Season[];
    selectedSeasonIndex: number;
    tmdbData?: TMDBData | null;
}