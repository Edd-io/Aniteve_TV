import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';

const EPISODES_PER_PAGE = 5;

interface RightPanelProps {
	getTotalPages: () => number;
	currentPage: number;
	episodesData: any;
	loadingEpisodes: boolean;
	getCurrentPageEpisodes: () => [string, string[]][];
	handleEpisodePress: (episodeName: string, episodeUrls: string[]) => void;
	setCurrentPage: (page: number) => void;
	setSelectedEpisodeIndex: (index: number) => void;
	selectedSeason: string | null;
}

export const RightPanel: React.FC<RightPanelProps> = ({
	getTotalPages,
	currentPage,
	episodesData,
	loadingEpisodes,
	getCurrentPageEpisodes,
	handleEpisodePress,
	setCurrentPage,
	setSelectedEpisodeIndex,
	selectedSeason,
}) => {
	return (
		<View style={styles.rightPanel}>
			<View style={styles.episodeHeader}>
				<View style={{ flex: 1 }}>
					<Text
						style={styles.episodeTitle}
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{selectedSeason}
					</Text>
				</View>
				{getTotalPages() > 1 && (
					<View style={[
						styles.episodesInfo,
					]}>
						<Text style={styles.episodeText}>
							{episodesData?.episodes ? `${Object.keys(episodesData.episodes).length} épisodes` : 'Aucun épisode disponible'}
						</Text>
					</View>
				)}
			</View>

			{loadingEpisodes ? (
				<View style={styles.episodesLoading}>
					<ActivityIndicator size="small" color="#e50914" />
					<Text style={styles.episodesLoadingText}>Chargement...</Text>
				</View>
			) : episodesData && episodesData.episodes ? (
				<View style={{ flex: 1 }}>
					<View style={{ flex: 1 }}>
						{getCurrentPageEpisodes().map(([episodeName, episodeUrls], index) => {
							const episodeKey = `episode-${index}`;

							return (
								<TouchableOpacity
									key={index}
									style={[
										styles.episodeItem,
										{ marginBottom: index === getCurrentPageEpisodes().length - 1 ? 0 : 15 },
									]}
									onPress={() => handleEpisodePress(episodeName, episodeUrls as string[])}
								>
									<View style={styles.episodeContent}>
										<View style={[
											styles.episodeImagePlaceholder,
										]}>
											<Text style={styles.episodeNumber}>
												{((currentPage - 1) * EPISODES_PER_PAGE) + index + 1}
											</Text>
										</View>
										<View style={styles.episodeDetails}>
											<Text style={styles.episodeName} numberOfLines={2}>
												Épisode {episodeName.replace('eps', '')}
											</Text>
										</View>
									</View>
								</TouchableOpacity>
							);
						})}
					</View>


					<View style={styles.paginationControls}>
						<TouchableOpacity
							style={[
								styles.pageButton,
								currentPage === 1 && styles.disabledPageButton,
							]}
							onPress={() => {
								if (currentPage > 1) {
									setCurrentPage(currentPage - 1);
									setSelectedEpisodeIndex(0);
								}
							}}
							disabled={currentPage === 1}
						>
							<Icon name="chevron-left" size={24} color="#ffffff" />
						</TouchableOpacity>

						<Text style={styles.pageIndicator}>
							Page {currentPage} sur {getTotalPages()}
						</Text>

						<TouchableOpacity
							style={[
								styles.pageButton,
								currentPage === getTotalPages() && styles.disabledPageButton,
							]}
							onPress={() => {
								if (currentPage < getTotalPages()) {
									setCurrentPage(currentPage + 1);
									setSelectedEpisodeIndex(0);
								}
							}}
							disabled={currentPage === getTotalPages()}
						>
							<Icon name="chevron-right" size={24} color="#ffffff" />
						</TouchableOpacity>
					</View>
				</View>
			) : (
				<Text style={styles.noEpisodesText}>Aucun épisode disponible</Text>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	rightPanel: {
		flex: 1,
		backgroundColor: 'rgba(20, 20, 20, 0.57)',
		borderLeftWidth: 1,
		borderLeftColor: 'rgba(255,255,255,0.1)',
		paddingHorizontal: 20,
		paddingTop: 25,
	},
	episodeHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
		paddingBottom: 15,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255,255,255,0.1)',
	},
	episodeTitle: {
		color: '#ffffff',
		fontSize: 24,
		fontWeight: 'bold',
	},
	episodesInfo: {
		backgroundColor: 'rgba(255,255,255,0.1)',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 15,
	},
	episodeText: {
		color: '#ffffff',
		fontSize: 12,
		fontWeight: '600',
	},
	episodesLoading: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	episodesLoadingText: {
		color: '#ffffff',
		fontSize: 14,
		marginTop: 10,
	},
	episodeItem: {
		marginBottom: 15,
		borderRadius: 8,
		backgroundColor: 'rgba(255,255,255,0.05)',
		overflow: 'hidden',
	},
	episodeContent: {
		flexDirection: 'row',
		padding: 12,
		alignItems: 'center',
	},
	episodeImagePlaceholder: {
		width: 80,
		height: 35,
		backgroundColor: 'rgba(255,255,255,0.15)',
		borderRadius: 6,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	currentEpisodeImagePlaceholder: {
		backgroundColor: '#E50914',
	},
	episodeNumber: {
		color: '#ffffff',
		fontSize: 14,
		fontWeight: 'bold',
		textShadowColor: 'rgba(0,0,0,0.8)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 2,
	},
	episodeDetails: {
		flex: 1,
		justifyContent: 'center',
	},
	episodeName: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4,
		textShadowColor: 'rgba(0,0,0,0.8)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 2,
	},
	episodeCurrentIndicator: {
		color: '#E50914',
		fontSize: 12,
		fontWeight: 'bold',
		marginTop: 2,
	},
	noEpisodesText: {
		color: 'rgba(255,255,255,0.6)',
		fontSize: 16,
		textAlign: 'center',
		marginTop: 50,
	},
	paginationControls: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 14,
		borderTopWidth: 1,
		borderTopColor: 'rgba(255,255,255,0.1)',
	},
	pageButton: {
		backgroundColor: 'rgba(255,255,255,0.1)',
		paddingHorizontal: 15,
		paddingVertical: 10,
		borderRadius: 6,
		minWidth: 40,
		alignItems: 'center',
	},
	focusedPageButton: {
		backgroundColor: '#E50914',
	},
	disabledPageButton: {
		backgroundColor: 'rgba(255,255,255,0.05)',
		opacity: 0.5,
	},
	pageButtonText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	pageIndicator: {
		color: '#ffffff',
		fontSize: 14,
		fontWeight: '600',
	},
	bgStyleFull: {
		justifyContent: 'center',
		flex: 1,
		position: 'relative',
	},
	bgStyleImage: {
		opacity: 0.7,
	},
});
