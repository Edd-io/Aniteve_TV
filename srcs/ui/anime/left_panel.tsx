import React, { FC, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AnimeItem from "../../models/anime_item";
import { ProgressDataAnime, ProgressStatus, TMDBData } from "../../data/anime_api_service";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Side } from "./anime";
import { Colors } from "../../constants/colors";

interface LeftPanelProps {
	anime: AnimeItem,
	logo: string | null;
	tmdbData: TMDBData | null;
	ProgressDataAnime: ProgressDataAnime | null;
	averageColor: number[];
	indexLeftMenu: number;
	focusMenu: Side;
	haveEpisodes?: boolean;
}

export const LeftPanel: FC<LeftPanelProps> = ({
	anime,
	logo,
	tmdbData,
	ProgressDataAnime,
	averageColor,
	indexLeftMenu,
	focusMenu,
	haveEpisodes
}) => {
	const isSelected = focusMenu === Side.LEFT;

	return (
		<View style={styles.leftPanel}>
			<View style={[styles.logoContainer, { height: logo ? 150 : 0 }]}>
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
				<View style={styles.genresContainer}>
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
			<View style={styles.buttonsContainer}>
				<TouchableOpacity
					style={[
						styles.button,
						{ backgroundColor: `rgba(${averageColor.join(',')}, 0.8)` },
						indexLeftMenu === 0 && isSelected ? styles.focusedButton : {},
						haveEpisodes ? {} : { opacity: 0.5 }
					]}
				>
					<Icon name="play-arrow" size={20} color="#ffffff" />
					<Text style={styles.buttonText}>{ProgressDataAnime?.find ? (ProgressDataAnime!.progress! == 100 ? 'Recommencer' : 'Reprendre') : 'Commencer'}</Text>
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
			<Progress progress={ProgressDataAnime} averageColor={averageColor} focus={indexLeftMenu === 0 && isSelected} />
		</View>
	);
}

export function Progress({ progress, averageColor, focus, height = null }: { progress: ProgressDataAnime | null, averageColor: number[], focus?: boolean, height?: number | null }) {
	if (!progress || !progress.find) {
		return <></>;
	}
	let state = "";
	let season = progress.season!.split('/')[0];

	if (progress.status === ProgressStatus.IN_PROGRESS) {
		state = "En cours";
	} else if (progress.status === ProgressStatus.UP_TO_DATE) {
		state = "À jour";
	} else if (progress.status === ProgressStatus.NEW_EPISODE) {
		state = "Nouveau épisode";
	} else if (progress.status === ProgressStatus.NEW_SEASON) {
		state = "Nouvelle saison";
	}

	let indexFirstNb = season.search(/[0-9]/);
	let type: string = season.substring(0, indexFirstNb).trim();
	if (type.length > 0) {
		type = type[0].toUpperCase() + type.slice(1);
	}
	let number = season.substring(indexFirstNb);

	return (
		<View style={[
			styles.progressContainer,
			{ backgroundColor: `rgba(${averageColor.join(',')}, 0.8)` },
			focus ? { opacity: 1 } : { opacity: 0.5 },
			height ? { height: height } : {}
		]}>
			{progress.season?.includes('film') ?
				<Text style={styles.buttonText}>Film {progress.episode}</Text> :
				<Text style={styles.buttonText}>{type} {number} - Episode {number}</Text>
			}
			<View style={styles.progressBar}>
				<View
					style={[
						styles.progressFill,
						{
							width: `${progress.progress!}%`,
							backgroundColor: `rgba(${averageColor.map(c => Math.round((c + 255) / 2)).join(',')}, 1)`,
						}
					]}
				/>
			</View>
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<Text style={styles.buttonText}>{progress.progress!.toFixed(0)}%</Text>
				<Text style={styles.buttonLittleText}>   {state}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	leftPanel: {
		flex: 1.8,
		position: 'relative',
		paddingInline: 36,
		justifyContent: 'center',
	},
	logoContainer: {
		width: '100%',
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
	genresContainer: {
		marginTop: 8,
		paddingHorizontal: 16,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
	},
	genre: {
		color: '#ffffff',
		backgroundColor: '#a1a1a197',
		borderRadius: 4,
		textAlign: 'center',
		fontSize: 16,
		padding: 4,
		marginHorizontal: 4,
		marginBottom: 2,
	},
	synopsis: {
		color: '#ffffff',
		fontSize: 16,
		padding: 4,
		marginTop: 0,
		maxHeight: 120,
		overflow: 'hidden',
		lineHeight: 24,
		borderRadius: 4,
		textAlign: 'center',
		height: 85,
		textShadowColor: 'rgba(0,0,0,0.2)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 1,
	},
	buttonsContainer: {
		marginTop: 0,
		paddingHorizontal: 16,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
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
		includeFontPadding: false,
	},
	focusedButton: {
		opacity: 1,
		backgroundColor: Colors.primary,
	},
	progressContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: 10,
		borderRadius: 10,
		alignItems: 'center',
		marginHorizontal: 20,
		paddingLeft: 20,
	},
	progressBar: {
		flex: 1,
		height: 10,
		backgroundColor: '#ffffff5b',
		marginVertical: 7,
		marginHorizontal: 15,
		borderRadius: 5,
		flexDirection: 'row',
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		borderRadius: 5,
	},
	buttonLittleText: {
		color: '#ffffff',
		fontSize: 12,
	},
});