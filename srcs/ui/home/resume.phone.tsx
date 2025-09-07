import React from 'react';
import { View, Text, StyleSheet, SectionList, Image, Pressable } from 'react-native';
import { ProgressData, ProgressStatus } from '../../types/progress';
import AnimeItem from '../../models/anime_item';
import { Colors } from '../../constants/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ResumePhoneProps } from '../../types/home';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ResumePhone: React.FC<ResumePhoneProps> = ({ progressList, onSelectAnime }) => {
	const insets = useSafeAreaInsets();
	
	const inProgress = progressList.filter(p => p.completed === ProgressStatus.IN_PROGRESS);
	const newEpisode = progressList.filter(p => p.completed === ProgressStatus.NEW_EPISODE);
	const newSeason = progressList.filter(p => p.completed === ProgressStatus.NEW_SEASON);
	const upToDate = progressList.filter(p => p.completed === ProgressStatus.UP_TO_DATE);

	const sections = [
		{ title: 'En cours', data: inProgress },
		{ title: 'Nouvel épisode', data: newEpisode },
		{ title: 'Nouvelle saison', data: newSeason },
		{ title: 'À jour', data: upToDate },
	];

	const renderSectionHeader = ({ section }: { section: { title: string; data: ProgressData[] } }) => (
		<View style={styles.section}>
			<Text style={styles.sectionTitle}>{section.title}</Text>
			{section.data.length === 0 && <Text style={styles.emptyText}>Aucun élément</Text>}
		</View>
	);

	const renderItem = ({ item }: { item: ProgressData }) => (
		<ResumeItem item={item} onPress={onSelectAnime} />
	);

	return (
		<>
			<SectionList
				style={[styles.container]}
				sections={sections}
				keyExtractor={(item) => `${item.anime.id}`}
				renderItem={renderItem}
				renderSectionHeader={renderSectionHeader}
				stickySectionHeadersEnabled={false}
				ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
				ListEmptyComponent={() => <View style={{ padding: 16 }}><Text style={styles.emptyText}>Aucun élément</Text></View>}
			/>
			<View style={{ height: insets.bottom, backgroundColor: Colors.background }} />
		</>
	);
};

const ResumeItem: React.FC<{ item: ProgressData; onPress?: (a: AnimeItem) => void }> = ({ item, onPress }) => {
	const seasonName = item.season_name ?? item.season.split('/')[0];
	const lang = (item.lang ?? item.season.split('/')[1]).toUpperCase();

	return (
		<Pressable onPress={() => onPress && onPress(item.anime)} style={styles.item} android_ripple={{ color: '#222' }}>
			<Image source={{ uri: String(item.poster) }} style={styles.poster} />
			<View style={styles.info}>
				<Text style={styles.title} numberOfLines={2}>{String(item.anime.title)}</Text>
				<Text style={styles.meta}>{seasonName} • Ep {String(item.episode)} ({lang})</Text>
				{item.completed === 0 && (
					<View style={styles.progressRow}>
						<View style={[styles.progressBar, { width: `${Math.min(100, (item.progress))}%` }]} />
					</View>
				)}
			</View>
			<Icon name="chevron-right" size={26} color="#8a8a8a" />
		</Pressable>
	);
};


const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
		paddingHorizontal: 14
	},
	section: {
		marginBottom: 18
	},
	sectionTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '700',
		marginTop: 20,
	},
	emptyText: {
		color: '#9b9b9b'
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderRadius: 10,
		backgroundColor: '#0f0f0f',
		marginBottom: 8,
		overflow: 'hidden'
	},
	poster: {
		width: 92,
		height: 120,
		borderRadius: 6,
		marginRight: 12,
		backgroundColor: '#111'
	},
	info: {
		flex: 1
	},
	title: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '700',
		marginBottom: 6
	},
	meta: {
		color: '#cfcfcf',
		fontSize: 13,
		marginBottom: 8
	},
	progressRow: {
		marginTop: 4,
		height: 15,
		backgroundColor: '#2d2d2dff',
		borderRadius: 6,
		overflow: 'hidden',
		flexDirection: 'row',
		alignItems: 'center'
	},
	progressBar: {
		height: '100%',
		backgroundColor: Colors.getPrimaryColor()
	},
	progressText: {
		color: '#9b9b9b',
		fontSize: 12,
		marginLeft: 8,
		paddingLeft: 8
	}
});

export default ResumePhone;
