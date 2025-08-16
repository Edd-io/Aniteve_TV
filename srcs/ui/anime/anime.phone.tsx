import React, { FC, JSX, useRef, useMemo, useEffect, useState, Fragment } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ImageBackground,
	TouchableOpacity,
	Dimensions,
	Animated,
	StatusBar,
	Platform,
	ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../constants/routes';
import { TMDBData } from '../../types/tmdb';
import AnimeItem from '../../models/anime_item';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SeasonSelectorPhone } from '../components/season_selector.phone';
import { AnimePhoneProps } from '../../types/anime';

export type AnimeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Anime'>;

const { width, height } = Dimensions.get('window');

export const AnimePhone: FC<AnimePhoneProps> = ({
	anime,
	loading,
	loadingEpisodes,
	animeSeasonData,
	episodesData,
	progressDataAnime,
	tmdbData,
	selectedSeasonIndex,
	backdropImage,
	averageColor,
	handleSeasonSelect,
	handlePlayAnime,
}) => {
	const navigation = useNavigation<AnimeScreenNavigationProp>();
	const scrollY = useRef(new Animated.Value(0)).current;
	const headerOpacity = useRef(new Animated.Value(0)).current;

	const primaryColor = (alpha: number) => `rgba(${averageColor[0]}, ${averageColor[1]}, ${averageColor[2]}, ${alpha})`;
	const isPrimaryDark = (() => {
		if (!averageColor || averageColor.length < 3) return true;
		const [r, g, b] = averageColor;
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		return luminance < 0.5;
	})();

	const [seasonSelectorVisible, setSeasonSelectorVisible] = useState(false);

	const handleScroll = Animated.event(
		[{ nativeEvent: { contentOffset: { y: scrollY } } }],
		{
			useNativeDriver: false,
			listener: (event: any) => {
				const offsetY = event.nativeEvent.contentOffset.y;
				const opacity = Math.min(offsetY / 200, 1);
				headerOpacity.setValue(opacity);
			}
		}
	);

	const renderEpisodeItem = (index: number) => {
		const isWatched = progressDataAnime?.find && progressDataAnime.episode! > index + 1;
		const isCurrentlyWatching = progressDataAnime?.find && progressDataAnime.episode! === index + 1;
		const progressPercent = isCurrentlyWatching ? (progressDataAnime?.progress || 0) : 0;
		const isMovie = animeSeasonData[selectedSeasonIndex]?.url.includes('film');

		return (
			<TouchableOpacity
				key={index}
				style={[
					styles.episodeCard,
					isWatched && styles.watchedEpisode,
					isCurrentlyWatching && styles.currentEpisode
				]}
				onPress={() => {
					navigation.navigate('Player', {
						anime: anime,
						episodeIndex: index,
						seasonIndex: selectedSeasonIndex,
						seasons: animeSeasonData,
						tmdbData: tmdbData,
						averageColor: averageColor,
						ProgressDataAnime: progressDataAnime
					});
				}}
				activeOpacity={0.8}
			>
				<View style={styles.episodeNumber}>
					<Text style={styles.episodeNumberText}>{index + 1}</Text>
				</View>

				<View style={styles.episodeContent}>
					<Text style={styles.episodeTitle} numberOfLines={1}>
						{`${isMovie ? 'Film' : 'Épisodsde'} ${index + 1}`}
					</Text>
				</View>

				{isCurrentlyWatching && progressPercent > 0 && (
					<View style={styles.progressIndicator}>
						<View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
					</View>
				)}

				{isWatched && (
					<View style={styles.watchedIndicator}>
						<Icon name="check" size={15} color="#fff" />
					</View>
				)}

				<TouchableOpacity style={styles.playButton} onPress={handlePlayAnime}>
					<Icon name="play-arrow" size={24} color="#fff" />
				</TouchableOpacity>
			</TouchableOpacity>
		);
	};

	useEffect(() => {
		const listenerId = headerOpacity.addListener(({ value }) => {
			if (value > 0.1) {
				StatusBar.setBarStyle('light-content', true);
			} else {
				StatusBar.setBarStyle(isPrimaryDark ? 'light-content' : 'dark-content', true);
			}
		});
		return () => {
			headerOpacity.removeListener(listenerId);
		};
	}, [headerOpacity, isPrimaryDark]);

	return (
		<View style={[styles.container, { backgroundColor: primaryColor(0.8) }]}>
			<StatusBar
				backgroundColor="transparent"
				translucent
			/>


			<TopBar
				navigation={navigation}
				anime={anime}
				headerOpacity={headerOpacity}
			/>


			<Animated.ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
				onScroll={handleScroll}
				scrollEventThrottle={16}
			>
				<TopHero
					title={String(anime.title)}
					genres={anime.genres.map(g => String(g))}
					backdropImage={backdropImage ?? String(anime.img)}
				/>

				<View style={[styles.actionPanel]}>
					<TouchableOpacity
						style={[styles.primaryButton]}
						onPress={handlePlayAnime}
						disabled={!episodesData}
					>
						<Icon name="play-arrow" size={24} color={'#fff'} />
						<Text style={[styles.primaryButtonText]}>
							{progressDataAnime?.find ? `${progressDataAnime?.find ? `${progressDataAnime.season_name ?? progressDataAnime.season?.split('/')[0]} - ${progressDataAnime.season?.includes('film') ? 'Film' : 'Épisode'} ${progressDataAnime.episode}` : 'Regarder'}` : 'Regarder'}
						</Text>
					</TouchableOpacity>
				</View>

				{tmdbData && (() => {
					const t: TMDBData = tmdbData;
					const alt: String | undefined = anime.alternativeTitle;
					const items: string[] = [];
					if (alt) items.push(`Titres alternatifs :\n\n${alt.toString()}`);
					if (t.first_air_date) {
						const date = new Date(t.first_air_date);
						const formattedDate = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
						items.push(`Sortie : ${formattedDate}`);
					}
					if (t.popularity != null) items.push(`Popularité : ${String(Math.round(Number(t.popularity)))}`);
					if (t.vote_average != null) items.push(`Note : ${Math.round(Number(t.vote_average) * 10) / 10}`);
					return (
						<View style={styles.descriptionCard}>
							{t.overview ? <Text style={styles.descriptionText}>Synopsis : {'\n\n'}{t.overview}</Text> : null}
							{items.length > 0 && <View style={styles.rowDivider} />}
							{items.map((it, idx) => (
								React.createElement(React.Fragment, { key: `info-wrap-${idx}` },
									React.createElement(View, { key: `info-${idx}`, style: styles.infoRow },
										React.createElement(Text, { style: styles.infoText }, it)
									),
									idx < items.length - 1 && React.createElement(View, { key: `sep-${idx}`, style: styles.rowSeparator })
								)
							))}
						</View>
					);
				})()}

				{seasonSelectorVisible && (
					<SeasonSelectorPhone
						visible={seasonSelectorVisible}
						seasons={animeSeasonData}
						currentSeason={animeSeasonData[selectedSeasonIndex]}
						averageColor={averageColor}
						closePopup={() => setSeasonSelectorVisible(false)}
						onSeasonSelect={handleSeasonSelect}
					/>
				)}

				{animeSeasonData.length > 1 && (
					<TouchableOpacity
						style={styles.seasonCard}
						onPress={() => setSeasonSelectorVisible(true)}
					>
						<View style={styles.seasonInfo}>
							<Text style={styles.seasonLabel}>Saison actuelle</Text>
							<Text style={styles.seasonName}>
								{animeSeasonData[selectedSeasonIndex]?.name || 'Saison 1'}
							</Text>
						</View>
						<Text style={styles.seasonArrow}>→</Text>
					</TouchableOpacity>
				)}

				<View style={styles.episodesSection}>
					<Text style={styles.sectionTitle}>Épisodes</Text>

					{loadingEpisodes ? (
						<View style={styles.episodesLoading}>
							<ActivityIndicator size="small" color={primaryColor(1)} />
							<Text style={styles.loadingEpisodesText}>Chargement...</Text>
						</View>
					) : episodesData?.episodes && Object.keys(episodesData.episodes).length > 0 ? (
						<View style={styles.episodesList}>
							{Object.entries(episodesData.episodes).map(([episodeName, episodeUrls], index) => {
								return (
									<Fragment key={`episode-${index}`}>
										{renderEpisodeItem(index)}
									</Fragment>
								);
							})}
						</View>
					) : (
						<View style={styles.noEpisodesCard}>
							<Text style={styles.noEpisodesText}>Aucun épisode disponible</Text>
						</View>
					)}
				</View>

				<View style={{ height: 40 }} />
			</Animated.ScrollView>
		</View>
	);
};


const TopBar: FC<{
	navigation: AnimeScreenNavigationProp;
	anime: AnimeItem;
	headerOpacity: Animated.Value;
}> = ({
	navigation,
	anime,
	headerOpacity,
}) => {
		return (
			<Animated.View style={[
				styles.floatingHeader,
				{
					backgroundColor: headerOpacity.interpolate({
						inputRange: [0, 1],
						outputRange: ['transparent', '#000000']
					}),
					paddingTop: (StatusBar.currentHeight || 34) + 10
				}
			]}>
				<TouchableOpacity
					style={styles.backBtn}
					onPress={() => navigation.goBack()}
				>
					<Icon name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'} size={24} color={'#fff'} />
				</TouchableOpacity>

				<Animated.Text
					style={[styles.headerTitle, { opacity: headerOpacity }]}
					numberOfLines={1}
					ellipsizeMode="tail"
				>
					{anime.title}
				</Animated.Text>
			</Animated.View>
		);
	};


const TopHero: FC<{
	title: string;
	genres: string[];
	backdropImage: string | null;
}> = ({ title, genres, backdropImage }) => {
	return (
		<View style={styles.topSection}>
			<ImageBackground source={{ uri: backdropImage ?? '' }} style={styles.topImage} imageStyle={styles.topImageStyle}>
				<LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']} locations={[0, 0.3, 0.7, 1]} style={styles.topGradient} />

				<View style={styles.topContent}>
					<Text style={styles.topTitle}>{title}</Text>

					<View style={styles.genreContainer}>
						{genres.slice(0, 3).map((genre, index) => (
							<View key={index} style={styles.genreChip}>
								<Text style={styles.genreText}>{genre}</Text>
							</View>
						))}
					</View>
				</View>
			</ImageBackground>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	floatingHeader: {
		position: 'absolute',
		left: 0,
		right: 0,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingBottom: 10,
		zIndex: 1000,
	},
	backBtn: {
		height: 44,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: '600',
		flex: 1,
		marginHorizontal: 16,
		includeFontPadding: false,
	},
	scrollView: {
		flex: 1,
	},
	topSection: {
		height: height * 0.6,
		position: 'relative',
	},
	topImage: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	topImageStyle: {
		opacity: 1,
	},
	topGradient: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	topContent: {
		padding: 24,
		paddingBottom: 40,
		alignItems: 'center',
	},
	topTitle: {
		color: '#ffffff',
		fontSize: 36,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 20,
		textShadowColor: 'rgba(0,0,0,0.8)',
		textShadowOffset: { width: 2, height: 2 },
		textShadowRadius: 4,
	},
	genreContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: 8,
	},
	genreChip: {
		backgroundColor: 'rgba(255,255,255,0.2)',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
	},
	genreText: {
		color: '#ffffff',
		fontSize: 12,
		fontWeight: '500',
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	actionPanel: {
		paddingHorizontal: 24,
		marginTop: 20,
		flexDirection: 'row',
		alignItems: 'center',
	},
	primaryButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 16,
		borderRadius: 16,
		backgroundColor: '#111111',
	},
	primaryButtonText: {
		fontSize: 16,
		fontWeight: '600',
		includeFontPadding: false,
		color: '#ffffff',
	},
	descriptionCard: {
		backgroundColor: '#111111',
		marginHorizontal: 24,
		marginVertical: 16,
		padding: 20,
		borderRadius: 16,
	},
	rowDivider: {
		height: 1,
		backgroundColor: 'rgba(255,255,255,0.06)',
		marginTop: 12,
	},
	infoRow: {
		paddingVertical: 10,
	},
	infoText: {
		color: '#cccccc',
		fontSize: 14,
	},
	rowSeparator: {
		height: 1,
		backgroundColor: 'rgba(255,255,255,0.1)',
		marginHorizontal: 0,
	},
	descriptionText: {
		color: '#cccccc',
		fontSize: 15,
		lineHeight: 22,
		fontWeight: '300',
	},
	seasonCard: {
		backgroundColor: '#111111',
		marginHorizontal: 24,
		marginBottom: 16,
		padding: 20,
		borderRadius: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	seasonInfo: {
		flex: 1,
	},
	seasonLabel: {
		color: '#888888',
		fontSize: 12,
		fontWeight: '500',
		textTransform: 'uppercase',
		letterSpacing: 0.5,
		marginBottom: 4,
	},
	seasonName: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '600',
	},
	seasonArrow: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	episodesSection: {
		paddingHorizontal: 24,
		paddingBottom: 24,
	},
	sectionTitle: {
		color: '#ffffff',
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 20,
	},
	episodesLoading: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 40,
	},
	loadingEpisodesText: {
		color: '#888888',
		fontSize: 14,
		marginLeft: 12,
	},
	episodesList: {
		gap: 12,
	},
	episodeCard: {
		backgroundColor: '#1a1a1a',
		borderRadius: 16,
		padding: 20,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
		borderLeftWidth: 4,
		borderLeftColor: 'transparent',
	},
	watchedEpisode: {
		backgroundColor: '#0f1a0f',
		borderLeftColor: '#4CAF50',
	},
	currentEpisode: {
		backgroundColor: '#1a1520',
		borderLeftColor: '#ff6b6b',
	},
	episodeNumber: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: 'rgba(255,255,255,0.1)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	episodeNumberText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	episodeContent: {
		flex: 1,
	},
	episodeTitle: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4,
	},
	progressIndicator: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: 3,
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderBottomLeftRadius: 16,
		borderBottomRightRadius: 16,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: '#ff6b6b',
	},
	watchedIndicator: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: '#4CAF50',
		justifyContent: 'center',
		alignItems: 'center',
	},
	watchedIcon: {
		color: '#ffffff',
		fontSize: 12,
		fontWeight: 'bold',
	},
	playButton: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: 'rgba(255,255,255,0.1)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	noEpisodesCard: {
		backgroundColor: '#1a1a1a',
		borderRadius: 16,
		padding: 40,
		alignItems: 'center',
	},
	noEpisodesText: {
		color: '#888888',
		fontSize: 16,
		textAlign: 'center',
		fontWeight: '300',
	},
});
