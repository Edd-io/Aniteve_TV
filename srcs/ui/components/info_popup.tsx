import React, { useRef, useEffect, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Animated,
	Dimensions,
	Image,
	ScrollView,
	DeviceEventEmitter,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getBetterPoster } from '../../utils/get_better_poster';
import { RemoteControlKey } from '../../constants/remote_controller';
import AnimeItem from '../../models/anime_item';

interface InfoPopupProps {
	visible: boolean;
	anime: AnimeItem;
	tmdbData: any;
	averageColor: number[];
	closePopup: () => void;
}

export const InfoPopup: React.FC<InfoPopupProps> = ({
	visible,
	anime,
	tmdbData,
	averageColor,
	closePopup,
}) => {
	const screenHeight = Dimensions.get('window').height;
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const scaleAnim = useRef(new Animated.Value(0.9)).current;

	const scrollViewRef = useRef<ScrollView | null>(null);
	const [_, setOffsetY] = useState(0);
	const [maxScrollY, setMaxScrollY] = useState(0);
	const [scrollViewHeight, setScrollViewHeight] = useState(0);
	const [contentHeight, setContentHeight] = useState(0);
	
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
			if (!visible) return;

			if (keyCode === RemoteControlKey.DPAD_UP) {
				if (scrollViewRef.current) {
					setOffsetY((prev) => {
						const newOffset = Math.max(prev - 100, 0);
						scrollViewRef.current!.scrollTo({ y: newOffset, animated: true });
						return newOffset;
					});
				}
			} else if (keyCode === RemoteControlKey.DPAD_DOWN) {
				if (scrollViewRef.current) {
					setOffsetY((prev) => {
						const newOffset = Math.min(prev + 100, maxScrollY);
						scrollViewRef.current!.scrollTo({ y: newOffset, animated: true });
						return newOffset;
					});
				}
			} else if (keyCode === RemoteControlKey.BACK) {
				closePopup();
			}
		};
		const subscription = DeviceEventEmitter.addListener('keyPressed', handleRemoteControlEvent);
		return () => subscription.remove();
	}, [visible, scrollViewRef]);

	useEffect(() => {
		if (scrollViewHeight > 0 && contentHeight > 0) {
			const maxScroll = Math.max(0, contentHeight - scrollViewHeight);
			setMaxScrollY(maxScroll);
		}
	}, [scrollViewHeight, contentHeight]);

	if (!visible) return null;

	const genres = (
		tmdbData?.genres?.map((g: any) => g.name)
			.filter((name: string) => !['Anime', 'Vostfr', 'Vf'].includes(name))
			.join(', ')
		|| anime?.genres?.map(String).filter((name: string) => !['Anime', 'Vostfr', 'Vf'].includes(name)).join(', ')
	);
	const year = tmdbData?.release_date?.slice(0, 4) || tmdbData?.first_air_date?.slice(0, 4) || 'N/A';
	const rating = tmdbData?.vote_average ? `${tmdbData.vote_average}/10` : 'N/A';
	const overview = tmdbData?.overview || 'Aucune description.';
	const poster = getBetterPoster(tmdbData);
	const originalTitle = tmdbData?.original_title || tmdbData?.original_name || null;
	const popularity = tmdbData?.popularity || null;

	return (
		<View style={[styles.popupContainer, { display: visible ? 'flex' : 'none' }]}
			testID="info-popup-root"
		>
			<Animated.View style={[styles.overlay, { opacity: fadeAnim }]}
			>
				<Animated.View
					style={[
						styles.container,
						{
							maxHeight: screenHeight * 0.9,
							transform: [{ scale: scaleAnim }],
						},
					]}
				>
					<View style={[
						styles.header,
						{ backgroundColor: `rgba(${averageColor.join(',')}, 0.9)` },
					]}>
						<Icon name="info" size={24} color="#fff" />
						<Text style={styles.headerTitle}>Informations</Text>
					</View>
					<View style={{ flex: 1, flexDirection: 'row' }}>
						<ScrollView
							ref={scrollViewRef}
							style={[styles.scrollView, { flex: 1 }]}
							showsVerticalScrollIndicator={false}
							onContentSizeChange={(contentWidth, newContentHeight) => {
								setContentHeight(newContentHeight);
								const maxScroll = Math.max(0, newContentHeight - scrollViewHeight);
								setMaxScrollY(maxScroll);
							}}
							onLayout={(event) => {
								const { height } = event.nativeEvent.layout;
								setScrollViewHeight(height);
								const maxScroll = Math.max(0, contentHeight - height);
								setMaxScrollY(maxScroll);
							}}
						>
							<View style={styles.content}>
								<Text style={styles.title}>{anime?.title || tmdbData?.title || tmdbData?.name}</Text>
								{originalTitle && originalTitle !== (anime?.title || tmdbData?.title || tmdbData?.name) && (
									<Text style={styles.originalTitle}>Titre original : {originalTitle}</Text>
								)}
								<Text style={styles.yearGenre}>{year} • {genres}</Text>
								<Text style={styles.rating}>Note TMDB : {rating}</Text>
								{popularity && (
									<Text style={styles.popularity}>Popularité : {popularity.toFixed(1)}</Text>
								)}
								<Text style={styles.overview}>{overview}</Text>
							</View>

						</ScrollView>
						<View style={{padding: 20, paddingLeft: 0}}>
							{
								poster && (
									<Image
										source={{ uri: poster! }}
										style={{ aspectRatio: 2/3, height: '100%', borderRadius: 10, marginBottom: 20 }}
										resizeMode="cover"
									/>
								)
							}
						</View>
					</View>
					<View style={styles.footer}>
						<Text style={styles.footerText}>Appuyez sur "Retour" pour fermer</Text>
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
		zIndex: 1000,
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
		width: '90%',
		height: '100%',
		overflow: 'hidden',
		elevation: 25,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 15 },
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
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		flex: 1,
		marginLeft: 10,
	},
	scrollView: {
		flex: 1,
	},
	content: {
		padding: 20,
	},
	title: {
		color: '#fff',
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	originalTitle: {
		color: 'rgba(255,255,255,0.6)',
		fontSize: 14,
		fontStyle: 'italic',
		marginBottom: 8,
	},
	yearGenre: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 14,
		marginBottom: 6,
	},
	rating: {
		color: '#e6c300',
		fontSize: 15,
		marginBottom: 10,
	},
	popularity: {
		color: '#00c7e6',
		fontSize: 15,
		marginBottom: 10,
	},
	overview: {
		color: '#fff',
		fontSize: 15,
		marginBottom: 10,
		marginTop: 8,
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
