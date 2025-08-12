import AnimeItem from "../models/anime_item";
import { ProgressData } from "./progress";

export enum SelectedPart {
	TOPBAR = -1,
	BANNER = 0,
	ANIME_LIST = 1,
}

export interface FeaturedAnime {
	anime: AnimeItem;
	progress: ProgressData | null;
}
