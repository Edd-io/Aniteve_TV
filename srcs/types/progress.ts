import AnimeItem from "../models/anime_item";

export interface AnimeEpisodesData {
	episodes: Record<string, string[]>;
	number: number;
}

export interface ProgressDataAnime {
	episode?: number;
	find: boolean;
	progress?: number;
	season?: string;
	status?: number;
	completed?: number;
	season_name: string | null;
	lang: string | null;
}

export enum ProgressStatus {
	IN_PROGRESS = 0,
	UP_TO_DATE = 1,
	NEW_EPISODE = 2,
	NEW_SEASON = 3,
}

export interface ProgressData {
	anime: AnimeItem;
	completed: number;
	episode: number;
	poster: string;
	progress: ProgressStatus;
	season: string;
	find: boolean;
	season_name: string | null;
	lang: string | null;
}
