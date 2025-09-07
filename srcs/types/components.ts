import { VideoRef } from "react-native-video";
import { AnimeEpisodesData } from "./progress";
import { ProgressData } from "./progress";
import { Season } from "./user";
import { Dispatch, SetStateAction } from "react";
import { GestureResponderEvent, TextInput } from "react-native";
import { SelectedPart } from "./home";
import AnimeItem from "../models/anime_item";

export interface InterfaceProps {
	showInterface: boolean;
	isPaused: boolean;
	anime: AnimeItem;
	averageColor: number[];
	seasons: { name: string }[];
	seasonIndexState: number;
	episodeIndexState: number;
	sourceIndex: number;
	episodesState: AnimeEpisodesData | null;
	resolution?: string | null;
	aspectRatio?: string | null;
	progress: number;
	duration: number;
	ended: boolean;
	error: string | null;
	indexMenu: number;
	showSourceSelector: boolean;
}

export interface ListAnimeProps {
	selectedPart: SelectedPart;
	indexItem: number;
	animeList: AnimeItem[];
	setAnimeList: React.Dispatch<React.SetStateAction<AnimeItem[]>>;
	isLoading?: boolean;
	isSearchActive?: boolean;
	setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface SeasonSelectorProps {
	visible: boolean;
	seasons: Season[];
	currentSeason?: Season;
	averageColor: number[];
	closePopup: () => void;
	onSeasonSelect: (index: number) => void;
}

export interface TopBarProps {
	selectedPart: SelectedPart;
	index: number;
	searchInputRef: React.RefObject<TextInput | null>;
	setSearchValue: Dispatch<SetStateAction<string>>;
	setIsLoading: Dispatch<SetStateAction<boolean>>;
	searchValue: string;
}

export interface ResumeSelectorProps {
	visible: boolean;
	close: () => void;
	navigation: any;
	allProgress: ProgressData[];
}
export interface VideoPlayerProps {
	urlVideo: string | null | undefined;
	typeSource: string;
	isPaused: boolean;
	setError: (value: string | null) => void;
	videoRef: React.RefObject<VideoRef | null>;
	setVideoReady: (value: boolean) => void;
	setDuration: (value: number) => void;
	setOnLoading: (value: boolean) => void;
	setProgress: (value: number) => void;
	currentProgressRef: React.RefObject<number>;
	isManualSeekingRef: React.RefObject<boolean>;
	setAspectRatio: (value: string | null) => void;
	setResolution: (value: string | null) => void;
	initPercent: number;
	timeToResume: number;
	setInitPercent: (value: number) => void;
	setTimeToResume: (value: number) => void;
	error: string | null;
	setEnded: (value: boolean) => void;
	videoReady: boolean;
}

export interface SettingsData {
	primaryColor: string;
	timeSkip: number;
}

export interface SettingsSelectorProps {
	visible: boolean;
	close: () => void;
	settings: SettingsData;
	onSettingsChange: (settings: SettingsData) => void;
}

export enum SettingsIndex {
	PRIMARY_COLOR = 0,
	TIME_SKIP = 1,
	DELETE_CONNECTION = 2,
}

export interface TopBarPhoneProps {
	onResume?: () => void;
	onChooseUser?: () => void;
	onSettings?: () => void;
}

export interface TopBarButtonProps {
	icon: string;
	label?: string;
	onPress?: (e: GestureResponderEvent) => void;
	accessibilityLabel?: string;
	size?: number;
}

export interface SectionHeaderPhoneProps {
	title: string;
	onSeeAll?: () => void;
}