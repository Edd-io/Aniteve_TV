import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Animated,
	Dimensions,
	DeviceEventEmitter,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RemoteControlKey } from '../../constants/remote_controller';

interface SeasonSelectorProps {
	visible: boolean;
	seasons: string[];
	currentSeason?: string;
	averageColor: number[];
	closePopup: () => void;
	onSeasonSelect: (season: string) => void;
}

export const SeasonSelector: React.FC<SeasonSelectorProps> = ({
	visible,
	seasons,
	currentSeason,
	averageColor,
	closePopup,
	onSeasonSelect,
}) => {
	const screenHeight = Dimensions.get('window').height;
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const scaleAnim = useRef(new Animated.Value(0.9)).current;
	const scrollViewRef = useRef<ScrollView>(null);

	const [selectedIndex, setSelectedIndex] = useState(0);

	useEffect(() => {
		if (visible) {
			if (currentSeason) {
				const currentIndex = seasons.findIndex(season => season === currentSeason);
				if (currentIndex !== -1) {
					setSelectedIndex(currentIndex);
					setTimeout(() => {
						scrollToIndex(currentIndex);
					}, 250);
				} else {
					setSelectedIndex(0);
				}
			} else {
				setSelectedIndex(0);
			}
		}
	}, [visible, currentSeason, seasons]);

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
		const handleRemoteControlEvent = (keyCode: number) => {
			if (keyCode === RemoteControlKey.DPAD_UP) {
				setSelectedIndex(prevIndex => {
					const newIndex = Math.max(prevIndex - 1, 0);
					scrollToIndex(newIndex);
					return newIndex;
				});
			} else if (keyCode === RemoteControlKey.DPAD_DOWN) {
				setSelectedIndex(prevIndex => {
					const newIndex = Math.min(prevIndex + 1, seasons.length - 1);
					scrollToIndex(newIndex);
					return newIndex;
				});
			} else if (keyCode === RemoteControlKey.DPAD_CONFIRM) {
				const selectedSeason = seasons[selectedIndex];
				if (selectedSeason) {
					onSeasonSelect(selectedSeason);
					closePopup();
				}
			} else if (keyCode === RemoteControlKey.BACK) {
				closePopup();
			}
		};

		const subscription = DeviceEventEmitter.addListener('keyPressed', handleRemoteControlEvent);
		return () => subscription.remove();
	}, [visible, selectedIndex, seasons]);

	const scrollToIndex = (index: number) => {
		if (scrollViewRef.current) {
			const itemHeight = 72;
			const containerHeight = 300;
			const offset = index * itemHeight;
			const maxOffset = Math.max(0, (seasons.length * itemHeight) - containerHeight);
			const isLastItem = index === seasons.length - 1;

			const centeredOffset = Math.max(0, offset - (containerHeight / 2) + (itemHeight / 2));
			const finalOffset = Math.min(centeredOffset, maxOffset);

			if (isLastItem) {
				scrollViewRef.current.scrollToEnd({ animated: true });
				return;
			}
			scrollViewRef.current.scrollTo({
				y: finalOffset,
				animated: true
			});
		}
	};

	const formatSeasonName = (season: string) => {
		let indexFirstNb = season.search(/[0-9]/);
		if (indexFirstNb === -1) return season;

		let type = season.substring(0, indexFirstNb).trim();
		if (type.length > 0) {
			type = type[0].toUpperCase() + type.slice(1);
		}
		let number = season.substring(indexFirstNb);

		if (season.includes('film')) {
			return `Film ${number}`;
		}

		return `${type} ${number}`;
	};

	const getSeasonIcon = (season: string) => {
		if (season.includes('film')) {
			return 'movie';
		}
		return 'tv';
	};

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
							maxHeight: screenHeight * 0.7,
							transform: [{ scale: scaleAnim }],
						}
					]}
				>
					<View style={[
						styles.header,
						{ backgroundColor: `rgba(${averageColor.join(',')}, 0.9)` }
					]}>
						<Icon name="tv" size={24} color="#ffffff" />
						<Text style={styles.headerTitle}>Sélectionner une saison</Text>
					</View>

					<ScrollView
						ref={scrollViewRef}
						style={styles.scrollView}
						showsVerticalScrollIndicator={false}
						scrollEnabled={false}
					>
						<View style={styles.seasonsContainer}>
							{seasons.map((season, index) => {
								const isSelected = season === currentSeason;
								const isFocused = index === selectedIndex;

								if (index === 0 || index === 1) {
									console.log(`Season ${index}: isSelected=${isSelected}, isFocused=${isFocused}, selectedIndex=${selectedIndex}`);
								}

								return (
									<TouchableOpacity
										key={index}
										style={[
											styles.seasonItem,
											{
												backgroundColor: isFocused
													? `rgba(${averageColor.join(',')}, 0.6)`
													: 'rgba(30, 30, 30, 0.8)',
												borderColor: isFocused
													? `rgba(${averageColor.join(',')}, 1)`
													: isSelected
														? `rgba(${averageColor.join(',')}, 1)`
														: 'rgba(255, 255, 255, 0.2)',
												transform: isFocused ? [{ scale: 1.02 }] : [{ scale: 1 }],
											}
										]}
									>
										<View style={styles.seasonContent}>
											<Icon
												name={getSeasonIcon(season)}
												size={20}
												color="#ffffff"
												style={styles.seasonIcon}
											/>
											<Text style={[
												styles.seasonText,
											]}>
												{formatSeasonName(season)}
											</Text>
											{isSelected && (
												<Icon name="check" size={20} color="#ffffff" />
											)}
											{isFocused && !isSelected && (
												<Icon name="chevron-right" size={20} color="#ffffff" />
											)}
										</View>
									</TouchableOpacity>
								);
							})}
						</View>
					</ScrollView>

					<View style={styles.footer}>
						<Text style={styles.footerText}>
							{seasons.length} saison{seasons.length > 1 ? 's' : ''} disponible{seasons.length > 1 ? 's' : ''}
						</Text>
					</View>
				</Animated.View>
			</Animated.View>
		</View>
	);
};

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
		width: '100%',
		height: '100%',
		maxWidth: 450,
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
		maxHeight: 300,
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
});
