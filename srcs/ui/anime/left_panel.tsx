import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AnimeItem from "../../models/anime_item";
import { ProgressData, TMDBData } from "../../data/anime_api_service";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Side } from "./anime";

interface LeftPanelProps {
	anime: AnimeItem,
	logo: string | null;
	tmdbData: TMDBData | null;
	progressData: ProgressData | null;
	averageColor: number[];
	indexLeftMenu: number;
	focusMenu: Side;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ anime, logo, tmdbData, progressData, averageColor, indexLeftMenu, focusMenu }) => {
	const isSelected = focusMenu === Side.LEFT;

	return (
		<View style={styles.leftPanel}>
			<View style={{ height: logo ? 150 : 0, width: '100%' }}>
				{logo &&
					<Image
						source={{ uri: logo! }}
						style={styles.logoImage}
						resizeMode="contain"
					/>
				}
			</View>
			<Text
				style={styles.title}
				numberOfLines={2}
				ellipsizeMode="tail"
			>
				{anime.title}
			</Text>
			{anime.genres && anime.genres.length > 0 && (
				<View style={{ marginTop: 8, paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
					{anime.genres.map((genre, index) => {
						if (genre === 'Vf' || genre === 'Vostfr' || genre === 'Anime' || genre === 'Film') {
							return null;
						}
						return (
							<Text key={index} style={styles.genre}>
								{genre}
							</Text>
						);
					})}
				</View>
			)}
			<Text style={styles.synopsis} numberOfLines={3} ellipsizeMode="tail">
				{tmdbData?.overview || 'Aucune description disponible.'}
			</Text>
			<View style={{ marginTop: 8, paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
				<TouchableOpacity
					style={[
						styles.button, 
						{ backgroundColor: `rgba(${averageColor.join(',')}, 0.8)` },
						indexLeftMenu === 0 && isSelected ? styles.focusedButton : {}
					]}
				>
					<Icon name="play-arrow" size={20} color="#ffffff" />
					<Text style={styles.buttonText}>{progressData?.find ? 'Reprendre' : 'Commencer'}</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.button, 
						{ backgroundColor: `rgba(${averageColor.join(',')}, 0.8)` },
						indexLeftMenu === 1 && isSelected ? styles.focusedButton : {}
					]}
				>
					<Icon name="list" size={20} color="#ffffff" />
					<Text style={styles.buttonText}>Saisons</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.button, 
						{ backgroundColor: `rgba(${averageColor.join(',')}, 0.8)` },
						indexLeftMenu === 2 && isSelected ? styles.focusedButton : {}
					]}
				>
					<Icon name="info" size={20} color="#ffffff" />
					<Text style={styles.buttonText}>Info</Text>
				</TouchableOpacity>
			</View>

		</View>
	);
}

const styles = StyleSheet.create({
	leftPanel: {
		flex: 1.8,
		position: 'relative',
		paddingInline: 36,
	},
	logoImage: {
		width: '100%',
		maxWidth: 320,
		maxHeight: 150,
		aspectRatio: 3,
		alignSelf: 'center',
		borderRadius: 10,
		marginTop: 24,
	},
	title: {
		color: '#ffffff',
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center',
		marginTop: 24,
	},
	genre: {
		color: '#ffffff',
		backgroundColor: '#a1a1a197',
		borderRadius: 4,
		textAlign: 'center',
		fontSize: 16,
		padding: 4,
		marginHorizontal: 4,
	},
	synopsis: {
		color: '#ffffff',
		fontSize: 16,
		padding: 4,
		marginTop: 16,
		maxHeight: 120,
		overflow: 'hidden',
		lineHeight: 24,
		borderRadius: 4,
		marginBottom: 16,
		textAlign: 'center',
		height: 85,
		textShadowColor: 'rgba(0,0,0,0.2)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 1,
	},
	button: {
		backgroundColor: '#00000087',
		padding: 10,
		borderRadius: 5,
		marginVertical: 8,
		alignItems: 'center',
		flex: 1,
		justifyContent: 'center',
		marginHorizontal: 4,
		opacity: 0.8,
	},
	buttonText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: 'bold',
		textShadowColor: 'rgba(0,0,0,0.2)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 1,
	},
	focusedButton: {
		opacity: 1,
		backgroundColor: '#E50914',
	},
});