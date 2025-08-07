import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AnimeItem from "../../models/anime_item";
import { SelectedPart } from "../home/home";

const { width, height } = Dimensions.get('window');

export default function BannerResume({ featuredAnime, selectedPart, index }: { featuredAnime: AnimeItem, selectedPart: SelectedPart, index: number }): React.JSX.Element {
	const currentFocusedIndex = index;
	const isSelected = selectedPart === SelectedPart.BANNER;
	
	
	return (
		<View style={styles.featuredOverlay}>
			<View style={styles.featuredContent}>
				<Text
					style={styles.featuredTitle}
					numberOfLines={1}
					ellipsizeMode="tail"
				>
					{featuredAnime.title}
				</Text>

				<View style={styles.actionButtons}>
					<TouchableOpacity 
						style={[
							styles.playButton, 
							isSelected && currentFocusedIndex === 0 && styles.focusedButton
						]}
					>
						<Text style={styles.playButtonText}>Reprendre</Text>
					</TouchableOpacity>
					<TouchableOpacity 
						style={[
							styles.infoButton,
							isSelected && currentFocusedIndex === 1 && styles.focusedButton
						]}
					>
						<Text style={styles.infoButtonText}>Plus d'infos</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	featuredOverlay: {
		padding: 48,
	},
	featuredContent: {
		maxWidth: width * 0.8,
	},
	featuredTitle: {
		fontSize: 48,
		fontWeight: 'bold',
		color: '#fff',
		marginBottom: 12,
		overflow: 'hidden',
	},
	featuredCategory: {
		fontSize: 18,
		color: '#ccc',
		marginBottom: 8,
	},
	featuredInfo: {
		fontSize: 16,
		color: '#fff',
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 4,
		alignSelf: 'flex-start',
		marginBottom: 24,
	},
	actionButtons: {
		flexDirection: 'row',
		gap: 16,
	},
	playButton: {
		backgroundColor: '#e50914',
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 8,
		flexDirection: 'row',
		opacity: 0.5,
		alignItems: 'center',
	},
	playButtonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
	},
	infoButton: {
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center',
		opacity: 0.5,
	},
	infoButtonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
	},
	focusedButton: {
		transform: [{ scale: 1.05 }],
		opacity: 1,
	},
});