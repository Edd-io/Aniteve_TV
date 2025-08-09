import React, { useState } from "react";
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

export const LeftPanel: React.FC<LeftPanelProps> = ({ 
	anime, 
	logo, 
	tmdbData, 
	progressData, 
	averageColor, 
	indexLeftMenu, 
	focusMenu,
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
						indexLeftMenu === 0 && isSelected ? styles.focusedButton : {}
					]}
				>
					<Icon name="play-arrow" size={20} color="#ffffff" />
					<Text style={styles.buttonText}>{progressData?.find ? (progressData!.progress! == 100 ? 'Recommencer' : 'Reprendre') : 'Commencer'}</Text>
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
			<Progress progress={progressData} averageColor={averageColor} focus={indexLeftMenu === 0 && isSelected} />
		</View>
	);
}

function Progress({ progress, averageColor, focus }: { progress: ProgressData | null, averageColor: number[], focus?: boolean }) {
	if (!progress || !progress.find) {
		return <></>;
	}
	let state = "";
	let season = progress.season!.split('/')[0];

	if (progress.status === 0) {
		state = "En cours";
	} else if (progress.status === 1) {
		state = "À jour";
	} else if (progress.status === 2) {
		state = "Nouveau épisode";
	} else if (progress.status === 3) {
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
			focus ? {opacity: 1 } : { opacity: 0.5 }
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
			<Text style={styles.buttonText}>{progress.progress!.toFixed(0)}%</Text>
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
	},
	focusedButton: {
		opacity: 1,
		backgroundColor: '#E50914',
	},
	progressContainer: {
		paddingHorizontal: 16,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		borderRadius: 5,
		padding: 10,
		marginHorizontal: 16,
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
});