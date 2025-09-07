import { Dimensions, ImageBackground, StyleSheet, View, Animated, Image, TextInput, Text, ActivityIndicator, Platform, SafeAreaView, StatusBar } from "react-native";
import AnimeItem from "../../models/anime_item";
import TopBar from "../components/top_bar";
import BannerResume from "../components/banner_resume";
import LinearGradient from 'react-native-linear-gradient';
import React, { useEffect, useState, useRef, useCallback, RefObject, Dispatch, SetStateAction } from "react";
import { ListAnime } from "./list_anime";
import { DeviceEventEmitter } from 'react-native'
import { RemoteControlKey } from "../../constants/remote_controller";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "../../constants/routes";
import { ResumeSelector } from "./resume_selector";
import { AnimeApiService } from "../../data/anime_api_service";
import { Colors } from "../../constants/colors";
import { SettingsSelector } from "../settings/settings_selector";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressData, ProgressStatus } from "../../types/progress";
import { SelectedPart, FeaturedAnime } from "../../types/home";
import { SettingsData } from "../../types/components";
import { HomePhone } from "./home.phone";
import { ToastAndroid } from "react-native";

const { height } = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export function Home(): React.JSX.Element {
	const navigation = useNavigation<HomeScreenNavigationProp>();
	const apiService = AnimeApiService.getInstance();
	const [selectedPart, setSelectedPart] = useState<SelectedPart>(SelectedPart.BANNER);
	const [indexTopBar, setIndexTopBar] = useState<number>(0);
	const [indexItem, setIndexItem] = useState<number>(0);
	const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
	const [animeListFiltered, setAnimeListFiltered] = useState<AnimeItem[]>([]);
	const [featuredAnime, setFeaturedAnime] = useState<FeaturedAnime | null>(null);
	const [resumeVisible, setResumeVisible] = useState<boolean>(false);
	const [allProgress, setAllProgress] = useState<ProgressData[]>([]);
	const [searchValue, setSearchValue] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isProgressLoaded, setIsProgressLoaded] = useState<boolean>(false);
	const [isAnimeListLoaded, setIsAnimeListLoaded] = useState<boolean>(false);
	const [showLoadingOverlay, setShowLoadingOverlay] = useState<boolean>(true);
	const [animationCompleted, setAnimationCompleted] = useState<boolean>(false);
	const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
	const [settings, setSettings] = useState<SettingsData>({
		primaryColor: '#626262',
		timeSkip: 15
	});
	const searchInputRef = useRef<TextInput>(null);
	const loadingOpacity = useRef(new Animated.Value(1)).current;

	const isGlobalLoading = !isProgressLoaded || !isAnimeListLoaded;

	useEffect(() => {
		const loadSettings = async () => {
			try {
				const savedSettings = await AsyncStorage.getItem('app_settings');
				if (savedSettings) {
					const parsedSettings = JSON.parse(savedSettings);
					setSettings(parsedSettings);
				}
			} catch (error) {
				console.error('Error loading settings:', error);
			}
		};
		loadSettings();
	}, []);

	useEffect(() => {
		if (settings.primaryColor) {
			Colors.setPrimaryColor(settings.primaryColor);
		}
	}, [settings.primaryColor]);

	useEffect(() => {
		if (Platform.isTV) return;

		let isMounted = true;
		const controller = new AbortController();

		setIsLoading(true);
		Promise.all([
			apiService.fetchAllAnime({ signal: controller.signal }).catch(err => { console.error('fetchAllAnime error', err); return []; }),
			apiService.fetchAllProgress().catch(err => { console.error('fetchAllProgress error', err); return []; })
		]).then(([anime, progress]) => {
			if (!isMounted) return;
			setAnimeList(anime as AnimeItem[]);
			setAllProgress(progress as ProgressData[]);
		}).catch(err => {
			console.error('Error fetching initial home data', err);
		}).finally(() => {
			if (!isMounted) return;
			setIsLoading(false);
			setIsAnimeListLoaded(true);
			setIsProgressLoaded(true);

		});

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, []);

	const handleSettingsChange = async (newSettings: SettingsData) => {
		try {
			Colors.setPrimaryColor(newSettings.primaryColor);
			await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
		} catch (error) {
			console.error('Error saving settings:', error);
		}
	};

	useEffect(() => {
		if (!isGlobalLoading && !animationCompleted) {
			Animated.timing(loadingOpacity, {
				toValue: 0,
				duration: 500,
				useNativeDriver: true,
			}).start(() => {
				setShowLoadingOverlay(false);
				setAnimationCompleted(true);
			});
		} else if (isGlobalLoading && !showLoadingOverlay) {
			setShowLoadingOverlay(true);
			loadingOpacity.setValue(1);
			setAnimationCompleted(false);
		}
	}, [isGlobalLoading, loadingOpacity, animationCompleted, showLoadingOverlay]);

	useEffect(() => {
		if (searchValue) {
			const filtered = animeList.filter(anime =>
				anime.title.toLowerCase().includes(searchValue.toLowerCase()) ||
				(anime.alternativeTitle &&
					anime.alternativeTitle.toLowerCase().includes(searchValue.toLowerCase()))
			);

			setAnimeListFiltered(filtered);
			if (filtered.length > 0) {
				setSelectedPart(SelectedPart.ANIME_LIST);
				setIndexItem(0);
			}
		} else {
			setAnimeListFiltered(animeList);
		}
		setIsLoading(false);
	}, [searchValue, animeList]);

	useFocusEffect(
		useCallback(() => {
			apiService.fetchAllProgress()
				.then(async progressData => {
					if (!progressData || progressData.length === 0) {
						return;
					}
					await Promise.all(
						progressData.map(p =>
							Image.prefetch(String(p.poster || p.anime.img))
						)
					);
					setAllProgress(progressData);
					for (const progress of progressData) {
						if (progress.completed != ProgressStatus.UP_TO_DATE) {
							setSelectedPart(value => {
								if (value === SelectedPart.ANIME_LIST) {
									return value;
								}
								setFeaturedAnime({
									anime: progress.anime,
									progress: progress
								});
								return value;
							});
							break;
						}
					}
				})
				.catch(error => {
				}).finally(() => {
					setIsProgressLoaded(true);
				});
		}, [resumeVisible])
	);

	useFocusEffect(
		useCallback(() => {
			if (isGlobalLoading) return;

			const subscription = DeviceEventEmitter.addListener('keyPressed', (keyCode: number) => {
				if (resumeVisible || settingsVisible) return;
				if (keyCode === RemoteControlKey.DPAD_UP) {
					setIndexItem(currentIndex => {
						setSelectedPart(currentSelectedPart => {
							if (currentIndex > 3) {
								return currentSelectedPart;
							} else if (currentSelectedPart > SelectedPart.TOPBAR) {
								return currentSelectedPart - 1;
							}
							return currentSelectedPart;
						});

						if (currentIndex > 3) {
							return currentIndex - 4;
						}
						return currentIndex;
					});
				} else if (keyCode === RemoteControlKey.DPAD_DOWN) {
					setSelectedPart(currentSelectedPart => {
						setIndexItem(currentIndex => {
							if (currentSelectedPart < SelectedPart.ANIME_LIST) {
								return currentIndex;
							} else if (currentIndex + 4 < animeListFiltered.length) {
								return currentIndex + 4;
							}
							return currentIndex;
						});

						if (currentSelectedPart < SelectedPart.ANIME_LIST) {
							return currentSelectedPart + 1;
						}
						return currentSelectedPart;
					});
				} else if (keyCode === RemoteControlKey.DPAD_LEFT) {
					setSelectedPart(currentSelectedPart => {
						if (currentSelectedPart === SelectedPart.ANIME_LIST) {
							setIndexItem(currentIndex => {
								return currentIndex - (currentIndex % 4 === 0 ? 0 : 1);
							});
						} else if (currentSelectedPart === SelectedPart.TOPBAR) {
							setIndexTopBar(currentIndex => {
								return currentIndex - (currentIndex === 0 ? 0 : 1);
							});
						}
						return currentSelectedPart;
					});
				} else if (keyCode === RemoteControlKey.DPAD_RIGHT) {
					setSelectedPart(currentSelectedPart => {
						if (currentSelectedPart === SelectedPart.ANIME_LIST) {
							setIndexItem(currentIndex => {
								if (currentIndex + 1 >= animeListFiltered.length) {
									return currentIndex;
								}
								return currentIndex + (currentIndex % 4 === 3 ? 0 : 1);
							});
						} else if (currentSelectedPart === SelectedPart.TOPBAR) {
							setIndexTopBar(currentIndex => {
								return currentIndex + (currentIndex === 3 ? 0 : 1);
							});
						}
						return currentSelectedPart;
					});
				} else if (keyCode === RemoteControlKey.DPAD_CONFIRM) {
					if (selectedPart === SelectedPart.TOPBAR) {
						if (indexTopBar === 0) {
							if (searchInputRef.current) {
								searchInputRef.current.clear();
								setSearchValue('');
								openSearch(searchInputRef);
							}
						} else if (indexTopBar === 1) {
							setResumeVisible(true);
						} else if (indexTopBar === 2) {
							navigation.replace('ChooseUser');
						} else if (indexTopBar === 3) {
							setSettingsVisible(true);
						}

					} else if (selectedPart === SelectedPart.BANNER) {
						if (featuredAnime && featuredAnime.progress) {
							navigation.navigate('Anime', { anime: featuredAnime.anime });
						}
					}
					else if (selectedPart === SelectedPart.ANIME_LIST) {
						if (animeListFiltered.length > 0 && indexItem < animeListFiltered.length) {
							const selectedAnime = animeListFiltered[indexItem];
							if (selectedAnime) {
								navigation.navigate('Anime', { anime: selectedAnime });
							}
						}
					}
				} else if (keyCode === RemoteControlKey.BACK) {
					if (selectedPart === SelectedPart.ANIME_LIST) {
						setSearchValue('');
						setIndexItem(0);
					} else if (selectedPart === SelectedPart.TOPBAR) {
						navigation.goBack();
					} else if (selectedPart === SelectedPart.BANNER) {
						navigation.navigate('Home');
					}
				}
			});

			return () => subscription.remove();
		}, [animeList, navigation, featuredAnime, selectedPart, resumeVisible, settingsVisible, indexTopBar, animeListFiltered, isGlobalLoading, indexItem])
	);

	useEffect(() => {
		if (selectedPart === SelectedPart.ANIME_LIST) {
			if (animeListFiltered.length > 0 && indexItem < animeListFiltered.length) {
				setFeaturedAnime({
					anime: animeListFiltered[indexItem],
					progress: null
				});
			} else {
				setFeaturedAnime(null);
			}
		} else {
			setFeaturedAnime(getFeaturedAnime(allProgress));
		}
	}, [indexItem, selectedPart, allProgress, animeListFiltered]);

	if (!Platform.isTV) {
		return (
			<View style={{ flex: 1, backgroundColor: Colors.getPrimaryColor() }}>
				<StatusBar barStyle="light-content" backgroundColor={Colors.getPrimaryColor()} />
				<HomePhone
					animeList={animeListFiltered}
					allProgress={allProgress}
					isLoading={isLoading}
					isGlobalLoading={isGlobalLoading}
					searchValue={searchValue}
					setSearchValue={setSearchValue}
					onRefresh={async () => {
						try {
							setIsAnimeListLoaded(false);
							setIsProgressLoaded(false);
							const [anime, progress] = await Promise.all([
								apiService.fetchAllAnime(),
								apiService.fetchAllProgress()
							]);
							setAnimeList(anime);
							setAllProgress(progress);
						} catch (err) {
							console.error('Error refreshing home data:', err);
						} finally {
							setIsAnimeListLoaded(true);
							setIsProgressLoaded(true);
							setIsLoading(false);
						}
					}}
					onSelectAnime={(anime) => navigation.navigate('Anime', { anime })}
					onOpenSettings={() => setSettingsVisible(true)}
					onOpenChooseUser={() => navigation.navigate('ChooseUser')}
					onOpenResume={() => setResumeVisible(true)}
				/>

			</View>
		);
	}

	return (
		<View style={styles.column}>
			<HomeTop
				featuredAnime={featuredAnime}
				selectedPart={selectedPart}
				indexTopBar={indexTopBar}
				searchInputRef={searchInputRef}
				setSearchValue={setSearchValue}
				setIsLoading={setIsLoading}
				searchValue={searchValue}
			/>
			<ListAnime
				selectedPart={selectedPart}
				indexItem={indexItem}
				animeList={animeListFiltered}
				setAnimeList={(list) => {
					setAnimeList(list);
					setIsLoading(false);
					setIsAnimeListLoaded(true);
				}}
				isLoading={isLoading}
				setIsLoading={setIsLoading}
				isSearchActive={searchValue.trim() !== ''}
			/>
			<ResumeSelector
				visible={resumeVisible}
				close={() => setResumeVisible(false)}
				navigation={navigation}
				allProgress={allProgress}
			/>
			<SettingsSelector
				visible={settingsVisible}
				close={() => setSettingsVisible(false)}
				settings={settings}
				onSettingsChange={handleSettingsChange}
			/>

			{showLoadingOverlay && (
				<Animated.View style={[styles.globalLoadingOverlay, { opacity: loadingOpacity }]}>
					<View style={styles.globalLoadingContainer}>
						<ActivityIndicator size="large" color={Colors.getPrimaryColor()} />
						<Text style={styles.globalLoadingText}>Chargement en cours...</Text>
						<Text style={styles.globalLoadingSubtext}>
							Préparation de votre bibliothèque d'animes
						</Text>
					</View>
				</Animated.View>
			)}
		</View>

	);
}

function HomeTop({
	featuredAnime,
	selectedPart,
	indexTopBar,
	searchInputRef,
	setSearchValue,
	setIsLoading,
	searchValue
}: {
	featuredAnime: FeaturedAnime | null;
	selectedPart: SelectedPart;
	indexTopBar: number;
	searchInputRef: RefObject<TextInput | null>;
	setSearchValue: Dispatch<SetStateAction<string>>;
	setIsLoading: Dispatch<SetStateAction<boolean>>;
	searchValue: string;
}): React.JSX.Element {
	const initialHeight = selectedPart === SelectedPart.ANIME_LIST ? height * 0.5 : height * 0.8;
	const heightAnimation = useRef(new Animated.Value(initialHeight)).current;

	useEffect(() => {
		const targetHeight = selectedPart === SelectedPart.ANIME_LIST ? height * 0.5 : height * 0.8;
		Animated.timing(heightAnimation, {
			toValue: targetHeight,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [selectedPart, heightAnimation]);

	if (selectedPart === SelectedPart.ANIME_LIST && featuredAnime != null) {
		return (
			<Animated.View style={{ height: heightAnimation }}>
				<ImageBackground
					source={{ uri: String(featuredAnime.anime.img) }}
					style={styles.featuredBackgroundFull}
					imageStyle={styles.featuredBackgroundImage}
					resizeMode="cover"
				>
					<View style={{ zIndex: 1, flex: 1, flexDirection: 'column' }}>

						<TopBar
							selectedPart={selectedPart}
							index={indexTopBar}
							searchInputRef={searchInputRef}
							setSearchValue={setSearchValue}
							setIsLoading={setIsLoading}
							searchValue={searchValue}
						/>
						<View style={{ flex: 1 }} />
						<BannerResume featuredAnime={featuredAnime} selectedPart={selectedPart} disableButtons={false} />
					</View>
					<LinearGradient
						colors={["transparent", "#222222ff"]}
						style={styles.gradient}
						start={{ x: 0.5, y: 0 }}
						end={{ x: 0.5, y: 1 }}
					/>
				</ImageBackground>
			</Animated.View>
		);
	}
	return (
		<Animated.View style={{ height: heightAnimation }}>
			<ImageBackground
				source={featuredAnime?.anime.img ? { uri: String(featuredAnime.anime.img) as string } : undefined}
				style={styles.featuredBackgroundFull}
				imageStyle={styles.featuredBackgroundImage}
				resizeMode="cover"
			>
				<View style={styles.featuredBackgroundFull}>
					<TopBar
						selectedPart={selectedPart}
						index={indexTopBar}
						searchInputRef={searchInputRef}
						setSearchValue={setSearchValue}
						setIsLoading={setIsLoading}
						searchValue={searchValue}
					/>
					<BannerResume featuredAnime={featuredAnime} selectedPart={selectedPart} disableButtons={true} />
					<LinearGradient
						colors={["transparent", "#222222"]}
						style={styles.gradient}
						start={{ x: 0.5, y: 0 }}
						end={{ x: 0.5, y: 1 }}
					/>
				</View>
			</ImageBackground>
		</Animated.View>
	);
}

function getFeaturedAnime(allProgress: ProgressData[]): FeaturedAnime | null {
	if (!allProgress || allProgress.length === 0) {
		return null;
	}
	for (const progress of allProgress) {
		if (progress.completed !== ProgressStatus.UP_TO_DATE) {
			return {
				anime: progress.anime,
				progress: progress
			};
		}
	}
	return null;
}

function openSearch(searchInputRef: React.RefObject<TextInput | null>): void {
	if (searchInputRef.current) {
		searchInputRef.current.clear();
		searchInputRef.current.focus();
	}
}

const styles = StyleSheet.create({
	featuredBackground: {
		justifyContent: 'center',
		height: height * 0.5,
		position: 'relative',
	},
	featuredBackgroundFull: {
		justifyContent: 'center',
		flex: 1,
		position: 'relative',
	},
	featuredBackgroundImage: {
		opacity: 0.7,
	},
	gradient: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		height: 120,
		zIndex: 0,
	},
	column: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#222222ff',
	},
	globalLoadingOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(34, 34, 34, 0.95)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1000,
	},
	globalLoadingContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: 40,
	},
	globalLoadingText: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: '600',
		marginTop: 20,
		textAlign: 'center',
	},
	globalLoadingSubtext: {
		color: '#cccccc',
		fontSize: 14,
		marginTop: 8,
		textAlign: 'center',
		opacity: 0.8,
	},
});