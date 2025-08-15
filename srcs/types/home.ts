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

export interface AnimeCardProps {
    item: ProgressData | AnimeItem;
    onPress?: (anime: AnimeItem) => void;
    list?: boolean;
}

export interface ResumePhoneProps {
	progressList: ProgressData[];
	onSelectAnime?: (anime: AnimeItem) => void;
}

export interface HomeMobileProps {
	animeList: AnimeItem[];
	allProgress: ProgressData[];
	isLoading: boolean;
	isGlobalLoading: boolean;
	searchValue: string;
	setSearchValue: (s: string) => void;
	onRefresh: () => Promise<void>;
	onSelectAnime: (anime: AnimeItem) => void;
	onOpenSettings: () => void;
	onOpenChooseUser: () => void;
	onOpenResume: () => void;
};
