import { Dimensions, ImageBackground, StyleSheet, Text, View } from "react-native";
import AnimeItem from "../../models/anime_item";
import { featuredAnime } from "../../data/mockData";
import TopBar from "../components/top_bar";
import BannerResume from "../components/banner_resume";

const { width, height } = Dimensions.get('window');

export default function Home(): React.JSX.Element {
	return (
		<View>
			<HomeTop featuredAnime={featuredAnime} />
		</View>
	);
}

function HomeTop({ featuredAnime }: { featuredAnime: AnimeItem }): React.JSX.Element {
	return (
		<ImageBackground
			source={featuredAnime.image}
			style={styles.featuredBackground}
			imageStyle={styles.featuredBackgroundImage}
			resizeMode="cover"
		>
			<TopBar />
			<BannerResume featuredAnime={featuredAnime} />
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	featuredBackground: {
		justifyContent: 'center',
	},
	featuredBackgroundImage: {
		opacity: 0.7,
	},
	column: {
		flex: 1,
		flexDirection: 'column',
	},
});