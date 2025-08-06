import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Animated, TouchableOpacity, TVEventHandler } from 'react-native';
import AnimeItem from '../../models/anime_item';
import { allAnime } from '../../data/mockData';

const { width } = Dimensions.get('window');
const itemsPerRow = 4;
const containerPadding = 16;
const itemMargin = 8;
const itemWidth = (width - containerPadding * 2 - itemMargin * 2 * itemsPerRow) / itemsPerRow;

export function ListAnime({ header }: { header?: React.JSX.Element }): React.JSX.Element {
	const [focusedIndex, setFocusedIndex] = useState(0);
	const flatListRef = useRef<FlatList>(null);

	useEffect(() => {
		const subscription = TVEventHandler.addListener((data: any) => {
			if (data && data.eventType) {
				switch (data.eventType) {
					case 'right':
						setFocusedIndex(prev => Math.min(prev + 1, allAnime.length - 1));
						break;
					case 'left':
						setFocusedIndex(prev => Math.max(prev - 1, 0));
						break;
					case 'down':
						setFocusedIndex(prev => Math.min(prev + itemsPerRow, allAnime.length - 1));
						break;
					case 'up':
						setFocusedIndex(prev => Math.max(prev - itemsPerRow, 0));
						break;
				}
			}
		});

		return () => {
			subscription?.remove();
		};
	}, []);

	useEffect(() => {
		if (flatListRef.current) {
			const row = Math.floor(focusedIndex / itemsPerRow);
			const itemHeight = itemWidth * 0.6 + 16;
			const targetOffset = row * itemHeight;

			flatListRef.current.scrollToOffset({
				offset: Math.max(0, targetOffset - 100),
				animated: true,
			});
		}
	}, [focusedIndex]);

	return (
		<View style={styles.container}>
			<FlatList
				ref={flatListRef}
				data={allAnime}
				ListHeaderComponent={header}
				renderItem={({ item, index }) => (
					<AnimeItemComponent
						item={item}
						index={index}
						isFocused={index === focusedIndex}
					/>
				)}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.flatListContent}
				showsVerticalScrollIndicator={false}
				showsHorizontalScrollIndicator={false}
				numColumns={4}
				scrollEnabled={false}
				pointerEvents="none"
			/>
		</View>
	);
}

const AnimeItemComponent = React.memo(({
	item,
	index,
	isFocused
}: {
	item: AnimeItem,
	index: number,
	isFocused: boolean
}) => {
	const scaleValue = useRef(new Animated.Value(1)).current;
	const imageOpacity = useRef(new Animated.Value(0.7)).current;

	useEffect(() => {
		if (isFocused) {
			Animated.parallel([
				Animated.spring(scaleValue, {
					toValue: 1.05,
					useNativeDriver: true,
					tension: 100,
					friction: 8,
				}),
				Animated.timing(imageOpacity, {
					toValue: 1,
					duration: 150,
					useNativeDriver: true,
				}),
			]).start();
		} else {
			Animated.parallel([
				Animated.spring(scaleValue, {
					toValue: 1,
					useNativeDriver: true,
					tension: 100,
					friction: 8,
				}),
				Animated.timing(imageOpacity, {
					toValue: 0.7,
					duration: 150,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [isFocused, scaleValue, imageOpacity]);

	return (
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
