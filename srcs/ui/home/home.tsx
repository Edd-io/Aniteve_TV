import { Dimensions, ImageBackground, StyleSheet, Text, View } from "react-native";
import AnimeItem from "../../models/anime_item";
import { allAnime, featuredAnime } from "../../data/mockData";
import TopBar from "../components/top_bar";
import BannerResume from "../components/banner_resume";
import LinearGradient from 'react-native-linear-gradient';
import React, { useEffect, useState } from "react";
import { ListAnime } from "./list_anime";
import { DeviceEventEmitter } from 'react-native'
import { RemoteControlKey } from "../../constants/remote_controller";

const { height } = Dimensions.get('window');

export enum SelectedPart {
	TOPBAR = -1,
	BANNER = 0,
	ANIME_LIST = 1,
}

export function Home(): React.JSX.Element {
	const [selectedPart, setSelectedPart] = useState<SelectedPart>(SelectedPart.BANNER);
	const [indexTopBar, setIndexTopBar] = useState<number>(0);
	const [indexBanner, setIndexBanner] = useState<number>(0);
	const [indexItem, setIndexItem] = useState<number>(0);

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
						} else if (currentIndex + 4 < allAnime.length) {
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
							if (currentIndex + 1 >= allAnime.length) {
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
			}
		});

		return () => {
			subscription.remove();
		};
	}, []);

	return (
		<View style={styles.column}>
			<HomeTop featuredAnime={featuredAnime} selectedPart={selectedPart} indexBanner={indexBanner} indexTopBar={indexTopBar} />
			<ListAnime selectedPart={selectedPart} indexItem={indexItem} />
		</View>

	);
}

function HomeTop({ featuredAnime, selectedPart, indexBanner, indexTopBar }: { featuredAnime: AnimeItem, selectedPart: SelectedPart, indexBanner: number, indexTopBar: number }): React.JSX.Element {
	return (
		<ImageBackground
			source={{ uri: String(featuredAnime.img) }}
			style={styles.featuredBackground}
			imageStyle={styles.featuredBackgroundImage}
			resizeMode="cover"
		>
			<View style={{ zIndex: 1, flex: 1, flexDirection: 'column' }}>

				<TopBar selectedPart={selectedPart} index={indexTopBar} />
				<View style={{ flex: 1 }} />
				<BannerResume featuredAnime={featuredAnime} selectedPart={selectedPart} index={indexBanner} />
			</View>
			<LinearGradient
				colors={["transparent", "#000"]}
				style={styles.gradient}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
			/>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	featuredBackground: {
		justifyContent: 'center',
		height: height * 0.5,
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