import { RouteProp, useFocusEffect, useNavigation, useRoute, } from "@react-navigation/native";
import { Text, View, StyleSheet, DeviceEventEmitter, Animated, ActivityIndicator, Image } from "react-native";
import { RootStackParamList } from "../../constants/routes";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { JSX, use, useCallback, useEffect, useRef, useState } from "react";
import { AnimeApiService, AnimeEpisodesData, Season, TMDBData } from "../../data/anime_api_service";
import Video, { SelectedVideoTrackType, VideoRef } from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RemoteControlKey } from "../../constants/remote_controller";
import { getBetterLogo } from "../../utils/get_better_logo";
import { getBetterPoster } from "../../utils/get_better_poster";
import { Colors } from "../../constants/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsData } from "../settings/settings_selector";
import { getAspectRatio, getResolutionFromHeight } from "../../utils/video";
import { Interface } from "./interface";
import { states } from "../../states/player";

export type PlayerScreenRouteProp = RouteProp<RootStackParamList, 'Player'>;
export type PlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Player'>;

enum MenuElement {
	RESUME = 0,
	CHANGE_SOURCE = 1,
	PREVIOUS_EPISODE = 2,
	NEXT_EPISODE = 3,
	EXIT = 4,
}

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

	const apiService = new AnimeApiService();
	const {
		typeSource, setTypeSource,
		episodesState, setEpisodesState,
		episodeIndexState, setEpisodeIndexState,
		sourceIndex, setSourceIndex,
		seasonIndexState, setSeasonIndexState,
		urlVideo, setUrlVideo,
		error, setError,
		showInterface, setShowInterface,
		showSourceSelector, setShowSourceSelector,
		duration, setDuration,
		progress, setProgress,
		isPaused, setIsPaused,
		onLoading, setOnLoading,
		initPercent, setInitPercent,
		timeToResume, setTimeToResume,
		videoReady, setVideoReady,
		videoRef,
		timeoutInterfaceRef,
		currentProgressRef,
		isManualSeekingRef,
		resolution, setResolution,
		aspectRatio, setAspectRatio,
		ended, setEnded,
		indexMenu, setIndexMenu,
		timeSkip, setTimeSkip,
	} = states({
		episodeIndex,
		seasonIndex,
		ProgressDataAnime
	});


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
		apiService.fetchAnimeEpisodes(anime.url.toString(), seasons[seasonIndexState].url.toString())
			.then((episodes) => {
				setEpisodesState(episodes);
			})
			.catch((error) => {
				setError(error.message);
			});
	}, [seasonIndexState]);

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
				if (keyCode === RemoteControlKey.DPAD_LEFT) {
					if (!isPaused) {
						isManualSeekingRef.current = true;
						const newTime = Math.max(currentProgressRef.current - timeSkip, 0);
						currentProgressRef.current = newTime;
						setProgress(newTime);

						if (videoRef.current) {
							videoRef.current.seek(newTime);
						}

						setTimeout(() => {
							isManualSeekingRef.current = false;
						}, 1000);
					} else {
						setIndexMenu((prev) => {
							return prev > 0 ? prev - 1 : 0;
						});
					}
				} else if (keyCode === RemoteControlKey.DPAD_RIGHT) {
					if (!isPaused) {
						isManualSeekingRef.current = true;
						const newTime = Math.min(currentProgressRef.current + timeSkip, duration);
						currentProgressRef.current = newTime;
						setProgress(newTime);

						if (videoRef.current) {
							videoRef.current.seek(newTime);
						}

						setTimeout(() => {
							isManualSeekingRef.current = false;
						}, 1000);
					} else {
						setIndexMenu((prev) => {
							return (prev < (showSourceSelector ? (Object.keys(episodesState?.episodes[`eps${episodeIndexState + 1}`] || []).length) : 4)) ? prev + 1 : prev;
						});
					}
				} else if (keyCode === RemoteControlKey.DPAD_CONFIRM) {
					if (isPaused) {
						if (!showSourceSelector) {
							if (indexMenu === MenuElement.RESUME && !error) {
								if (ended) {
									setProgress(0);
									setEnded(false);
									return;
								}
								setIsPaused(false);
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
								setIndexMenu(0);
								setIsPaused(false);
							} else if (indexMenu === MenuElement.NEXT_EPISODE) {
								if (!episodesState || episodeIndexState >= Object.keys(episodesState!.episodes).length - 1) {
									return;
								}
								setEpisodeIndexState((prev) => Math.min(prev + 1, episodesState && episodesState.episodes ? Object.keys(episodesState.episodes).length - 1 : prev));
								setSourceIndex(0);
								setIndexMenu(0);
								setIsPaused(false);
							} else if (indexMenu === MenuElement.EXIT) {
								navigation.goBack();
								return;
							}
						} else {
							if (indexMenu === Object.keys(episodesState?.episodes[`eps${episodeIndexState + 1}`] || []).length) {
								setIndexMenu(0);
								setShowSourceSelector(false);
							} else {
								setTimeToResume(progress);
								setSourceIndex(indexMenu);
								setShowSourceSelector(false);
							}
						}
					} else {
						setIsPaused(true);
					}
				} else if (keyCode === RemoteControlKey.BACK) {
					if (!isPaused || error || ended) {
						navigation.goBack();
					} else if (showSourceSelector) {
						setShowSourceSelector(false);
						setIndexMenu(0);
					} else {
						if (!error) {
							setIsPaused(false);
							setIndexMenu(0);
						}
					}
				}
			};
			const subscription = DeviceEventEmitter.addListener('keyPressed', handleRemoteControlEvent);
			return () => subscription.remove();
		}, [videoRef, isPaused, episodesState, showSourceSelector, indexMenu, episodeIndexState, error, duration, ended])
	);

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


	return (
		<View style={styles.container}>
			<ErrorComponent error={error} />
			{urlVideo && !error && (
				<Video
					style={[
						styles.video,
						{ opacity: isPaused ? 0.5 : 1 },
						!videoReady && { opacity: 0 }
					]}
					source={{ uri: urlVideo, type: typeSource }}
					resizeMode="contain"
					selectedVideoTrack={{
						type: SelectedVideoTrackType.RESOLUTION,
						value: 1080,
					}}
					ref={videoRef}
					controls={false}
					paused={isPaused}
					onError={(e) => {
						setError("Erreur de lecture vidéo.");
					}}
					onLoad={(data) => {
						setVideoReady(true);
						setDuration(data.duration);
						setOnLoading(false);

						if (initPercent > 0) {
							const seekTime = (initPercent * data.duration) / 100;
							currentProgressRef.current = seekTime;
							setProgress(seekTime);
							videoRef.current?.seek(seekTime);
							setInitPercent(0);
						} else {
							const seekTime = timeToResume > 0 ? timeToResume : 0;
							currentProgressRef.current = seekTime;
							setProgress(seekTime);
							videoRef.current?.seek(seekTime);
						}
						setTimeToResume(0);

						if (data.naturalSize && data.naturalSize.width && data.naturalSize.height) {
							const { width, height } = data.naturalSize;
							setAspectRatio(getAspectRatio(width, height));
							setResolution(getResolutionFromHeight(height));
						}
					}}
					onProgress={(data) => {
						if (!isManualSeekingRef.current) {
							currentProgressRef.current = data.currentTime;
							setProgress(data.currentTime);
						}
					}}
					onBuffer={(stateData) => {
						if (error)
							return;
						setOnLoading(stateData.isBuffering);
					}}
					onEnd={() => {
						console.log('Video ended');
						setEnded(true);
					}}
				/>
			)}
			<LoadingComponent tmdbData={tmdbData} onLoading={onLoading} />
			<Interface
				showInterface={showInterface}
				isPaused={isPaused}
				anime={anime}
				averageColor={averageColor}
				seasons={seasons}
				seasonIndexState={seasonIndexState}
				episodeIndex={episodeIndex}
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

const ErrorComponent = ({ error }: { error: string | null }): JSX.Element | null => {
	if (error == null) {
		return null;
	}
	return (
		<View style={styles.errorContainer}>
			<Icon name="error-outline" size={48} color={Colors.primary} />
			<Text style={styles.errorText}>{error}</Text>
		</View>
	);
};

const LoadingComponent = ({ onLoading, tmdbData }: { onLoading: boolean; tmdbData?: TMDBData | null }): JSX.Element | null => {
	if (!onLoading) {
		return null;
	}
	return (
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
	);
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