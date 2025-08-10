import React, { useState, useEffect, FC, useCallback } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
	DeviceEventEmitter,
	SafeAreaView,
	ImageBackground
} from 'react-native';
import { RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../../constants/routes';
import { RemoteControlKey } from '../../constants/remote_controller';
import { AnimeApiService, AnimeEpisodesData, ProgressDataAnime, TMDBData } from '../../data/anime_api_service';
import { RightPanel } from './right_panel';
import { LeftPanel } from './left_panel';
import { getBetterLogo } from '../../utils/get_better_logo';
import { SeasonSelector } from '../components/season_selector';
import { InfoPopup } from '../components/info_popup';
import { Colors } from "../../constants/colors";

export type AnimeScreenRouteProp = RouteProp<RootStackParamList, 'Anime'>;
export type AnimeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Anime'>;

export enum Side {
	LEFT = 0,
	RIGHT = 1
}

enum LeftMenuButtons {
	START = 0,
	SEASONS = 1,
	INFO = 2,
}

export const Anime: FC = () => {
	const route = useRoute<AnimeScreenRouteProp>();
	const navigation = useNavigation<AnimeScreenNavigationProp>();
	const { anime } = route.params;

	const apiService = new AnimeApiService();

	const [loading, setLoading] = useState(true);
	const [loadingEpisodes, setLoadingEpisodes] = useState(false);

	const [animeSeasonData, setAnimeSeasonData] = useState<String[]>([]);
	const [episodesData, setEpisodesData] = useState<AnimeEpisodesData | null>(null);
	const [ProgressDataAnime, setProgressDataAnime] = useState<ProgressDataAnime | null>(null);
	const [tmdbData, setTmdbData] = useState<TMDBData | null>(null);

	const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);

	const [backdropImage, setBackdropImage] = useState<string | null>(null);
	const [logo, setLogo] = useState<string | null>(null);
	const [averageColor, setAverageColor] = useState<number[]>([0, 0, 0]);

	const [focusMenu, setFocusMenu] = useState<Side>(Side.LEFT);
	const [indexLeftMenu, setIndexLeftMenu] = useState<LeftMenuButtons>(LeftMenuButtons.START);
	const [showSeasonSelector, setShowSeasonSelector] = useState(false);
	const [showInfoPopup, setShowInfoPopup] = useState(false);

	const loadInitialData = async () => {
		try {
			setLoading(true);

			let seasonsData: String[] = await apiService.fetchAnimeSeasons(anime.url.toString());

			if (anime.genres.includes('Vf')) {
				let vfSeasons: String[] = [];
				seasonsData.forEach((season, index) => {
					vfSeasons.push(season.replace('vostfr', 'vf'));
				});
				seasonsData = [...seasonsData, ...vfSeasons];
			}
			setAnimeSeasonData(seasonsData);

			const progress = await apiService.fetchProgress(anime.id);
			setProgressDataAnime(progress);

			const tmdbInfo = await apiService.fetchTMDBData(anime.title.toString(), anime.genres.includes('Film'));
			setTmdbData(tmdbInfo);

			const averageColor = await apiService.fetchAverageColor({ imgUrl: getBetterBackdrop(tmdbData) ?? anime.img.toString() });
			setAverageColor(averageColor);

			if (seasonsData.length > 0) {
				const firstSeason = seasonsData[0];
				setSelectedSeasonIndex(0);
				await loadEpisodes(firstSeason.toString());
			}

		} catch (error) {
			console.error('Error loading anime data:', error);
		} finally {
			setLoading(false);
		}
	};

	useFocusEffect(
		useCallback(() => {
			loadInitialData();
		}, [anime])
	);

	useEffect(() => {
		setBackdropImage(getBetterBackdrop(tmdbData));
		setLogo(getBetterLogo(tmdbData));
	}, [tmdbData]);

	const loadEpisodes = async (season: string) => {
		try {
			setLoadingEpisodes(true);
			const episodes = await apiService.fetchAnimeEpisodes(anime.url.toString(), season);
			setEpisodesData(episodes);
		} catch (error) {
			console.error('Error loading episodes:', error);
			setEpisodesData(null);
		} finally {
			setLoadingEpisodes(false);
		}
	};

	const handleSeasonSelect = async (season: string) => {
		console.log(`Selected season: ${season}`);
		const seasonIndex = animeSeasonData.findIndex(s => s === season);
		if (seasonIndex === selectedSeasonIndex) {
			return;
		}
		if (seasonIndex !== -1) {
			setSelectedSeasonIndex(seasonIndex);
			await loadEpisodes(season);
		}
	};

	useFocusEffect(
		useCallback(() => {
			const handleRemoteControlEvent = (keyCode: number) => {
				if (focusMenu === Side.RIGHT || showSeasonSelector || showInfoPopup) {
					return;
				}
				else if (keyCode === RemoteControlKey.DPAD_LEFT) {
					setIndexLeftMenu((prevIndex) => Math.max(prevIndex - 1, 0));
				}
				else if (keyCode === RemoteControlKey.DPAD_RIGHT) {
					setIndexLeftMenu((prevIndex) => {
						if (prevIndex === LeftMenuButtons.INFO) {
							setFocusMenu(Side.RIGHT);
						} else {
							return prevIndex + 1;
						}
						return prevIndex;
					});
				}
				else if (keyCode === RemoteControlKey.DPAD_CONFIRM) {
					if (indexLeftMenu === LeftMenuButtons.START) {
						if (!episodesData) {
							return;
						}
						navigation.navigate('Player', {
							anime: anime,
							episodeIndex: ProgressDataAnime?.find ? ProgressDataAnime!.episode! - 1 : 0,
							seasonIndex: ProgressDataAnime?.find ? animeSeasonData.indexOf(ProgressDataAnime!.season!) : 0,
							episodes: episodesData!,
							seasons: animeSeasonData,
							tmdbData: tmdbData,
							averageColor: averageColor,
							ProgressDataAnime: ProgressDataAnime
						});
					} else if (indexLeftMenu === LeftMenuButtons.SEASONS) {
						setShowSeasonSelector(true);
					} else if (indexLeftMenu === LeftMenuButtons.INFO) {
						setShowInfoPopup(true);
					}
				} else if (keyCode === RemoteControlKey.BACK) {
					navigation.goBack();
				}
			};

			const subscription = DeviceEventEmitter.addListener('keyPressed', handleRemoteControlEvent);
			return () => subscription.remove();
		}, [
			focusMenu,
			indexLeftMenu,
			episodesData,
			ProgressDataAnime,
			animeSeasonData,
			tmdbData,
			averageColor,
			anime,
			navigation,
			showSeasonSelector,
			showInfoPopup
		])
	);

	if (loading) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={Colors.primary} />
				<Text style={styles.loadingText}>Chargement...</Text>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<ImageBackground
				source={{
					uri: backdropImage ?? String(anime.img)
				}}
				style={styles.bgStyleFull}
				imageStyle={styles.bgStyleImage}
				resizeMode="cover"
			>
				<View style={styles.mainContent}>

					<LeftPanel
						anime={anime}
						logo={logo}
						tmdbData={tmdbData}
						ProgressDataAnime={ProgressDataAnime}
						averageColor={averageColor}
						indexLeftMenu={indexLeftMenu}
						focusMenu={focusMenu}
						haveEpisodes={!!episodesData}
					/>

					<RightPanel
						episodesData={episodesData}
						loadingEpisodes={loadingEpisodes}
						selectedSeason={animeSeasonData[selectedSeasonIndex] as string || null}
						averageColor={averageColor}
						focusMenu={focusMenu}
						setFocusMenu={setFocusMenu}
						isMovie={animeSeasonData[selectedSeasonIndex]?.includes('film')}
						animeSeasonData={animeSeasonData}
						selectedSeasonIndex={selectedSeasonIndex}
						tmdbData={tmdbData}
					/>
				</View>
			</ImageBackground>
			<SeasonSelector
				visible={showSeasonSelector}
				seasons={animeSeasonData.map(s => s.toString())}
				currentSeason={animeSeasonData[selectedSeasonIndex]?.toString() || ''}
				averageColor={averageColor}
				closePopup={() => setShowSeasonSelector(false)}
				onSeasonSelect={handleSeasonSelect}
			/>
			<InfoPopup
				visible={showInfoPopup}
				anime={anime}
				tmdbData={tmdbData}
				averageColor={averageColor}
				closePopup={() => setShowInfoPopup(false)}
			/>
		</SafeAreaView>
	);
};

function getBetterBackdrop(tmdbData: TMDBData | null): string | null {
	let better = null;
	let quality = { width: 0, height: 0 };
	if (!tmdbData?.backdrops || tmdbData.backdrops.length === 0) {
		return null;
	}
	for (const backdrop of tmdbData.backdrops) {
		if (backdrop.file_path) {
			if (backdrop.width > quality.width || backdrop.height > quality.height) {
				quality = { width: backdrop.width, height: backdrop.height };
				better = backdrop;
			}
		}
	}
	if (!better) {
		return null;
	}
	return 'https://image.tmdb.org/t/p/original/' + better.file_path;
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#000000',
	},
	loadingText: {
		color: '#ffffff',
		fontSize: 16,
		marginTop: 10,
		textAlign: 'center',
	},
	loadingOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.8)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1000,
	},
	mainContent: {
		flex: 1,
		flexDirection: 'row',
	},
	bgStyleFull: {
		justifyContent: 'center',
		flex: 1,
		position: 'relative',
	},
	bgStyleImage: {
		opacity: 0.6,
	},
});

