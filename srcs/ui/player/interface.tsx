import { JSX, useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { convertSecondsToTime } from "../../utils/video";
import Icon from 'react-native-vector-icons/MaterialIcons';
import AnimeItem from "../../models/anime_item";
import { AnimeEpisodesData } from "../../data/anime_api_service";

export const Interface = ({
	showInterface,
	isPaused,
	anime,
	averageColor,
	seasons,
	seasonIndexState,
	episodeIndex,
	episodeIndexState,
	sourceIndex,
	episodesState,
	resolution,
	aspectRatio,
	progress,
	duration,
	ended,
	error,
	indexMenu,
	showSourceSelector,
}: {
	showInterface: boolean;
	isPaused: boolean;
	anime: AnimeItem;
	averageColor: number[];
	seasons: { name: string }[];
	seasonIndexState: number;
	episodeIndex: number;
	episodeIndexState: number;
	sourceIndex: number;
	episodesState: AnimeEpisodesData | null;
	resolution?: string | null;
	aspectRatio?: string | null;
	progress: number;
	duration: number;
	ended: boolean;
	error: string | null;
	indexMenu: number;
	showSourceSelector: boolean;
}): JSX.Element => {
	const animatedHeight = useRef(new Animated.Value(50)).current;

	useEffect(() => {
		Animated.timing(animatedHeight, {
			toValue: isPaused ? 100 : 0,
			duration: 250,
			useNativeDriver: false,
		}).start();
	}, [isPaused]);

	if (!(showInterface || isPaused)) {
		return <></>;
	}
	return (
		<View style={styles.interface}>

			<TopInterface
				averageColor={averageColor}
				anime={anime}
				seasons={seasons}
				seasonIndexState={seasonIndexState}
				episodeIndex={episodeIndex}
				episodeIndexState={episodeIndexState}
				sourceIndex={sourceIndex}
				resolution={resolution}
				aspectRatio={aspectRatio}
			/>

			<View style={{ flex: 1 }} />

			<Animated.View style={[styles.completeMenuContainer, { backgroundColor: `rgba(${averageColor.join(',')}, 0.85)` }]}>
				<Animated.View style={{ height: animatedHeight, overflow: 'hidden', width: '100%' }}>
					{isPaused && (
						showSourceSelector ? (
							<InitialExtendedInterface
								averageColor={averageColor}
								error={error}
								indexMenu={indexMenu}
								episodeIndexState={episodeIndexState}
								episodesState={episodesState}
							/>
						) : (
							<SourceSelector
								averageColor={averageColor}
								error={error}
								indexMenu={indexMenu}
								ended={ended}
								episodeIndexState={episodeIndexState}
								episodesState={episodesState}
							/>
						)
					)}
				</Animated.View>
				<View style={styles.bottomProgressContainer}>
					<Text style={[styles.bottomText, styles.textShadow]}>{convertSecondsToTime(progress)}</Text>
					<View style={styles.progressBar}>
						<View
							style={[
								styles.progressFill,
								{
									width: duration > 0 ? `${progress * 100 / duration}%` : '0%',
									backgroundColor: Colors.getPrimaryColor(),
								}
							]}
						/>
					</View>
					<Text style={[styles.bottomText, styles.textShadow]}>{convertSecondsToTime(duration)}</Text>
				</View>
			</Animated.View>
		</View >
	);
};

// const ExtentedInterface = ({ }: {}): JSX.Element => {
// 	return (
//     );
// }

const TopInterface = ({
	averageColor,
	anime,
	seasons,
	seasonIndexState,
	episodeIndex,
	episodeIndexState,
	sourceIndex,
	resolution,
	aspectRatio,
}: {
	averageColor: number[];
	anime: AnimeItem;
	seasons: { name: string }[];
	seasonIndexState: number;
	episodeIndex: number;
	episodeIndexState: number;
	sourceIndex: number;
	resolution?: string | null;
	aspectRatio?: string | null;

}): JSX.Element => {
	return (
		<View>
			<View style={styles.topContainer}>
				<View style={[styles.titleContainer, { backgroundColor: `rgba(${averageColor.join(',')}, 0.9)` }]}>
					<Text
						style={[styles.title, styles.textShadow]}
						numberOfLines={1}
						ellipsizeMode="tail"
					>{anime.title}</Text>
				</View>
				<View style={[styles.episodeNumberContainer, { backgroundColor: `rgba(${averageColor.join(',')}, 0.9)` }]}>
					<Text
						style={[styles.episodeNumber, styles.textShadow]}
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{seasons[seasonIndexState].name} - Episode {episodeIndex + 1}
					</Text>
				</View>
			</View>
			<View style={[styles.topContainer, { marginTop: 10, justifyContent: 'flex-end' }]}>
				<View style={[styles.resolutionContainer, { backgroundColor: `rgba(${averageColor.join(',')}, 0.9)`, marginRight: (resolution || aspectRatio ? 10 : 0) }]}>
					<Text
						style={[styles.resolutionText, styles.textShadow]}
					>Source {sourceIndex + 1}</Text>
				</View>
				{
					resolution && (
						<View style={[styles.resolutionContainer, { backgroundColor: `rgba(${averageColor.join(',')}, 0.9)`, marginRight: 10 }]}>
							<Text
								style={[styles.resolutionText, styles.textShadow]}
							>{resolution}</Text>
						</View>
					)
				}
				{
					aspectRatio && (
						<View style={[styles.resolutionContainer, { backgroundColor: `rgba(${averageColor.join(',')}, 0.9)` }]}>
							<Text
								style={[styles.resolutionText, styles.textShadow]}
							>{aspectRatio}</Text>
						</View>
					)
				}
			</View>
		</View>
	);
}

const InitialExtendedInterface = ({
	averageColor,
	error,
	indexMenu,
	episodeIndexState,
	episodesState,
}: {
	averageColor: number[];
	error: string | null;
	indexMenu: number;
	episodeIndexState: number;
	episodesState: AnimeEpisodesData | null;
}): JSX.Element => {
	return (
		<View style={{ flex: 1, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-around' }}>
			{Array.isArray(episodesState?.episodes[`eps${episodeIndexState + 1}`]) &&
				episodesState.episodes[`eps${episodeIndexState + 1}`].map((element, index) => (
					<View
						key={`source-${index}`}
						style={[
							styles.buttonExtendedInterface,
							{ backgroundColor: `rgba(${averageColor.map(c => Math.floor(c * 0.7)).join(',')}, 0.9)` },
							indexMenu === index ? { backgroundColor: Colors.primary } : {}
						]}
					>
						<Text style={[styles.title, styles.textShadow, { textAlign: "center" }]}>Source {index + 1}</Text>
					</View>
				))
			}
			<View style={[
				styles.buttonExtendedInterface,
				{ backgroundColor: `rgba(${averageColor.map(c => Math.floor(c * 0.7)).join(',')}, 0.9)` },
				indexMenu === Object.keys(episodesState?.episodes[`eps${episodeIndexState + 1}`] || []).length ? { backgroundColor: Colors.primary } : {}
			]}>
				<Icon name="exit-to-app" size={30} color="#FFFFFF" />
				<Text style={[styles.title, styles.textShadow, { textAlign: "center" }]}>Retour</Text>
			</View>
		</View>
	)
}

const SourceSelector = ({
	averageColor,
	error,
	indexMenu,
	ended,
	episodeIndexState,
	episodesState,
}: {
	averageColor: number[];
	error: string | null;
	indexMenu: number;
	ended: boolean;
	episodeIndexState: number;
	episodesState: AnimeEpisodesData | null;
}): JSX.Element => {
	return (
		<View style={{ flex: 1, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-around' }}>
			{[
				['play-arrow', ended ? 'Recommencer' : 'Reprendre'],
				['source', 'Changer de Source'],
				['skip-previous', 'Épisode précédent'],
				['skip-next', 'Épisode suivant'],
				['exit-to-app', 'Retour au menu']
			].map(([icon, label], index) => (
				<View
					key={`button-${index}`}
					style={[
						styles.buttonExtendedInterface,
						{ backgroundColor: `rgba(${averageColor.map(c => Math.floor(c * 0.7)).join(',')}, 0.9)` },
						error && index == 0 ? { opacity: 0.4 } : { opacity: 1 },
						indexMenu === index ? { backgroundColor: Colors.primary } : {},
						index === 2 && episodeIndexState === 0 ? { opacity: 0.4 } : {},
						index === 3 && episodeIndexState === (Object.keys(episodesState?.episodes || {}).length - 1) ? { opacity: 0.4 } : {}
					]}
				>
					<Icon name={icon} size={30} color="#FFFFFF" />
					<Text style={[styles.title, styles.textShadow, { textAlign: "center" }]}>{label}</Text>
				</View>
			))}
		</View>
	);
}


const styles = StyleSheet.create({
	interface: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		top: 0,
		left: 0,
		padding: 15,
	},
	topContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		zIndex: 5,
	},
	completeMenuContainer: {
		borderRadius: 10,
		paddingHorizontal: 10,
		flexDirection: 'column',
		zIndex: 5,
	},
	bottomProgressContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: 10,
		borderRadius: 10,
		alignItems: 'center',
	},
	extendedInterface: {
		height: 250,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 10,
	},

	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 10,
		maxWidth: '70%',
		padding: 5,
		overflow: 'hidden',
		alignSelf: 'flex-start'
	},
	title: {
		color: 'white',
		fontSize: 18,
		paddingHorizontal: 10,
	},
	episodeNumberContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 10,
		maxWidth: '30%',
		padding: 5,
		overflow: 'hidden',
		paddingHorizontal: 10,
		alignSelf: 'flex-end'
	},
	episodeNumber: {
		color: 'white',
		fontSize: 18,
	},

	resolutionContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 10,
		padding: 5,
		overflow: 'hidden',
		paddingHorizontal: 10,
		alignSelf: 'flex-start'
	},
	resolutionText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},

	progressBar: {
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderRadius: 5,
		flex: 1,
		height: 12,
		marginHorizontal: 10,
		alignSelf: 'center',
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		width: '50%',
		borderRadius: 5,
	},
	bottomText: {
		color: 'white',
		fontSize: 18,
		fontWeight: '500',
		textAlignVertical: 'center',
		includeFontPadding: false,
	},

	buttonExtendedInterface: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 10,
		margin: 5,
		overflow: 'hidden',
	},
	textShadow: {
		textShadowColor: 'rgba(0,0,0,0.5)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 2,
	},

});