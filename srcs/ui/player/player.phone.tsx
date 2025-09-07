import React, { useEffect, useState, useRef, Dispatch, SetStateAction } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Dimensions,
	StatusBar,
	ActivityIndicator,
} from 'react-native';
import { SafeAreaView, Pressable } from 'react-native';
import { VideoRef } from 'react-native-video';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AnimeItem from '../../models/anime_item';
import { Season } from '../../types/user';
import { TMDBData } from '../../types/tmdb';
import { ProgressDataAnime, AnimeEpisodesData } from '../../types/progress';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { convertSecondsToTime } from '../../utils/video_utils';
import { VideoPlayer } from './video';

interface PlayerPhoneProps {
	anime: AnimeItem;
	episodeIndex: number;
	seasonIndex: number;
	seasons: Season[];
	tmdbData: TMDBData | null | undefined;
	averageColor: number[];
	nbSources: number;
	ProgressDataAnime: ProgressDataAnime | null | undefined;
	typeSource: string;
	episodesState: AnimeEpisodesData | null;
	seasonIndexState: number;
	episodeIndexState: number;
	sourceIndex: number;
	urlVideo: string | null | undefined;
	resolution: string | null;
	aspectRatio: string | null;
	duration: number;
	progress: number;
	initPercent: number;
	timeToResume: number;
	isPaused: boolean;
	ended: boolean;
	videoReady: boolean;
	onLoading: boolean;
	showInterface: boolean;
	showSourceSelector: boolean;
	indexMenu: number;
	isLoading: boolean;
	error: string | null;
	timeSkip: number;
	videoRef: React.RefObject<VideoRef | null>;
	currentProgressRef: React.RefObject<number>;
	isManualSeekingRef: React.RefObject<boolean>;

	setEpisodeIndex: (index: number) => void;
	setSeasonIndex: (index: number) => void;
	setTypeSource: (type: string) => void;
	setEpisodesState: (episodes: AnimeEpisodesData | null) => void;
	setSeasonIndexState: (index: number) => void;
	setEpisodeIndexState: (index: number) => void;
	setSourceIndex: Dispatch<SetStateAction<number>>;
	setUrlVideo: (url: string | null | undefined) => void;
	setResolution: (resolution: string | null) => void;
	setAspectRatio: (ratio: string | null) => void;
	setDuration: (duration: number) => void;
	setProgress: (progress: number) => void;
	setInitPercent: (percent: number) => void;
	setTimeToResume: (time: number) => void;
	setIsPaused: (paused: boolean) => void;
	setEnded: (ended: boolean) => void;
	setVideoReady: (ready: boolean) => void;
	setOnLoading: (loading: boolean) => void;
	setShowInterface: (show: boolean) => void;
	setShowSourceSelector: (show: boolean) => void;
	setIndexMenu: (index: number) => void;
	setError: (error: string | null) => void;
	setTimeSkip: (skip: number) => void;
}

export function PlayerPhone(props: PlayerPhoneProps): React.JSX.Element {
	const {
		anime,
		episodeIndex,
		seasonIndex,
		seasons,
		tmdbData,
		averageColor,
		nbSources,
		ProgressDataAnime,
		typeSource,
		episodesState,
		seasonIndexState,
		episodeIndexState,
		sourceIndex,
		urlVideo,
		resolution,
		aspectRatio,
		duration,
		progress,
		initPercent,
		timeToResume,
		isPaused,
		ended,
		videoReady,
		onLoading,
		showInterface,
		showSourceSelector,
		indexMenu,
		isLoading,
		error,
		timeSkip,
		videoRef,
		currentProgressRef,
		isManualSeekingRef,
		setEpisodeIndex,
		setSeasonIndex,
		setTypeSource,
		setEpisodesState,
		setSeasonIndexState,
		setEpisodeIndexState,
		setSourceIndex,
		setUrlVideo,
		setResolution,
		setAspectRatio,
		setDuration,
		setProgress,
		setInitPercent,
		setTimeToResume,
		setIsPaused,
		setEnded,
		setVideoReady,
		setOnLoading,
		setShowInterface,
		setShowSourceSelector,
		setIndexMenu,
		setError,
		setTimeSkip,
	} = props;

	const navigation = useNavigation();

	useEffect(() => {
		SystemNavigationBar.stickyImmersive();
	}, []);

	const episodesCount: number | undefined = (() => {
		if (!episodesState) return undefined;
		const anyState: any = episodesState as any;
		if (typeof anyState.number === 'number') return anyState.number;
		if (Array.isArray(anyState)) return anyState.length;
		if (anyState.episodes) {
			const eps = anyState.episodes;
			if (Array.isArray(eps)) return eps.length;
			if (typeof eps === 'object') {
				return Object.values(eps).reduce((sum: number, v: any) => {
					if (Array.isArray(v)) return sum + v.length;
					return sum;
				}, 0);
			}
		}
		return undefined;
	})();

	const goPrev = () => {
		showControlsOnce();
		if (episodeIndex > 0) {
			setEpisodeIndex(episodeIndex - 1);
			setProgress(0);
			setInitPercent(0);
			setIsPaused(false);
			isPausedRef.current = false;
		}
	};

	const handleRetry = () => {
		setError(null);
		setVideoReady(false);
		setProgress(0);
		setInitPercent(0);
		setTimeToResume(0);
		setIsPaused(false);
		isPausedRef.current = false;
		if (videoRef?.current && typeof videoRef.current.seek === 'function') {
			try { videoRef.current.seek(0); } catch (e) { /* ignore */ }
		}
		showControlsOnce(true);
	};

	const togglePlay = () => {
		showControlsOnce(true);
		const newPaused = !isPaused;
		setIsPaused(newPaused);
		isPausedRef.current = newPaused;
	};

	const goNext = () => {
		showControlsOnce();
		if (typeof episodesCount === 'number' && episodeIndex < episodesCount - 1) {
			setEpisodeIndex(episodeIndex + 1);
			setProgress(0);
			setInitPercent(0);
			setIsPaused(false);
			isPausedRef.current = false;
		}
	};

	const canPrev = episodeIndex > 0;
	const canNext = typeof episodesCount === 'number' && episodeIndex < (episodesCount - 1);

	const [isPortrait, setIsPortrait] = useState<boolean>(() => {
		const { width, height } = Dimensions.get('window');
		return height >= width;
	});

	const [controlsVisible, setControlsVisible] = useState<boolean>(true);
	const hideTimeoutRef = useRef<number | null>(null);

	const isPausedRef = useRef<boolean>(isPaused);
	useEffect(() => {
		isPausedRef.current = isPaused;
		if (isPaused) {
			clearHideTimeout();
			setControlsVisible(true);
		} else {
			scheduleHide(3000);
		}
	}, [isPaused]);

	useEffect(() => {
		if (showInterface || isPausedRef.current) {
			setControlsVisible(true);
			if (showInterface && !isPausedRef.current) {
				scheduleHide(3000);
			}
		} else {
			clearHideTimeout();
			setControlsVisible(false);
		}
	}, [showInterface]);

	const clearHideTimeout = () => {
		if (hideTimeoutRef.current) {
			clearTimeout(hideTimeoutRef.current as unknown as number);
			hideTimeoutRef.current = null;
		}
	};

	const scheduleHide = (delay = 3000) => {
		clearHideTimeout();
		if (isPausedRef.current) return;
		hideTimeoutRef.current = setTimeout(() => {
			setControlsVisible(false);
			hideTimeoutRef.current = null;
		}, delay) as unknown as number;
	};

	const showControlsOnce = (keep = false) => {
		setControlsVisible(true);
		if (!keep && !isPausedRef.current) scheduleHide(3000);
	};

	useEffect(() => {
		if (!isPausedRef.current) scheduleHide(3000);
		return () => clearHideTimeout();
	}, []);

	useEffect(() => {
		const onChange = ({ window }: { window: { width: number; height: number } }) => {
			setIsPortrait(window.height >= window.width);
		};

		const subscription: any = (Dimensions as any).addEventListener
			? (Dimensions as any).addEventListener('change', onChange)
			: null;

		if (!subscription) {
			Dimensions.addEventListener('change', onChange);
		}

		return () => {
			if (subscription && typeof subscription.remove === 'function') {
				subscription.remove();
			} else if ((Dimensions as any).removeEventListener) {
				(Dimensions as any).removeEventListener('change', onChange);
			}
		};
	}, []);

	const uiVisible = controlsVisible || isPaused;

	return (
		<View style={styles.container}>

			<VideoPlayer
				urlVideo={urlVideo}
				typeSource={typeSource}
				isPaused={isPaused}
				setError={setError}
				setDuration={setDuration}
				setProgress={setProgress}
				setInitPercent={setInitPercent}
				setTimeToResume={setTimeToResume}
				setEnded={setEnded}
				setVideoReady={setVideoReady}
				setOnLoading={setOnLoading}
				videoRef={videoRef}
				currentProgressRef={currentProgressRef}
				isManualSeekingRef={isManualSeekingRef}
				setAspectRatio={setAspectRatio}
				setResolution={setResolution}
				initPercent={initPercent}
				timeToResume={timeToResume}
				error={error}
				videoReady={videoReady}
			/>
			<View style={styles.controls}>
				{isLoading && (
					<View style={styles.loadingContainer} pointerEvents="auto">
						<ActivityIndicator size={'large'} color="#ffffff" />
					</View>
				)}
				{!uiVisible && (
					<Pressable
						style={styles.fullscreenTouchable}
						onPress={() => {
							showControlsOnce();
						}}
					/>
				)}
				<LinearGradient
					colors={["rgba(0,0,0,0.95)", "transparent"]}
					style={[styles.topGradient, { opacity: uiVisible ? 1 : 0 }]}
					pointerEvents={uiVisible ? 'auto' : 'none'}
				/>

				<LinearGradient
					colors={["transparent", "rgba(0,0,0,0.95)"]}
					style={[styles.bottomGradient, { opacity: uiVisible ? 1 : 0 }]}
					pointerEvents={uiVisible ? 'auto' : 'none'}
				/>

				<SafeAreaView style={{ flex: 1, zIndex: 3 }}>
					<View
						style={[
							styles.topContainer,
							{ paddingTop: isPortrait ? (StatusBar.currentHeight || 10) : 10 },
							{ opacity: uiVisible ? 1 : 0, pointerEvents: uiVisible ? 'auto' : 'none' },
						]}
					>
						<View style={styles.topLeftContainer}>
							<Icon
								name="arrow-back"
								size={30}
								color="#fff"
								onPress={() => {
									navigation.goBack();
								}}
							/>
							<View style={styles.animeTitleContainer}>
								<Text
									style={styles.animeTitle}
									numberOfLines={1}
									ellipsizeMode="tail"
								>
									{anime.title}
								</Text>
								<Text style={styles.animeEpisode} numberOfLines={1} ellipsizeMode="tail">
									{seasons[seasonIndexState]?.name} - Episode {episodeIndexState + 1}
								</Text>
							</View>
						</View>
					</View>

					<View style={[
						styles.centerControls,
						{ opacity: uiVisible ? 1 : 0, pointerEvents: uiVisible ? 'auto' : 'none' },
					]}>
						{error ? (
							<View style={styles.errorContainer} pointerEvents="auto">
								<Text style={styles.errorTitle}>Erreur</Text>
								<Text style={styles.errorMessage} numberOfLines={3}>{error}</Text>
								<TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
									<Text style={styles.retryText}>Réessayer</Text>
								</TouchableOpacity>
							</View>
						) : (
							<>
								<TouchableOpacity
									style={[styles.controlButton, !canPrev && styles.controlDisabled]}
									onPress={goPrev}
									disabled={!canPrev}
								>
									<Icon name="skip-previous" size={30} color={canPrev ? '#fff' : 'rgba(255,255,255,0.28)'} />
								</TouchableOpacity>

								<TouchableOpacity style={[styles.controlButton, styles.mainControl]} onPress={togglePlay}>
									<Icon name={isPaused ? 'play-arrow' : 'pause'} size={36} color="#fff" />
								</TouchableOpacity>

								<TouchableOpacity
									style={[styles.controlButton, !canNext && styles.controlDisabled]}
									onPress={goNext}
									disabled={!canNext}
								>
									<Icon name="skip-next" size={30} color={canNext ? '#fff' : 'rgba(255,255,255,0.28)'} />
								</TouchableOpacity>
							</>
						)}
					</View>

					<View style={[
						styles.bottomContainer,
						{ opacity: uiVisible ? 1 : 0, pointerEvents: uiVisible ? 'auto' : 'none' },
					]}>
						<View style={styles.progressBar}>
							<View style={styles.sliderBackground}>
								<Slider
									style={styles.sliderStyle}
									value={progress}
									minimumValue={0}
									maximumValue={duration}
									onValueChange={(value) => {
										if (videoRef.current) {
											videoRef.current.seek(value);
										}
										setProgress(value);
										currentProgressRef.current = value;
										isManualSeekingRef.current = true;
									}}
									onSlidingComplete={(value) => {
										isManualSeekingRef.current = false;
									}}
									minimumTrackTintColor={averageColor ? `rgba(${averageColor[0]}, ${averageColor[1]}, ${averageColor[2]}, 1)` : '#fff'}
									maximumTrackTintColor="rgba(255, 255, 255, 0.66)"
									thumbTintColor={averageColor ? `rgba(${averageColor[0]}, ${averageColor[1]}, ${averageColor[2]}, 1)` : '#fff'}
									minimumTrackImage={undefined}
								/>
							</View>
						</View>
						<View style={styles.bottomProgressContainer}>
							<View style={styles.buttonsContainer}>
								<TouchableOpacity
									style={styles.buttonContainer}
									onPress={() => {
										setSourceIndex((prev) => (prev + 1) % nbSources);
									}}
								>
									<Icon
										name="link"
										size={30}
										color="#fff"
										onPress={() => {
											if (videoRef.current) {
												videoRef.current.seek(0);
											}
										}}
									/>
									<Text style={styles.bottomProgressText}>Source ({sourceIndex + 1}/{nbSources})</Text>
								</TouchableOpacity>
							</View>
							<Text style={styles.time}>{convertSecondsToTime(currentProgressRef.current)} / {convertSecondsToTime(duration)}</Text>
						</View>
					</View>
				</SafeAreaView>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
	},
	controls: {
		position: 'absolute',
		height: '100%',
		width: '100%',
		zIndex: 1,
	},
	topContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 24,
		paddingTop: StatusBar.currentHeight || 10,
	},
	topLeftContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	animeTitleContainer: {
		flexDirection: 'column',
		includeFontPadding: false,
		marginBottom: 2,
		marginLeft: 16,
		flex: 1,
		minWidth: 0,
	},
	animeTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
	},
	animeEpisode: {
		color: '#bababaff',
		fontSize: 14,
		includeFontPadding: false,
	},
	bottomContainer: {
		flexDirection: 'column',
		justifyContent: 'space-between',
		paddingHorizontal: 24,
		marginBottom: 16,
		width: '100%',
		height: 70,
		marginTop: 'auto',
	},
	progressBar: {
		height: 6,
		width: '100%',
		borderRadius: 2,
		marginTop: 8,
	},
	bottomProgressContainer: {
		width: '100%',
		flexDirection: 'row',
		paddingHorizontal: 24,
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	bottomProgressText: {
		color: '#bababaff',
		marginLeft: 8,
		fontSize: 14,
	},
	sliderBackground: {
		paddingHorizontal: 8,
		paddingVertical: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	sliderStyle: {
		height: 36,
		width: '100%',
	},
	time: {
		color: '#ffffff',
		fontSize: 14,
	},
	topGradient: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: 140,
		zIndex: 2,
	},
	bottomGradient: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		height: 140,
		zIndex: 2,
	},
	buttonsContainer: {
		flexDirection: 'row',
	},
	buttonContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 16,
		includeFontPadding: false
	},
	centerControls: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		zIndex: 4,
	},
	controlButton: {
		padding: 12,
		marginHorizontal: 8,
		borderRadius: 24,
		backgroundColor: 'rgba(255,255,255,0.04)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	controlDisabled: {
		opacity: 0.46,
		backgroundColor: 'rgba(255,255,255,0.02)',
	},
	mainControl: {
		backgroundColor: 'rgba(255,255,255,0.12)',
		width: 68,
		height: 68,
		borderRadius: 34,
	},
	fullscreenTouchable: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		zIndex: 10,
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
	logoImagePhone: {
		position: 'absolute',
		width: 200,
		height: 200,
		zIndex: 13,
		opacity: 0.9,
	},
	errorContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
		width: '100%',
		zIndex: 5,
	},
	errorTitle: {
		color: '#fff',
		fontSize: 18,
		marginBottom: 8,
		fontWeight: '700',
	},
	errorMessage: {
		color: '#ffdddd',
		fontSize: 14,
		textAlign: 'center',
		marginBottom: 12,
	},
	retryButton: {
		backgroundColor: 'rgba(255,255,255,0.12)',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
	},
	retryText: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '600',
	},
});
