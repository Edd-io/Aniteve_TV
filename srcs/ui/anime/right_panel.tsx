import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, DeviceEventEmitter, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AnimeScreenNavigationProp, AnimeScreenRouteProp, Side } from "./anime";
import { RemoteControlKey } from "../../constants/remote_controller";
import { AnimeEpisodesData, TMDBData } from "../../data/anime_api_service";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

const EPISODES_PER_PAGE = 5;

interface RightPanelProps {
	episodesData: AnimeEpisodesData | null;
	loadingEpisodes: boolean;
	selectedSeason: string | null;
	averageColor: number[];
	focusMenu: Side;
	setFocusMenu?: (side: Side) => void;
	isMovie: boolean;
	animeSeasonData: String[];
	selectedSeasonIndex: number;
	tmdbData?: TMDBData | null;
}

export const RightPanel: React.FC<RightPanelProps> = ({
	episodesData,
	loadingEpisodes,
	selectedSeason,
	averageColor,
	focusMenu,
	setFocusMenu = () => { },
	isMovie,
	animeSeasonData = [],
	selectedSeasonIndex = 0,
	tmdbData = null
}) => {
	const route = useRoute<AnimeScreenRouteProp>();
	const navigation = useNavigation<AnimeScreenNavigationProp>();
	const { anime } = route.params;
	const isSelected = focusMenu === Side.RIGHT;

	const [currentPage, setCurrentPage] = useState(1);
	const [indexEpisode, setIndexEpisode] = useState(0);
	const [listSize, setListSize] = useState<number>(0);
	const [onPageSelector, setOnPageSelector] = useState(false);

	const getCurrentPageEpisodes = () => {
		if (!episodesData?.episodes) return [];
		const episodes = Object.entries(episodesData.episodes);
		const startIndex = (currentPage - 1) * EPISODES_PER_PAGE;
		const endIndex = startIndex + EPISODES_PER_PAGE;
		return episodes.slice(startIndex, endIndex);
	};

	const getTotalPages = () => {
		if (!episodesData?.episodes) return 1;
		const totalEpisodes = Object.keys(episodesData.episodes).length;
		return Math.ceil(totalEpisodes / EPISODES_PER_PAGE);
	};

	useEffect(() => {
		const currentEpisodes = getCurrentPageEpisodes();
		setListSize(currentEpisodes.length);
	}, [currentPage, episodesData]);

	const handleFocusChange = useCallback((side: Side) => {
		setTimeout(() => setFocusMenu(side), 0);
	}, [setFocusMenu]);

	const navigateToPlayer = (indexEpisodeInList: number) => {
		const indexEpisode =  indexEpisodeInList + ((currentPage - 1) * EPISODES_PER_PAGE);

		navigation.navigate('Player', {
			anime: anime,
			episodeIndex: indexEpisode,
			seasonIndex: selectedSeasonIndex,
			episodes: episodesData!,
			seasons: animeSeasonData,
			tmdbData: tmdbData,
			averageColor: averageColor,
		});
	};

	useFocusEffect(
		React.useCallback(() => {
			const handleRemoteControlEvent = (keyCode: number) => {
				if (!isSelected) {
					return;
				}

				if (keyCode === RemoteControlKey.DPAD_LEFT) {
					if (onPageSelector) {
						setCurrentPage(prevPage => {
							if (prevPage > 1) {
								return prevPage - 1;
							} else {
								handleFocusChange(Side.LEFT);
								return prevPage;
							}
						});
					} else {
						if (indexEpisode !== listSize) {
							handleFocusChange(Side.LEFT);
						} else {
							setCurrentPage(prevPage => {
								if (prevPage > 1) {
									return prevPage - 1;
								} else {
									handleFocusChange(Side.LEFT);
									return prevPage;
								}
							});
							setIndexEpisode(0);
						}
					}
				}
				else if (keyCode === RemoteControlKey.DPAD_RIGHT) {
					if (onPageSelector) {
						setCurrentPage(prevPage => {
							if (prevPage < getTotalPages()) {
								return prevPage + 1;
							}
							return prevPage;
						});
					} else {
						if (indexEpisode !== listSize - 1) {
							return;
						} else {
							setCurrentPage(prevPage => {
								if (prevPage < getTotalPages()) {
									return prevPage + 1;
								}
								return prevPage;
							});
						}
					}
				} else if (keyCode === RemoteControlKey.DPAD_UP) {
					setOnPageSelector(prevValue => {
						if (prevValue === true) {
							setIndexEpisode(listSize - 1);
							return false;
						}
						setIndexEpisode(prevIndex => Math.max(prevIndex - 1, 0));
						return false;
					});
				} else if (keyCode === RemoteControlKey.DPAD_DOWN) {
					setIndexEpisode(prevIndex => {
						if (prevIndex < listSize - 1) {
							return Math.min(prevIndex + 1, listSize);
						} else {
							setOnPageSelector(true);
							return prevIndex;
						}
					});
				} else if (keyCode === RemoteControlKey.DPAD_CONFIRM) {
					if (!onPageSelector) {
						setOnPageSelector(false);
						navigateToPlayer(indexEpisode);

					}
				} else if (keyCode === RemoteControlKey.BACK) {
					handleFocusChange(Side.LEFT);
				}
			};

			const subscription = DeviceEventEmitter.addListener('keyPressed', handleRemoteControlEvent);
			return () => subscription.remove();
		}, [isSelected, listSize, onPageSelector, handleFocusChange, currentPage, indexEpisode])
	);

	return (
		<View style={[styles.rightPanel, { backgroundColor: `rgba(${averageColor.join(',')}, 0.57)` }]}>
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
										{ backgroundColor: `rgba(${averageColor.join(',')}, 0.7)` },
										{ marginBottom: index === getCurrentPageEpisodes().length - 1 ? 0 : 15 },
										indexEpisode === index && isSelected && !onPageSelector ? styles.focusedEpisodeItem : {}
									]}
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
												{isMovie ? "Film" : "Épisode"} {episodeName.replace('eps', '')}
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
								{ backgroundColor: onPageSelector && isSelected ? '#E50914' : 'rgba(255,255,255,0.1)', }
							]}
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
								{ backgroundColor: onPageSelector && isSelected ? '#E50914' : 'rgba(255,255,255,0.1)', }
							]}
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
		textShadowColor: 'rgba(0,0,0,0.2)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 1,
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
		textShadowColor: 'rgba(0,0,0,0.2)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 1,
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
		textShadowColor: 'rgba(0,0,0,0.2)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 1,
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
	focusedEpisodeItem: {
		backgroundColor: '#E50914',
	},
});
