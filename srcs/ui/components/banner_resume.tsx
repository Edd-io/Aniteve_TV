import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FeaturedAnime, SelectedPart } from "../home/home";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "../../constants/routes";
import { Progress } from "../anime/left_panel";
import { Colors } from "../../constants/colors";
import { hexToRgb } from "../../utils/hexa_to_rgb";

const { width, height } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function BannerResume({ featuredAnime, selectedPart, index, disableButtons }: { featuredAnime: FeaturedAnime | null, selectedPart: SelectedPart, index: number, disableButtons: boolean }): React.JSX.Element {
	const navigation = useNavigation<NavigationProp>();
	const currentFocusedIndex = index;
	const isSelected = selectedPart === SelectedPart.BANNER;

	console.log("BannerResume rendered with featuredAnime:", featuredAnime);
	return (
		<View style={styles.featuredOverlay}>
			<View style={styles.featuredContent}>
				<Text
					style={styles.featuredTitle}
					numberOfLines={1}
					ellipsizeMode="tail"
				>
					{featuredAnime?.anime.title ?? "Aniteve TV"}
				</Text>

				{!disableButtons ? null :
					<View style={styles.actionButtons}>
						<TouchableOpacity
							style={[
								styles.playButton,
								isSelected && currentFocusedIndex === 0 && styles.focusedButton,
								!featuredAnime?.progress && { opacity: 0.5 }
							]}
						>
							<Text style={styles.playButtonText}>{!featuredAnime?.progress ? "Aucune anime à reprendre" : "Reprendre"}</Text>
						</TouchableOpacity>
						{featuredAnime?.progress && (
							<View style={{ width: '100%', justifyContent: 'center' }}>
								<Progress
									progress={featuredAnime.progress}
									averageColor={hexToRgb(Colors.primary)}
									focus={isSelected && currentFocusedIndex === 0}
									height={56}
								/>
							</View>
						)}
					</View>
				}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	featuredOverlay: {
		padding: 24,
		flex: 1,
		justifyContent: 'flex-end',
		zIndex: 1,
	},
	featuredContent: {
		maxWidth: width * 0.8,
	},
	featuredTitle: {
		fontSize: 48,
		fontWeight: 'bold',
		color: '#fff',
		overflow: 'hidden',
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
		marginTop: 16,
	},
	playButton: {
		backgroundColor: Colors.primary,
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 8,
		height: 56,
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