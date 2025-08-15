import { RouteProp, useFocusEffect, useNavigation, useRoute, } from "@react-navigation/native";
import { View, StyleSheet, DeviceEventEmitter } from "react-native";
import { RootStackParamList } from "../../constants/routes";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { JSX, useCallback, useEffect, useRef, useState } from "react";
import { AnimeApiService } from "../../data/anime_api_service";
import { VideoRef } from 'react-native-video';
import { RemoteControlKey } from "../../constants/remote_controller";
import { getBetterPoster } from "../../utils/get_better_poster";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Interface } from "./interface";
import { VideoPlayer } from "./video";
import { LoadingComponent } from "./loading";
import { ErrorComponent } from "./error";
import { AnimeEpisodesData } from "../../types/progress";
import { MenuElement } from '../../types/player';
import { SettingsData } from "../../types/components";

export type PlayerScreenRouteProp = RouteProp<RootStackParamList, 'Player'>;
export type PlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Player'>;

export function Player(): JSX.Element {
	const route = useRoute<PlayerScreenRouteProp>();
	const navigation = useNavigation<PlayerScreenNavigationProp>();
	const {
		anime,
		episodeIndex,
		seasonIndex,
		seasons,
		tmdbData,
		averageColor,
		ProgressDataAnime
	} = route.params;

	const apiService = AnimeApiService.getInstance();
	const [typeSource, setTypeSource] = useState<string>('');
	const [episodesState, setEpisodesState] = useState<AnimeEpisodesData | null>(null);
	const [seasonIndexState, setSeasonIndexState] = useState<number>(seasonIndex);
	const [episodeIndexState, setEpisodeIndexState] = useState<number>(episodeIndex);
	const [sourceIndex, setSourceIndex] = useState<number>(0);

	const [urlVideo, setUrlVideo] = useState<string | null>();
	const [resolution, setResolution] = useState<string | null>(null);
	const [aspectRatio, setAspectRatio] = useState<string | null>(null);

	const [duration, setDuration] = useState<number>(0);
	const [progress, setProgress] = useState<number>(0);
	const [initPercent, setInitPercent] = useState<number>(ProgressDataAnime?.find ? ProgressDataAnime!.progress! : 0);
	const [timeToResume, setTimeToResume] = useState<number>(0);

	const [isPaused, setIsPaused] = useState<boolean>(false);
	const [ended, setEnded] = useState<boolean>(false);
	const [videoReady, setVideoReady] = useState<boolean>(false);
	const [onLoading, setOnLoading] = useState<boolean>(false);

	const [showInterface, setShowInterface] = useState<boolean>(true);
	const [showSourceSelector, setShowSourceSelector] = useState<boolean>(false);
	const [indexMenu, setIndexMenu] = useState<number>(0);

	const [error, setError] = useState<string | null>(null);
	const [timeSkip, setTimeSkip] = useState<number>(15);

	const videoRef = useRef<VideoRef>(null);
	const timeoutInterfaceRef = useRef<NodeJS.Timeout | null>(null);
	const currentProgressRef = useRef<number>(0);
	const isManualSeekingRef = useRef<boolean>(false);


	useEffect(() => {
		const loadSettings = async () => {
			try {
				const savedSettings = await AsyncStorage.getItem('app_settings');
				if (savedSettings) {
					const settings: SettingsData = JSON.parse(savedSettings);
					setTimeSkip(settings.timeSkip);
				}
			} catch (error) {
				console.error('Error loading settings in player:', error);
			}
		};
		loadSettings();
	}, []);

	useEffect(() => {
		if (episodesState == null) {
			if (timeoutInterfaceRef.current) {
				clearTimeout(timeoutInterfaceRef.current);
			}
			setShowInterface(true);
		} else if (!error) {
			if (timeoutInterfaceRef.current) {
				clearTimeout(timeoutInterfaceRef.current);
			}
			setShowInterface(true);
			timeoutInterfaceRef.current = setTimeout(() => {
				setIsPaused(value => {
					if (!value) {
						setShowInterface(false);
						setIndexMenu(0);
					}
					return value;
				});
			}, 3000);
		}
	}, [episodesState, error]);


	useEffect(() => {
		const interval = setInterval(() => {
			if (!videoRef.current || isPaused || error || episodesState == null) {
				return;
			}
			setProgress((value) => {
				const percent = (value * 100) / duration;

				apiService.updateProgress(
					anime.id,
					episodeIndexState + 1,
					episodesState.number,
					seasonIndexState,
					seasons,
					percent,
					getBetterPoster(tmdbData) ?? '',
				).catch((err) => {
					console.error('Error updating progress:', err);
				});
				return value;
			});
		}, 10000);

		return () => clearInterval(interval);
	}, [duration, tmdbData, isPaused, error, videoRef, episodesState]);

	useEffect(() => {
		apiService.fetchAnimeEpisodes(anime.url.toString(), seasons[seasonIndexState].url.toString())
			.then((episodes) => {
				setEpisodesState(episodes);
			})
			.catch((error) => {
				setError(error.message);
			});
	}, [seasonIndexState]);


	useEffect(() => {
		if (ended) {
			setIsPaused(true);
			setShowInterface(true);
		}
	}, [ended]);

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
		setAspectRatio(null);
		setResolution(null);
		setError(null);
		setOnLoading(true);
		setUrlVideo(null);
		setVideoReady(false);
		setEnded(false);

		if (episodesState === null) {
			return;
		}

		if (!episodesState.episodes || (Array.isArray(episodesState.episodes) && episodesState.episodes.length === 0)) {
			setError("Aucune source disponible pour cet épisode.");
			return;
		}

		const episodesArray = Object.values(episodesState.episodes);
		if (episodeIndexState >= episodesArray.length || episodeIndexState < 0) {
			setError(`Épisode ${episodeIndexState + 1} introuvable.`);
			return;
		}

		const currentEpisode = episodesArray[episodeIndexState];
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
	}, [episodeIndexState, episodesState, sourceIndex]);

	useFocusEffect(
		useCallback(() => {
			const handleRemoteControlEvent = (keyCode: number) => {
				if (!error) {
					if (timeoutInterfaceRef.current) {
						clearTimeout(timeoutInterfaceRef.current);
					}
					setShowInterface(true);
					timeoutInterfaceRef.current = setTimeout(() => {
						setIsPaused(value => {
							if (!value) {
								setShowInterface(false);
								setIndexMenu(0);
							}
							return value;
						});
					}, 3000);
				}

				if (!isPaused && !error) {
					if (keyCode === RemoteControlKey.DPAD_CONFIRM) {
						setIsPaused(true);
					} else if (keyCode === RemoteControlKey.DPAD_LEFT || keyCode === RemoteControlKey.DPAD_RIGHT) {
						isManualSeekingRef.current = true;
						let newTime ;

						if (keyCode === RemoteControlKey.DPAD_RIGHT) {
							newTime = Math.max(currentProgressRef.current + timeSkip, 0);
						} else {
							newTime = Math.min(currentProgressRef.current - timeSkip, duration);
						}
						currentProgressRef.current = newTime;
						setProgress(newTime);

						if (videoRef.current) {
							videoRef.current.seek(newTime);
						}

						setTimeout(() => {
							isManualSeekingRef.current = false;
						}, 1000);
					} else if (keyCode === RemoteControlKey.BACK) {
						navigation.goBack();
					}
				} else if (isPaused && !showSourceSelector) {
					if (keyCode === RemoteControlKey.DPAD_LEFT) {
						setIndexMenu(Math.max(0, indexMenu - 1));
					} else if (keyCode === RemoteControlKey.DPAD_RIGHT) {
						setIndexMenu(Math.min(4, indexMenu + 1));
					} else if (keyCode === RemoteControlKey.DPAD_CONFIRM) {
						if (indexMenu === MenuElement.RESUME && !error) {
							if (ended) {
								setProgress(0);
								currentProgressRef.current = 0;
								setEnded(false);
								videoRef.current?.seek(0);
								setIsPaused(false);
								return;
							}
							setShowInterface(true);
							timeoutInterfaceRef.current = setTimeout(() => {
								setShowInterface(false);
							}, 3000);
						} else if (indexMenu === MenuElement.CHANGE_SOURCE) {
							setIndexMenu(0);
							setShowSourceSelector(true);
						} else if (indexMenu === MenuElement.PREVIOUS_EPISODE) {
							if (episodeIndexState == 0) {
								return;
							}
							setEpisodeIndexState((prev) => Math.max(prev - 1, 0));
							setSourceIndex(0);
							setProgress(0);
							setIndexMenu(0);
						} else if (indexMenu === MenuElement.NEXT_EPISODE) {
							if (!episodesState || episodeIndexState >= Object.keys(episodesState!.episodes).length - 1) {
								return;
							}
							setEpisodeIndexState((prev) => Math.min(prev + 1, episodesState && episodesState.episodes ? Object.keys(episodesState.episodes).length - 1 : prev));
							setSourceIndex(0);
							setProgress(0);
							setIndexMenu(0);
						} else if (indexMenu === MenuElement.EXIT) {
							navigation.goBack();
							return;
						}
						setIsPaused(indexMenu === MenuElement.CHANGE_SOURCE);
					} else if (keyCode === RemoteControlKey.BACK) {
						setIsPaused(false);
					}
				} else if (isPaused && showSourceSelector) {
					if (keyCode === RemoteControlKey.DPAD_LEFT) {
						setIndexMenu(Math.max(0, indexMenu - 1));
					} else if (keyCode === RemoteControlKey.DPAD_RIGHT) {
						setIndexMenu(Math.min(Object.keys(episodesState?.episodes[`eps${episodeIndexState + 1}`] || []).length, indexMenu + 1));
					} else if (keyCode === RemoteControlKey.DPAD_CONFIRM) {
						if (indexMenu === Object.keys(episodesState?.episodes[`eps${episodeIndexState + 1}`] || []).length) {
							setIndexMenu(0);
						} else {
							setIsPaused(false);
							setTimeToResume(progress);
							setSourceIndex(indexMenu);
						}
						setShowSourceSelector(false);
					} else if (keyCode === RemoteControlKey.BACK) {
						setShowSourceSelector(false);
						setIndexMenu(0);
					}
				}
			};

			const subscription = DeviceEventEmitter.addListener('keyPressed', handleRemoteControlEvent);
			return () => subscription.remove();
		}, [videoRef, isPaused, episodesState, showSourceSelector, indexMenu, episodeIndexState, error, duration, ended])
	);

	return (
		<View style={styles.container}>
			<ErrorComponent error={error} />
			<VideoPlayer
				urlVideo={urlVideo}
				typeSource={typeSource}
				isPaused={isPaused}
				setError={setError}
				videoRef={videoRef}
				setVideoReady={setVideoReady}
				setDuration={setDuration}
				setOnLoading={setOnLoading}
				setProgress={setProgress}
				currentProgressRef={currentProgressRef}
				isManualSeekingRef={isManualSeekingRef}
				setAspectRatio={setAspectRatio}
				setResolution={setResolution}
				initPercent={initPercent}
				timeToResume={timeToResume}
				setInitPercent={setInitPercent}
				setTimeToResume={setTimeToResume}
				error={error}
				setEnded={setEnded}
				videoReady={videoReady}
			/>
			<LoadingComponent tmdbData={tmdbData} onLoading={onLoading} />
			<Interface
				showInterface={showInterface}
				isPaused={isPaused}
				anime={anime}
				averageColor={averageColor}
				seasons={seasons}
				seasonIndexState={seasonIndexState}
				episodeIndexState={episodeIndexState}
				sourceIndex={sourceIndex}
				episodesState={episodesState}
				resolution={resolution}
				aspectRatio={aspectRatio}
				progress={progress}
				duration={duration}
				ended={ended}
				error={error}
				indexMenu={indexMenu}
				showSourceSelector={showSourceSelector}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000000',
	},
});