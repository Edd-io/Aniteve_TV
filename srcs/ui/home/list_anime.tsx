import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import AnimeItem from '../../models/anime_item';
import Secrets from '../../constants/secrets';
import { SelectedPart } from './home';
import { fetchAllAnime } from '../../data/anime_api';

const { width } = Dimensions.get('window');
const itemsPerRow = 4;
const containerPadding = 16;
const itemMargin = 8;
const itemWidth = (width - containerPadding * 2 - itemMargin * 2 * itemsPerRow) / itemsPerRow;

export function ListAnime({ selectedPart, indexItem, animeList, setAnimeList }: { selectedPart: SelectedPart, indexItem: number, animeList: AnimeItem[], setAnimeList: React.Dispatch<React.SetStateAction<AnimeItem[]>> }): React.JSX.Element {
	const flatListRef = useRef<FlatList>(null);
	
	const currentFocusedIndex = indexItem;
	
	const isSelected = selectedPart === SelectedPart.ANIME_LIST;

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();

		fetchAllAnime({ signal: controller.signal })
			.then(list => { if (isMounted) setAnimeList(list); })
			.catch(err => { if (isMounted) { console.warn('Failed to load anime list', err); setAnimeList([]); } });

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
			<FlatList
				ref={flatListRef}
				data={animeList}
				renderItem={({ item, index }) => (
					<AnimeItemComponent
						item={item}
						index={index}
						isFirst={index === 0}
						isFocused={isSelected && index === currentFocusedIndex}
					/>
				)}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.flatListContent}
				showsVerticalScrollIndicator={false}
				showsHorizontalScrollIndicator={false}
				numColumns={4}
				scrollEnabled={true}
			/>
		</View>
	);
}

const AnimeItemComponent = React.memo(({
	item,
	index,
	isFirst,
	isFocused = false
}: {
	item: AnimeItem,
	index: number,
	isFirst?: boolean,
	isFocused?: boolean
}) => {
	const scaleValue = useRef(new Animated.Value(1)).current;
	const imageOpacity = useRef(new Animated.Value(0.7)).current;

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
				<Animated.Image
					source={{ uri: item.img.toString() }}
					style={[
						styles.animeImage,
						{
							opacity: imageOpacity,
						}
					]}
				/>
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
	},
	animeImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
});
