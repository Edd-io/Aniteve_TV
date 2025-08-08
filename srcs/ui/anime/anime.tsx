import React, { useState, useEffect, use } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	Modal,
	DeviceEventEmitter,
	SafeAreaView,
	ScrollView,
	Image,
	ImageBackground
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../../constants/routes';
import { RemoteControlKey } from '../../constants/remote_controller';
import { AnimeApiService, AnimeEpisodesData, ProgressData, TMDBData } from '../../data/anime_api_service';
import { RightPanel } from './right_panel';

type AnimeScreenRouteProp = RouteProp<RootStackParamList, 'Anime'>;
type AnimeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Anime'>;

interface SelectedEpisode {
	name: string;
	urls: string[];
}


const EPISODES_PER_PAGE = 5;

export const Anime: React.FC = () => {
	const route = useRoute<AnimeScreenRouteProp>();
	const navigation = useNavigation<AnimeScreenNavigationProp>();
	const { anime } = route.params;

	const apiService = new AnimeApiService();

	const [loading, setLoading] = useState(true);
	const [loadingEpisodes, setLoadingEpisodes] = useState(false);
	const [animeSeasonData, setAnimeSeasonData] = useState<String[]>([]);
	const [episodesData, setEpisodesData] = useState<AnimeEpisodesData | null>(null);
	const [progressData, setProgressData] = useState<ProgressData | null>(null);
	const [tmdbData, setTmdbData] = useState<TMDBData | null>(null);
	const [showServerSelector, setShowServerSelector] = useState(false);
	const [selectedEpisode, setSelectedEpisode] = useState<SelectedEpisode | null>(null);
	const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
	const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
	const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [backdropImage, setBackdropImage] = useState<string | null>(null);

	const getCurrentPageEpisodes = () => {
		if (!episodesData?.episodes) return [];
		const episodes = Object.entries(episodesData.episodes);
		const startIndex = (currentPage - 1) * EPISODES_PER_PAGE;
		const endIndex = startIndex + EPISODES_PER_PAGE;
		return episodes.slice(startIndex, endIndex);
	};

	const getTotalPages = () => {
		if (!episodesData?.episodes) return 1;
		const totalEpisodes = Object.keys(episodesData.episodes).length;
		return Math.ceil(totalEpisodes / EPISODES_PER_PAGE);
	};

	useEffect(() => {
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


				const progress = await apiService.fetchProgress(parseInt(anime.url.toString()));
				setProgressData(progress);

				const tmdbInfo = await apiService.fetchTMDBData(anime.title.toString());
				setTmdbData(tmdbInfo);


				if (seasonsData.length > 0) {
					const firstSeason = seasonsData[0];
					setSelectedSeason(firstSeason.toString());
					setSelectedSeasonIndex(0);
					await loadEpisodes(firstSeason.toString());
				}

			} catch (error) {
				console.error('Error loading anime data:', error);
			} finally {
				setLoading(false);
			}
		};

		loadInitialData();
	}, [anime]);

	useEffect(() => {
		setBackdropImage(getBetterBackdrop(tmdbData));
	}, [tmdbData]);

	const loadEpisodes = async (season: string) => {
		try {
			setLoadingEpisodes(true);
			const episodes = await apiService.fetchAnimeEpisodes(anime.url.toString(), season);
			setEpisodesData(episodes);
			setCurrentPage(1);
			setSelectedEpisodeIndex(0);
		} catch (error) {
			console.error('Error loading episodes:', error);
			setEpisodesData(null);
		} finally {
			setLoadingEpisodes(false);
		}
	};


	const handleEpisodePress = (episodeName: string, episodeUrls: string[]) => {
		setSelectedEpisode({ name: episodeName, urls: episodeUrls });
		setShowServerSelector(true);
	};

	useEffect(() => {
		const handleRemoteControlEvent = (keyCode: number) => {

		};

		const subscription = DeviceEventEmitter.addListener('keyPressed', handleRemoteControlEvent);
		return () => subscription.remove();
	}, []);

	if (loading) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#e50914" />
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

					<View style={styles.leftPanel}>
					</View>

					<RightPanel
						getTotalPages={getTotalPages}
						currentPage={currentPage}
						episodesData={episodesData}
						loadingEpisodes={loadingEpisodes}
						getCurrentPageEpisodes={getCurrentPageEpisodes}
						handleEpisodePress={handleEpisodePress}
						setCurrentPage={setCurrentPage}
						setSelectedEpisodeIndex={setSelectedEpisodeIndex}
						selectedSeason={selectedSeason}
					/>
				</View>
			</ImageBackground>
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
	leftPanel: {
		flex: 2,
		position: 'relative',
	},
	rightPanel: {
		flex: 1,
		backgroundColor: 'rgba(20, 20, 20, 0.57)',
		borderLeftWidth: 1,
		borderLeftColor: 'rgba(255,255,255,0.1)',
		paddingHorizontal: 20,
		paddingVertical: 30,
	},
	episodeHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
		paddingBottom: 15,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255,255,255,0.1)',
	},
	episodeTitle: {
		color: '#ffffff',
		fontSize: 24,
		fontWeight: 'bold',
	},
	episodesInfo: {
		backgroundColor: 'rgba(255,255,255,0.1)',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 15,
	},
	focusedPagination: {
		backgroundColor: '#E50914',
	},
	episodeText: {
		color: '#ffffff',
		fontSize: 12,
		fontWeight: '600',
	},
	episodesLoading: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	episodesLoadingText: {
		color: '#ffffff',
		fontSize: 14,
		marginTop: 10,
	},
	episodeList: {
		flex: 1,
	},
	episodeItem: {
		marginBottom: 15,
		borderRadius: 8,
		backgroundColor: 'rgba(255,255,255,0.05)',
		overflow: 'hidden',
	},
	selectedEpisodeItem: {
		backgroundColor: 'rgba(229, 9, 20, 0.46)',
	},
	episodeContent: {
		flexDirection: 'row',
		padding: 12,
		alignItems: 'center',
	},
	episodeImagePlaceholder: {
		width: 80,
		height: 45,
		backgroundColor: 'rgba(255,255,255,0.15)',
		borderRadius: 6,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	currentEpisodeImagePlaceholder: {
		backgroundColor: '#E50914',
	},
	episodeNumber: {
		color: '#ffffff',
		fontSize: 14,
		fontWeight: 'bold',
		textShadowColor: 'rgba(0,0,0,0.8)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 2,
	},
	episodeDetails: {
		flex: 1,
		justifyContent: 'center',
	},
	episodeName: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4,
		textShadowColor: 'rgba(0,0,0,0.8)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 2,
	},
	episodeCurrentIndicator: {
		color: '#E50914',
		fontSize: 12,
		fontWeight: 'bold',
		marginTop: 2,
	},
	noEpisodesText: {
		color: 'rgba(255,255,255,0.6)',
		fontSize: 16,
		textAlign: 'center',
		marginTop: 50,
	},
	paginationControls: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 20,
		paddingTop: 15,
		borderTopWidth: 1,
		borderTopColor: 'rgba(255,255,255,0.1)',
	},
	pageButton: {
		backgroundColor: 'rgba(255,255,255,0.1)',
		paddingHorizontal: 15,
		paddingVertical: 10,
		borderRadius: 6,
		minWidth: 40,
		alignItems: 'center',
	},
	focusedPageButton: {
		backgroundColor: '#E50914',
	},
	disabledPageButton: {
		backgroundColor: 'rgba(255,255,255,0.05)',
		opacity: 0.5,
	},
	pageButtonText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	pageIndicator: {
		color: '#ffffff',
		fontSize: 14,
		fontWeight: '600',
	},
	bgStyleFull: {
		justifyContent: 'center',
		flex: 1,
		position: 'relative',
	},
	bgStyleImage: {
		opacity: 0.7,
	},
});
