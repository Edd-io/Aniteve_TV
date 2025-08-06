import { Dimensions, ImageBackground, StyleSheet, Text, View } from "react-native";
import AnimeItem from "../../models/anime_item";
import { featuredAnime } from "../../data/mockData";
import TopBar from "../components/top_bar";
import BannerResume from "../components/banner_resume";
import LinearGradient from 'react-native-linear-gradient';
import React, { useState } from "react";
import { ListAnime } from "./list_anime";

const { width, height } = Dimensions.get('window');

export default function Home(): React.JSX.Element {
	return (
		<View style={styles.column}>
			<HomeTop featuredAnime={featuredAnime} />
			<ListAnime />
		</View>

	);
}

function HomeTop({ featuredAnime }: { featuredAnime: AnimeItem }): React.JSX.Element {
	return (
		<ImageBackground
			source={{ uri: String(featuredAnime.img) }}
			style={styles.featuredBackground}
			imageStyle={styles.featuredBackgroundImage}
			resizeMode="cover"
		>
			<View style={{ zIndex: 1, flex: 1, flexDirection: 'column' }}>

				<TopBar />
				<View style={{ flex: 1 }} />
				<BannerResume featuredAnime={featuredAnime} />
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