import { Dimensions, ImageBackground, StyleSheet, Text, View, Animated } from "react-native";
import AnimeItem from "../../models/anime_item";
import TopBar from "../components/top_bar";
import BannerResume from "../components/banner_resume";
import LinearGradient from 'react-native-linear-gradient';
import React, { useEffect, useState, useRef } from "react";
import { ListAnime } from "./list_anime";
import { DeviceEventEmitter } from 'react-native'
import { RemoteControlKey } from "../../constants/remote_controller";
import { featuredAnimeMock } from "../../data/mockData";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "../../constants/routes";

const { height } = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export enum SelectedPart {
	TOPBAR = -1,
	BANNER = 0,
	ANIME_LIST = 1,
}

export function Home(): React.JSX.Element {
	const navigation = useNavigation<HomeScreenNavigationProp>();
	const [selectedPart, setSelectedPart] = useState<SelectedPart>(SelectedPart.BANNER);
	const [indexTopBar, setIndexTopBar] = useState<number>(0);
	const [indexBanner, setIndexBanner] = useState<number>(0);
	const [indexItem, setIndexItem] = useState<number>(0);
	const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
	const [featuredAnime, setFeaturedAnime] = useState<AnimeItem | null>(null);

	useEffect(() => {
		const subscription = DeviceEventEmitter.addListener('keyPressed', (keyCode: number) => {
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
						} else if (currentIndex + 4 < animeList.length) {
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
					} else if (currentSelectedPart === SelectedPart.BANNER) {
						setIndexBanner(currentIndex => {
							return currentIndex - (currentIndex === 0 ? 0 : 1);
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
							if (currentIndex + 1 >= animeList.length) {
								return currentIndex;
							}
							return currentIndex + (currentIndex % 4 === 3 ? 0 : 1);
						});
					} else if (currentSelectedPart === SelectedPart.BANNER) {
						setIndexBanner(currentIndex => {
							return currentIndex + (currentIndex === 1 ? 0 : 1);
						});
					} else if (currentSelectedPart === SelectedPart.TOPBAR) {
						setIndexTopBar(currentIndex => {
							return currentIndex + (currentIndex === 2 ? 0 : 1);
						});
					}
					return currentSelectedPart;
				});
			} else if (keyCode === RemoteControlKey.DPAD_CONFIRM) {
				if (selectedPart === SelectedPart.ANIME_LIST) {
					setIndexItem(currentIndex => {
						const selectedAnime = animeList[currentIndex];
						if (selectedAnime) {
							navigation.navigate('Anime', { anime: selectedAnime });
						}
						return currentIndex;
					});
				} else if (selectedPart === SelectedPart.BANNER) {
					if (indexBanner === 1) {
						if (featuredAnime) {
							navigation.navigate('Anime', { anime: featuredAnime });
						}
					}
				}
			}
		});

		return () => {
			subscription.remove();
		};
	}, [animeList, navigation, indexBanner, featuredAnime]);

	useEffect(() => {
		setFeaturedAnime(animeList[indexItem]);
	}, [indexItem, animeList]);

	return (
		<View style={styles.column}>
			<HomeTop featuredAnime={featuredAnime} selectedPart={selectedPart} indexBanner={indexBanner} indexTopBar={indexTopBar} />
			<ListAnime selectedPart={selectedPart} indexItem={indexItem} animeList={animeList} setAnimeList={setAnimeList} />
		</View>

	);
}

function HomeTop({ featuredAnime, selectedPart, indexBanner, indexTopBar }: { featuredAnime: AnimeItem | null, selectedPart: SelectedPart, indexBanner: number, indexTopBar: number }): React.JSX.Element {
	const heightAnimation = useRef(new Animated.Value(height * 0.5)).current;

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
					source={{ uri: String(featuredAnime.img) }}
					style={styles.featuredBackgroundFull}
					imageStyle={styles.featuredBackgroundImage}
					resizeMode="cover"
				>
					<View style={{ zIndex: 1, flex: 1, flexDirection: 'column' }}>

						<TopBar selectedPart={selectedPart} index={indexTopBar} />
						<View style={{ flex: 1 }} />
						<BannerResume featuredAnime={featuredAnime} selectedPart={selectedPart} index={indexBanner} disableButtons={false} />
					</View>
					<LinearGradient
						colors={["transparent", "#000"]}
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
				source={{ uri: String(featuredAnimeMock.img) }}
				style={styles.featuredBackgroundFull}
				imageStyle={styles.featuredBackgroundImage}
				resizeMode="cover"
			>
				<View style={styles.featuredBackgroundFull}>
					<TopBar selectedPart={selectedPart} index={indexTopBar} />
					<BannerResume featuredAnime={featuredAnimeMock} selectedPart={selectedPart} index={indexBanner} disableButtons={true} />
					<LinearGradient
						colors={["transparent", "#000"]}
						style={styles.gradient}
						start={{ x: 0.5, y: 0 }}
						end={{ x: 0.5, y: 1 }}
					/>
				</View>
			</ImageBackground>
		</Animated.View>
	);
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
	},
});