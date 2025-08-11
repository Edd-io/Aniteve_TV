import React, { FC, useEffect, useRef, useState, useCallback } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	FlatList,
	Animated,
	Dimensions,
	DeviceEventEmitter,
	Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RemoteControlKey } from '../../constants/remote_controller';
import { ProgressData, ProgressStatus } from '../../data/anime_api_service';
import { useFocusEffect } from '@react-navigation/native';

interface ResumeSelectorProps {
	visible: boolean;
	close: () => void;
	navigation: any;
	allProgress: ProgressData[];
}

export const ResumeSelector: FC<ResumeSelectorProps> = ({
	visible,
	close,
	allProgress,
	navigation
}) => {
	const screenHeight = Dimensions.get('window').height;
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const scaleAnim = useRef(new Animated.Value(0.9)).current;
	const flatListRef = useRef<FlatList>(null);
	const filters = useRef<string[]>(['Tous', 'En cours', 'Nouveau épisode', 'Nouvelle saison', 'À jour']);

	const [selectedIndex, setSelectedIndex] = useState(0);
	const [filterFocus, setFilterFocus] = useState(false);
	const [selectedFilter, setSelectedFilter] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);

	const filteredProgress = allProgress.filter(item => {
		if (selectedFilter === 0) return true;
		if (selectedFilter === 1) return item.completed === ProgressStatus.IN_PROGRESS;
		if (selectedFilter === 2) return item.completed === ProgressStatus.NEW_EPISODE;
		if (selectedFilter === 3) return item.completed === ProgressStatus.NEW_SEASON;
		if (selectedFilter === 4) return item.completed === ProgressStatus.UP_TO_DATE;
		return false;
	});

	useEffect(() => {
		if (visible) {
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 200,
					useNativeDriver: true,
				}),
				Animated.spring(scaleAnim, {
					toValue: 1,
					tension: 100,
					friction: 8,
					useNativeDriver: true,
				}),
			]).start();
		} else {
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 0,
					duration: 150,
					useNativeDriver: true,
				}),
				Animated.timing(scaleAnim, {
					toValue: 0.9,
					duration: 150,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [visible]);
	useEffect(() => {
		if (
			flatListRef.current &&
			filteredProgress.length > 0 &&
			visible &&
			selectedIndex >= 0 &&
			selectedIndex < filteredProgress.length
		) {
			flatListRef.current.scrollToIndex({
				index: selectedIndex,
				animated: true,
				viewPosition: 0.5,
			});
		}
	}, [selectedIndex, filteredProgress.length, visible]);

	useEffect(() => {
		setSelectedIndex(0);
	}, [selectedFilter]);

	useFocusEffect(
		useCallback(() => {
			const handleRemoteControlEvent = (keyCode: number) => {
				if (!visible) return;
				if (keyCode === RemoteControlKey.DPAD_UP) {
					if (!filterFocus) {
						setFilterFocus(true);
						setSelectedIndex(0);
					}
				} else if (keyCode === RemoteControlKey.DPAD_DOWN) {
					if (filterFocus) {
						setSelectedIndex(0);
						setFilterFocus(false);
					}
				} else if (keyCode === RemoteControlKey.DPAD_LEFT) {
					if (filterFocus) {
						setSelectedFilter(prev => (prev > 0 ? prev - 1 : filters.current.length - 1));
					} else {
						setSelectedIndex(prevIndex => Math.max(prevIndex - 1, 0));
					}
				} else if (keyCode === RemoteControlKey.DPAD_RIGHT) {
					if (filterFocus) {
						setSelectedFilter(prev => (prev < filters.current.length - 1 ? prev + 1 : 0));
					} else {
						setSelectedIndex(prevIndex => Math.min(prevIndex + 1, filteredProgress.length - 1));
					}
				} else if (keyCode === RemoteControlKey.DPAD_CONFIRM) {
					if (filterFocus) {
						setFilterFocus(false);
					} else {
						const selectedAnime = filteredProgress[selectedIndex]?.anime;
						console.log('Selected Anime:', selectedAnime);
						if (selectedAnime) {
							navigation.navigate('Anime', { anime: selectedAnime });
						}
					}

				} else if (keyCode === RemoteControlKey.BACK) {
					close();
				}
			};

			const subscription = DeviceEventEmitter.addListener('keyPressed', handleRemoteControlEvent);
			return () => subscription.remove();
		}, [visible, selectedIndex, filterFocus, filteredProgress.length])
	);

	return (
		<View
			style={[styles.popupContainer, { display: visible ? 'flex' : 'none' }]}
		>
			<Animated.View
				style={[
					styles.overlay,
					{
						opacity: fadeAnim,
					}
				]}
			>
				<Animated.View
					style={[
						styles.container,
						{
							maxHeight: screenHeight * 0.8,
							transform: [{ scale: scaleAnim }],
						}
					]}
				>
					<View style={[
						styles.header,
						{ backgroundColor: `rgba(15, 15, 15, 0.98)` }
					]}>
						<Icon name="play-arrow" size={24} color="#ffffff" />
						<Text style={styles.headerTitle}>Reprendre</Text>
					</View>
					{error ? (
						<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
							<Text style={{ color: '#fff', opacity: 0.7 }}>{error}</Text>
						</View>
					) : (
						<View style={styles.scrollView}>
							<View style={styles.filterContainer}>
								<View style={{ borderRightWidth: 1, borderRightColor: 'rgba(255, 255, 255, 0.1)', paddingRight: 10, paddingLeft: 10, alignSelf: 'center', marginRight: 10 }}>
									<Text style={{ color: '#fff', opacity: 0.7 }}>
										Filtrer
									</Text>
								</View>
								<FlatList
									data={filters.current}
									horizontal
									renderItem={({ item, index }) => (
										<TouchableOpacity
											style={[
												styles.filterItem,
												selectedFilter === index ? styles.filterSelected : {},
												filterFocus && selectedFilter === index ? { backgroundColor: 'rgba(255, 255, 255, 0.57)' } : {}
											]}
										>
											<Text style={styles.filterText}>{item}</Text>
										</TouchableOpacity>
									)}
									keyExtractor={(item) => item}
									scrollEnabled={false}
								/>
							</View>
							<FlatList
								ref={flatListRef}
								data={filteredProgress}
								horizontal
								keyExtractor={(item) => item.anime.id.toString()}
								renderItem={({ item, index }) => (
									<AnimeElement
										progress={item}
										isSelected={(selectedIndex === index) && !filterFocus}
										isLast={index === filteredProgress.length - 1}
									/>
								)}
								showsHorizontalScrollIndicator={false}
								style={{ flex: 1, padding: 10 }}
								scrollEnabled={false}
							/>
						</View>
					)}
					<View style={styles.footer}>
						<Text style={styles.footerText}>
							Appuyez sur "Retour" pour fermer la sélection, "OK" pour valider.
						</Text>
					</View>
				</Animated.View>
			</Animated.View>
		</View>
	);
};

const AnimeElement = React.memo(function AnimeElement({ progress, isSelected, isLast }: { progress: ProgressData; isSelected: boolean; isLast: boolean }) {
	return (
		<TouchableOpacity
			style={[
				styles.elementContainer,
				{
					backgroundColor: isSelected ? `rgba(95, 95, 95, 0.38)` : 'rgba(28, 28, 28, 0.8)',
				},
				isLast ? { marginRight: 25 } : {},
				isSelected ? { transform: [{ scale: 1.02 }] } : { opacity: 0.7 },
			]}
		>
			<Image
				source={{ uri: String(progress.poster || progress.anime.img), cache: 'force-cache' }}
				style={styles.elementImage}
				resizeMode="cover"
			/>
		</TouchableOpacity>
	);
});


const styles = StyleSheet.create({
	popupContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(0, 0, 0, 0.50)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	overlay: {
		backgroundColor: 'rgba(0, 0, 0, 0.85)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 1,
		borderRadius: 20,
	},
	container: {
		backgroundColor: 'rgba(15, 15, 15, 0.98)',
		borderRadius: 20,
		width: '80%',
		height: '100%',
		overflow: 'hidden',
		elevation: 25,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 15,
		},
		shadowOpacity: 0.4,
		shadowRadius: 20,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.1)',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
	},
	headerTitle: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: 'bold',
		flex: 1,
		marginLeft: 10,
	},
	headerHint: {
		flex: 1,
		alignItems: 'flex-end',
	},
	hintText: {
		color: 'rgba(255, 255, 255, 0.8)',
		fontSize: 12,
		fontWeight: '500',
	},
	closeButton: {
		padding: 5,
	},
	scrollView: {
		flexDirection: 'column',
		flex: 1,
	},
	seasonsContainer: {
		padding: 15,
	},
	seasonItem: {
		borderRadius: 12,
		marginBottom: 12,
		borderWidth: 2,
		overflow: 'hidden',
		backgroundColor: 'rgba(30, 30, 30, 0.8)',
		minHeight: 60,
	},
	seasonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 18,
		paddingVertical: 16,
		minHeight: 56,
	},
	seasonIcon: {
		marginRight: 12,
	},
	seasonText: {
		color: '#ffffff',
		fontSize: 16,
		flex: 1,
	},
	footer: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderTopWidth: 1,
		borderTopColor: 'rgba(255, 255, 255, 0.1)',
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
	},
	footerText: {
		color: 'rgba(255, 255, 255, 0.7)',
		fontSize: 12,
		textAlign: 'center',
	},

	elementContainer: {
		aspectRatio: 2 / 3,
		flex: 1,
		backgroundColor: 'rgba(171, 27, 27, 0.8)',
		height: "100%",
		marginRight: 10,
		borderRadius: 10,
	},
	elementImage: {
		flex: 2,
		borderRadius: 10,
		overflow: 'hidden',
		width: '100%',
		height: '100%',
		opacity: 0.8,
	},
	elementContent: {
		flex: 1,
		padding: 10,
	},
	filterContainer: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		padding: 5,
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
	},
	filterItem: {
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 12,
		marginRight: 10,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
	},
	filterText: {
		color: '#ffffff',
		fontSize: 14,
		fontWeight: '500',
	},
	filterSelected: {
		backgroundColor: 'rgba(255, 255, 255, 0.3)',
	},
});
