import { RouteProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Text, View, StyleSheet, DeviceEventEmitter, Animated } from "react-native";
import { RootStackParamList } from "../../constants/routes";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect } from "react";
import { AnimeApiService } from "../../data/anime_api_service";
import Video, { VideoRef } from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AnimeItem from "../../models/anime_item";
import { RemoteControlKey } from "../../constants/remote_controller";

export type PlayerScreenRouteProp = RouteProp<RootStackParamList, 'Player'>;
export type PlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Player'>;

export function Player(): React.JSX.Element {
	const route = useRoute<PlayerScreenRouteProp>();
	const navigation = useNavigation<PlayerScreenNavigationProp>();
	const {
		anime,
		episodeIndex,
		seasonIndex,
		episodes,
		seasons,
		tmdbData,
		averageColor
	} = route.params;

	const apiService = new AnimeApiService();

	const [typeSource, setTypeSource] = React.useState<string>('');
	const [episodesState, setEpisodesState] = React.useState(episodes);
	const [episodeIndexState, setEpisodeIndexState] = React.useState<number>(episodeIndex);
	const [sourceIndex, setSourceIndex] = React.useState<number>(0);
	const [seasonIndexState, setSeasonIndexState] = React.useState<number>(seasonIndex);
	const [urlVideo, setUrlVideo] = React.useState<string | null>();

	const [error, setError] = React.useState<string | null>(null);

	const [showInterface, setShowInterface] = React.useState<boolean>(true);
	const [showSourceSelector, setShowSourceSelector] = React.useState<boolean>(true);
	const [duration, setDuration] = React.useState<number>(0);
	const [progress, setProgress] = React.useState<number>(0);
	const [isPaused, setIsPaused] = React.useState<boolean>(true);
	const animatedHeight = React.useRef(new Animated.Value(50)).current;
	const videoRef = React.useRef<VideoRef>(null);

	console.log([0]);

	useFocusEffect(
		React.useCallback(() => {
			const handleRemoteControlEvent = (keyCode: number) => {
				if (keyCode === RemoteControlKey.DPAD_CONFIRM) {
					setIsPaused((prev) => !prev);
				}
			};
			const subscription = DeviceEventEmitter.addListener('keyPressed', handleRemoteControlEvent);
			return () => subscription.remove();
		}, [])
	);

	React.useEffect(() => {
		Animated.timing(animatedHeight, {
			toValue: isPaused ? 100 : 0,
			duration: 250,
			useNativeDriver: false,
		}).start();
	}, [isPaused]);

	useEffect(() => {
		if (!episodes || !episodes.episodes || (Array.isArray(episodes.episodes) && episodes.episodes.length === 0)) {
			setError("Aucune source disponible pour cet épisode.");
			return;
		}

		const episodesArray = Object.values(episodes.episodes);
		if (episodeIndex >= episodesArray.length || episodeIndex < 0) {
			setError(`Épisode ${episodeIndex + 1} introuvable.`);
			return;
		}

		const currentEpisode = episodesArray[episodeIndex];
		if (!currentEpisode || !Array.isArray(currentEpisode) || currentEpisode.length === 0) {
			setError("Aucune source disponible pour cet épisode.");
			return;
		}

		if (sourceIndex >= currentEpisode.length || sourceIndex < 0) {
			setError("Source vidéo introuvable.");
			return;
		}

		const videoSource = currentEpisode[sourceIndex];
		if (!videoSource) {
			setError("Source vidéo introuvable.");
			return;
		}

		apiService.fetchVideoSource(videoSource)
			.then((src) => {
				try {
					if (!src) {
						setError("Impossible de récupérer la source vidéo.");
						return;
					}
					if (src.includes('.mp4'))
						setTypeSource('video/mp4');
					else if (src.includes('.m3u8'))
						setTypeSource('m3u8');
					else
						setTypeSource('mpd');
					setUrlVideo(src);
					setError(null);
				}
				catch (error) {
					setError("Erreur lors de la récupération de la source vidéo.");
				}
			})
			.catch((error) => {
				setError("Erreur réseau lors de la récupération de la source vidéo.");
			});
	}, [episodeIndex, episodes, sourceIndex]);


	return (
		<View style={styles.container}>
			{error && (
				<Text style={styles.error}>{error}</Text>
			)}
			{urlVideo && !error && (
				<Video
					style={[styles.video, { opacity: isPaused ? 0.5 : 1 }]}
					source={{ uri: urlVideo, type: typeSource }}
					resizeMode="contain"
					ref={videoRef}
					controls={false}
					paused={isPaused}
					onError={(e) => {
						setError("Erreur de lecture vidéo.");
					}}
					onLoad={(data) => {
						setDuration(data.duration);
					}}
					onProgress={(data) => {
						setProgress(data.currentTime);
					}}
				/>
			)}
			{(showInterface || isPaused) && (
				<View style={styles.interface}>
					<View style={styles.topContainer}>
						<View style={[styles.titleContainer, { backgroundColor: `rgba(${averageColor.join(',')}, 0.9)` }]}>
							<Text
								style={[styles.title, styles.textShadow]}
								numberOfLines={1}
								ellipsizeMode="tail"
							>{anime.title}</Text>
						</View>
						<View style={[styles.episodeNumberContainer, { backgroundColor: `rgba(${averageColor.join(',')}, 0.9)` }]}>
							<Text
								style={[styles.episodeNumber, styles.textShadow]}
								numberOfLines={1}
								ellipsizeMode="tail"
							>{getSeasonAndEpisodeTitle(seasons[seasonIndex], episodeIndex)}</Text>
						</View>
					</View>

					<View style={{ flex: 1 }} />

					<Animated.View style={[styles.completeMenuContainer, { backgroundColor: `rgba(${averageColor.join(',')}, 0.85)` }]}>
						<Animated.View style={{ height: animatedHeight, overflow: 'hidden', width: '100%' }}>
							{isPaused && (
								showSourceSelector ? (
									<View style={{ flex: 1, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-around' }}>
										{[
											['play-arrow', 'Reprendre'],
											['source', 'Changer de Source'],
											['skip-previous', 'Épisode précédent'],
											['skip-next', 'Épisode suivant'],
											['exit-to-app', 'Retour au menu']
										].map(([icon, label], index) => (
											<View
												key={`button-${index}`}
												style={[styles.buttonExtendedInterface, { backgroundColor: `rgba(${averageColor.map(c => Math.floor(c * 0.7)).join(',')}, 0.9)` }]}
											>
												<Icon name={icon} size={30} color="#FFFFFF" />
												<Text style={[styles.title, styles.textShadow, { textAlign: "center" }]}>{label}</Text>
											</View>
										))}
									</View>
								) : (
									<View style={{ flex: 1, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-around' }}>
										{Array.isArray(episodesState.episodes[`eps${episodeIndexState + 1}`]) &&
											episodesState.episodes[`eps${episodeIndexState + 1}`].map((element, index) => (
												<View
													key={`source-${index}`}
													style={[styles.buttonExtendedInterface, { backgroundColor: `rgba(${averageColor.map(c => Math.floor(c * 0.7)).join(',')}, 0.9)` }]}
												>
													<Text style={[styles.title, styles.textShadow, { textAlign: "center" }]}>Source {index + 1}</Text>
												</View>
											))
										}
										<View style={[styles.buttonExtendedInterface, { backgroundColor: `rgba(${averageColor.map(c => Math.floor(c * 0.7)).join(',')}, 0.9)` }]}>
											<Icon name="exit-to-app" size={30} color="#FFFFFF" />
											<Text style={[styles.title, styles.textShadow, { textAlign: "center" }]}>Retour</Text>
										</View>
									</View>
								)
							)}
						</Animated.View>
						<View style={styles.bottomProgressContainer}>
							<Text style={[styles.bottomText, styles.textShadow]}>{convertSecondsToTime(progress)}</Text>
							<View style={styles.progressBar}>
								<View style={[styles.progressFill, { width: `${progress * 100 / duration}%` }]} />
							</View>
							<Text style={[styles.bottomText, styles.textShadow]}>{convertSecondsToTime(duration)}</Text>
						</View>
					</Animated.View>
				</View>
			)}
		</View>
	);
}

function getSeasonAndEpisodeTitle(season: String, episodeIndex: number): string {
	const isMovie = season.toLowerCase().includes('film');
	if (isMovie) {
		return `Film ${episodeIndex + 1}`;
	}
	season = season.split('/')[0];
	let indexFirstNb = season.search(/[0-9]/);
	let type: string = season.substring(0, indexFirstNb).trim();
	if (type.length > 0) {
		type = type[0].toUpperCase() + type.slice(1);
	}
	let number = season.substring(indexFirstNb);

	return `${type} ${number} - Episode ${episodeIndex + 1}`;
}

function convertSecondsToTime(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);
	return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000000',
	},
	error: {
		color: 'red',
		fontSize: 16,
		textAlign: 'center',
		margin: 20,
	},
	video: {
		flex: 1,
	},
	interface: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		top: 0,
		left: 0,
		padding: 15,
	},

	topContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	completeMenuContainer: {
		borderRadius: 10,
		paddingHorizontal: 10,
		flexDirection: 'column',
	},
	bottomProgressContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: 10,
		borderRadius: 10,
		alignItems: 'center',
	},
	extendedInterface: {
		height: 250,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 10,
	},

	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 10,
		maxWidth: '70%',
		padding: 5,
		overflow: 'hidden',
		alignSelf: 'flex-start'
	},
	title: {
		color: 'white',
		fontSize: 18,
		paddingHorizontal: 10,
	},
	episodeNumberContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 10,
		maxWidth: '30%',
		padding: 5,
		overflow: 'hidden',
		paddingHorizontal: 10,
		alignSelf: 'flex-end'
	},
	episodeNumber: {
		color: 'white',
		fontSize: 18,
	},

	progressBar: {
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderRadius: 5,
		flex: 1,
		height: 12,
		marginHorizontal: 10,
		alignSelf: 'center',
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: '#E50914',
		width: '50%',
		borderRadius: 5,
	},
	bottomText: {
		color: 'white',
		fontSize: 18,
		fontWeight: '500',
		textAlignVertical: 'center',
		includeFontPadding: false,
	},

	buttonExtendedInterface: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 10,
		backgroundColor: '#E50914',
		margin: 5,
	},

	textShadow: {
		textShadowColor: 'rgba(0,0,0,0.5)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 2,
	},

});