import { RouteProp, useFocusEffect, useNavigation, useRoute, } from "@react-navigation/native";
import { Text, View, StyleSheet, DeviceEventEmitter, Animated, ActivityIndicator, Image } from "react-native";
import { RootStackParamList } from "../../constants/routes";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { JSX, useCallback, useEffect, useRef, useState } from "react";
import { AnimeApiService } from "../../data/anime_api_service";
import Video, { VideoRef } from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RemoteControlKey } from "../../constants/remote_controller";
import { getBetterLogo } from "../../utils/get_better_logo";

export type PlayerScreenRouteProp = RouteProp<RootStackParamList, 'Player'>;
export type PlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Player'>;

const timeSkip: number = 15;

export function Player(): JSX.Element {
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

	const [typeSource, setTypeSource] = useState<string>('');
	const [episodesState, setEpisodesState] = useState(episodes);
	const [episodeIndexState, setEpisodeIndexState] = useState<number>(episodeIndex);
	const [sourceIndex, setSourceIndex] = useState<number>(0);
	const [seasonIndexState, setSeasonIndexState] = useState<number>(seasonIndex);
	const [urlVideo, setUrlVideo] = useState<string | null>();

	const [error, setError] = useState<string | null>(null);

	const [showInterface, setShowInterface] = useState<boolean>(true);
	const [showSourceSelector, setShowSourceSelector] = useState<boolean>(false);
	const [duration, setDuration] = useState<number>(0);
	const [progress, setProgress] = useState<number>(0);
	const [isPaused, setIsPaused] = useState<boolean>(false);
	const [onLoading, setOnLoading] = useState<boolean>(false);
	const animatedHeight = useRef(new Animated.Value(50)).current;
	const videoRef = useRef<VideoRef>(null);

	const timeoutInterfaceRef = useRef<NodeJS.Timeout | null>(null);

	useFocusEffect(
		useCallback(() => {
			const handleRemoteControlEvent = (keyCode: number) => {
				if (!error) {
					if (timeoutInterfaceRef.current) {
						clearTimeout(timeoutInterfaceRef.current);
					}
					setShowInterface(true);
					timeoutInterfaceRef.current = setTimeout(() => {
						setShowInterface(false);
					}, 3000);
				}
				if (keyCode === RemoteControlKey.DPAD_LEFT) {
					if (!isPaused) {
						setProgress((prev) => {
							const time: number = Math.max(prev - timeSkip, 0);
							if (videoRef.current) {
								videoRef.current.seek(time);
							}
							return time;
						});
					}
				} else if (keyCode === RemoteControlKey.DPAD_RIGHT) {
					if (!isPaused) {
						setProgress((prev) => {
							const time: number = Math.min(prev + timeSkip, duration);
							if (videoRef.current) {
								videoRef.current.seek(time);
							}
							return time;
						});
					}
				} else if (keyCode === RemoteControlKey.DPAD_CONFIRM) {
					if (!error) {
						setIsPaused((prev) => {
							if (prev) {
								setShowInterface(true);
								timeoutInterfaceRef.current = setTimeout(() => {
									setShowInterface(false);
								}, 3000);
							} else {
								if (timeoutInterfaceRef.current) {
									clearTimeout(timeoutInterfaceRef.current);
								}
							}
							return !prev;
						});
					}
				} else if (keyCode === RemoteControlKey.BACK) {
					navigation.goBack();
				}
			};
			const subscription = DeviceEventEmitter.addListener('keyPressed', handleRemoteControlEvent);
			return () => subscription.remove();
		}, [videoRef, isPaused])
	);

	useEffect(() => {
		if (error) {
			if (timeoutInterfaceRef.current) {
				clearTimeout(timeoutInterfaceRef.current);
			}
			setShowInterface(true);
			setIsPaused(true);
			setOnLoading(false);
			return;
		}
	}, [error]);

	useEffect(() => {
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
				<View style={styles.errorContainer}>
					<Icon name="error-outline" size={48} color="#E50914" />
					<Text style={styles.errorText}>{error}</Text>
				</View>
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
					onBuffer={(stateData) => {
						if (error)
							return;
						setOnLoading(stateData.isBuffering);
					}}
				/>
			)}
			{onLoading && (
				<View style={styles.loadingContainer}>
					{tmdbData && (() => {
						const betterLogo = getBetterLogo(tmdbData);
						if (!betterLogo) {
							return null;
						}
						return (
							<Image
								source={{ uri: betterLogo }}
								style={styles.logoImage}
								resizeMode="contain"
							/>
						);
					})()}
					<ActivityIndicator size={450} color="#FFFFFF" />
				</View>
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
								!showSourceSelector ? (
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
												style={[
													styles.buttonExtendedInterface,
													{ backgroundColor: `rgba(${averageColor.map(c => Math.floor(c * 0.7)).join(',')}, 0.9)` },
													error && index == 0 ? { opacity: 0.4 } : { opacity: 1 }
												]}
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
								<View style={[styles.progressFill, { width: duration > 0 ? `${progress * 100 / duration}%` : '0%' }]} />
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
		zIndex: 5,
	},
	completeMenuContainer: {
		borderRadius: 10,
		paddingHorizontal: 10,
		flexDirection: 'column',
		zIndex: 5,
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

	loadingContainer: {
		position: 'absolute',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 2,
	},
	logoImage: {
		position: 'absolute',
		maxWidth: 400,
		maxHeight: 400,
		width: '100%',
		height: '100%',
		top: '50%',
		left: '50%',
		transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 2,
	},

	errorContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 4,
		backgroundColor: 'rgba(0, 0, 0, 0.8)',
	},
	errorText: {
		color: 'white',
		fontSize: 20,
		marginTop: 16,
		textAlign: 'center',
		paddingHorizontal: 24,
	},
});