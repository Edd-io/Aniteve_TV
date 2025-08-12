import React, { useState, useRef, useEffect, JSX } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Animated, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import AnimeItem from '../../models/anime_item';
import { AnimeApiService } from '../../data/anime_api_service';
import { Colors } from '../../constants/colors';
import { SelectedPart } from '../../types/home';

const { width } = Dimensions.get('window');
const itemsPerRow = 4;
const containerPadding = 16;
const itemMargin = 8;
const itemWidth = (width - containerPadding * 2 - itemMargin * 2 * itemsPerRow) / itemsPerRow;

import { ListAnimeProps } from '../../types/components';

export function ListAnime({ 
   selectedPart, 
   indexItem, 
   animeList, 
   setAnimeList,
   isLoading = false,
   isSearchActive = false,
   setIsLoading = () => {}
}: ListAnimeProps): JSX.Element {
	const flatListRef = useRef<FlatList>(null);
	const apiService = AnimeApiService.getInstance();

	const currentFocusedIndex = indexItem;
	const isSelected = selectedPart === SelectedPart.ANIME_LIST;

	useEffect(() => {
		setIsLoading(true);
		let isMounted = true;
		const controller = new AbortController();

		apiService.fetchAllAnime({ signal: controller.signal })
			.then(list => {
				if (isMounted) {
					setAnimeList(list);
				}
			})
			.catch(err => {
				if (isMounted) {
					console.warn('Failed to load anime list', err);
					setAnimeList([]);
				}
			})
			.finally(() => {
				setIsLoading(false);
			});

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, []);

	useEffect(() => {
		if (isSelected && flatListRef.current) {
			const currentRow = Math.floor(currentFocusedIndex / itemsPerRow);
			const itemHeight = (itemWidth * 0.6) + 16;
			const offset = currentRow * itemHeight - (itemHeight / 2);

			flatListRef.current.scrollToOffset({
				offset: Math.max(0, offset),
				animated: true
			});
		}
	}, [indexItem, isSelected]);

	return (
		<View style={styles.container}>
			{
				isLoading ? (
					<View style={styles.centerContainer}>
						<ActivityIndicator size="large" color={Colors.primary} />
						<Text style={styles.loadingText}>Chargement des animes...</Text>
					</View>
				) : 
				isSearchActive && animeList.length === 0 ? (
					<View style={styles.centerContainer}>
						<Text style={styles.noResultsText}>Aucun résultat trouvé</Text>
						<Text style={styles.noResultsSubtext}>Essayez avec un autre terme de recherche</Text>
					</View>
				) : 
				!isSearchActive && animeList.length === 0 ? (
					<View style={styles.centerContainer}>
						<Text style={styles.noResultsText}>Aucun anime disponible</Text>
					</View>
				) : (
					<FlatList
						ref={flatListRef}
						data={animeList}
						renderItem={({ item, index }) => (
							<AnimeItemComponent
								item={item}
								index={index}
								isFocused={isSelected && index === currentFocusedIndex}
							/>
						)}
						keyExtractor={(item) => item.id.toString()}
						contentContainerStyle={styles.flatListContent}
						showsVerticalScrollIndicator={false}
						showsHorizontalScrollIndicator={false}
						numColumns={4}
						scrollEnabled={true}
						initialNumToRender={16}
						maxToRenderPerBatch={16}
						windowSize={10}
						updateCellsBatchingPeriod={50}
					/>
				)
			}
		</View>
	);
}

const AnimeItemComponent = React.memo(({
	item,
	index,
	isFocused = false
}: {
	item: AnimeItem,
	index: number,
	isFocused?: boolean
}) => {
	const scaleValue = useRef(new Animated.Value(1)).current;
	const imageOpacity = useRef(new Animated.Value(0.7)).current;
	const [imageLoaded, setImageLoaded] = useState(false);
	const [shouldLoadImage, setShouldLoadImage] = useState(index < 12);

	useEffect(() => {
		if (!shouldLoadImage && index >= 12) {
			const timer = setTimeout(() => {
				setShouldLoadImage(true);
			}, index * 50);
			return () => clearTimeout(timer);
		}
	}, [index, shouldLoadImage]);

	useEffect(() => {
		if (isFocused) {
			Animated.parallel([
				Animated.spring(scaleValue, {
					toValue: 1.07,
					useNativeDriver: true,
					tension: 50,
					friction: 8,
				}),
				Animated.timing(imageOpacity, {
					toValue: 1,
					duration: 100,
					useNativeDriver: true,
				}),
			]).start();
		} else {
			Animated.parallel([
				Animated.spring(scaleValue, {
					toValue: 1,
					useNativeDriver: true,
					tension: 50,
					friction: 8,
				}),
				Animated.timing(imageOpacity, {
					toValue: 0.7,
					duration: 100,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [isFocused, scaleValue, imageOpacity]);

	return (
		<TouchableOpacity
			style={{ margin: 0 }}
			accessible={false}
			focusable={false}
			importantForAccessibility="no"
			hasTVPreferredFocus={false}
		>
			<Animated.View
				style={[
					styles.animeItem,
					{
						transform: [{ scale: scaleValue }],
					}
				]}
			>
				{!imageLoaded && (
					<View style={styles.imagePlaceholder}>
						<ActivityIndicator size="small" color={Colors.primary} />
					</View>
				)}
				{shouldLoadImage && (
					<Animated.Image
						source={{ uri: item.img.toString(), cache: 'force-cache' }}
						style={[
							styles.animeImage,
							{
								opacity: imageLoaded ? imageOpacity : 0,
							}
						]}
						onLoad={() => setImageLoaded(true)}
						fadeDuration={300}
						resizeMode="cover"
					/>
				)}
			</Animated.View>
		</TouchableOpacity>
	);
});

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: containerPadding,
		flex: 1,
	},
	flatListContent: {
		paddingBottom: 120,
	},
	animeItem: {
		width: itemWidth,
		height: itemWidth * 0.6,
		marginHorizontal: itemMargin,
		marginVertical: 8,
		borderRadius: 8,
		overflow: 'hidden',
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		position: 'relative',
	},
	animeImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	imagePlaceholder: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		backgroundColor: '#1a1a1a',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1,
	},
	centerContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 40,
	},
	loadingText: {
		color: '#fff',
		fontSize: 16,
		marginTop: 16,
		textAlign: 'center',
	},
	noResultsText: {
		color: '#fff',
		fontSize: 20,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 8,
	},
	noResultsSubtext: {
		color: '#ccc',
		fontSize: 14,
		textAlign: 'center',
	},
});
