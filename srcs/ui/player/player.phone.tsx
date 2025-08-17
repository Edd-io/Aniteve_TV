import React, { useEffect, useCallback, useState, useRef, Dispatch, SetStateAction } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Dimensions,
	StatusBar,
	ActivityIndicator,
	Image,
} from 'react-native';
import { SafeAreaView, Pressable } from 'react-native';
import { VideoRef } from 'react-native-video';
import Slider from '@react-native-community/slider';
import RNGoogleCast, { CastButton, useRemoteMediaClient, useCastSession } from 'react-native-google-cast';
import { PermissionsAndroid, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AnimeItem from '../../models/anime_item';
import { Season } from '../../types/user';
import { TMDBData } from '../../types/tmdb';
import { ProgressDataAnime, AnimeEpisodesData } from '../../types/progress';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { getBetterLogo } from '../../utils/get_better_logo';
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
		}
	};

	const togglePlay = () => {
		showControlsOnce();
		setIsPaused(!isPaused);
	};

	const goNext = () => {
		showControlsOnce();
		if (typeof episodesCount === 'number' && episodeIndex < episodesCount - 1) {
			setEpisodeIndex(episodeIndex + 1);
			setProgress(0);
			setInitPercent(0);
			setIsPaused(false);
		}
	};

	const canPrev = episodeIndex > 0;
	const canNext = typeof episodesCount === 'number' && episodeIndex < (episodesCount - 1);

	const [isPortrait, setIsPortrait] = useState<boolean>(() => {
		const { width, height } = Dimensions.get('window');
		return height >= width;
	});

	// controls auto-hide
	const [controlsVisible, setControlsVisible] = useState<boolean>(true);
	const hideTimeoutRef = useRef<number | null>(null);

	const clearHideTimeout = () => {
		if (hideTimeoutRef.current) {
			clearTimeout(hideTimeoutRef.current as unknown as number);
			hideTimeoutRef.current = null;
		}
	};

	const scheduleHide = (delay = 3000) => {
		clearHideTimeout();
		hideTimeoutRef.current = setTimeout(() => {
			setControlsVisible(false);
			hideTimeoutRef.current = null;
		}, delay) as unknown as number;
	};

	const showControlsOnce = (keep = false) => {
		setControlsVisible(true);
		if (!keep) scheduleHide(3000);
	};

	useEffect(() => {
		scheduleHide(3000);
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
						{tmdbData && (() => {
							const betterLogo = getBetterLogo(tmdbData);
							if (betterLogo) {
								return (
									<Image source={{ uri: betterLogo }} style={styles.logoImagePhone} resizeMode="contain" />
								);
							}
							return null;
						})()}
						<ActivityIndicator size={250} color="#ffffff" />
					</View>
				)}
				{!controlsVisible && (
					<Pressable
						style={styles.fullscreenTouchable}
						onPress={() => {
						showControlsOnce();
					}}
					/>
				)}
				<LinearGradient
					colors={["rgba(0,0,0,0.95)", "transparent"]}
					style={[styles.topGradient, { opacity: controlsVisible ? 1 : 0 }]}
					pointerEvents={controlsVisible ? 'auto' : 'none'}
				/>

				<LinearGradient
					colors={["transparent", "rgba(0,0,0,0.95)"]}
					style={[styles.bottomGradient, { opacity: controlsVisible ? 1 : 0 }]}
					pointerEvents={controlsVisible ? 'auto' : 'none'}
				/>

				<SafeAreaView style={{ flex: 1, zIndex: 3 }}>
					<View
						style={[
							styles.topContainer,
							{ paddingTop: isPortrait ? (StatusBar.currentHeight || 10) : 10 },
							{ opacity: controlsVisible ? 1 : 0, pointerEvents: controlsVisible ? 'auto' : 'none' },
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
								<Text style={styles.animeEpisode}>
									{seasons[seasonIndexState]?.name} - Episode {episodeIndexState + 1}
								</Text>
							</View>
						</View>

						<Icon
							name='cast'
							size={30}
							color="#fff"
							style={{ marginRight: 16 }}
							onPress={() => {
							}}
						/>
					</View>

					<View style={[
						styles.centerControls,
						{ opacity: controlsVisible ? 1 : 0, pointerEvents: controlsVisible ? 'auto' : 'none' },
					]}>
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
					</View>

					<View style={[
						styles.bottomContainer,
						{ opacity: controlsVisible ? 1 : 0, pointerEvents: controlsVisible ? 'auto' : 'none' },
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
	},
	animeTitle: {
		color: '#fff',
		flex: 1,
		fontSize: 18,
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
		zIndex: 12,
	},
	logoImagePhone: {
		position: 'absolute',
		width: 200,
		height: 200,
		zIndex: 13,
		opacity: 0.9,
	},
});
