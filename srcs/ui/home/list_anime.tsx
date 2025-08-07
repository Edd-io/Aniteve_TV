import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import AnimeItem from '../../models/anime_item';
import { allAnime } from '../../data/mockData';

const { width } = Dimensions.get('window');
const itemsPerRow = 4;
const containerPadding = 16;
const itemMargin = 8;
const itemWidth = (width - containerPadding * 2 - itemMargin * 2 * itemsPerRow) / itemsPerRow;

export function ListAnime({ header }: { header?: React.JSX.Element }): React.JSX.Element {
	const flatListRef = useRef<FlatList>(null);
	const [currentFocusedIndex, setCurrentFocusedIndex] = useState(0);

	// useEffect(() => {
	// 	const tvEventHandler = TVEventHandler.addListener((event) => {
			
	// 		if (!event || !flatListRef.current) return;
	// 		if (event && event.eventType === 'down') {
	// 			setCurrentFocusedIndex(prev => {
	// 				const nextIndex = Math.min(prev + itemsPerRow, allAnime.length - 1);
	// 				const nextRow = Math.floor(nextIndex / itemsPerRow);
	// 				const currentRow = Math.floor(prev / itemsPerRow);
					
	// 				if (nextRow > currentRow) {
	// 					setTimeout(() => {
	// 						const itemHeight = (itemWidth * 0.6) + 16;
	// 						const offset = nextRow * itemHeight - 100;
	// 						flatListRef.current?.scrollToOffset({
	// 							offset: Math.max(0, offset),
	// 							animated: true
	// 						});
	// 					}, 10);
	// 				}
					
	// 				return nextIndex;
	// 			});
	// 		} else if (event && event.eventType === 'up') {
	// 			setCurrentFocusedIndex(prev => {
	// 				const nextIndex = Math.max(prev - itemsPerRow, 0);
	// 				const nextRow = Math.floor(nextIndex / itemsPerRow);
	// 				const currentRow = Math.floor(prev / itemsPerRow);
					
	// 				if (nextRow < currentRow) {
	// 					setTimeout(() => {
	// 						const itemHeight = (itemWidth * 0.6) + 16;
	// 						const offset = nextRow * itemHeight - 100;
	// 						flatListRef.current?.scrollToOffset({
	// 							offset: Math.max(0, offset),
	// 							animated: true
	// 						});
	// 					}, 10);
	// 				}
					
	// 				return nextIndex;
	// 			});
	// 		} else if (event && event.eventType === 'right') {
	// 			setCurrentFocusedIndex(prev => Math.min(prev + 1, allAnime.length - 1));
	// 		} else if (event && event.eventType === 'left') {
	// 			setCurrentFocusedIndex(prev => Math.max(prev - 1, 0));
	// 		}
	// 	});

	// 	return () => {
	// 		if (tvEventHandler && tvEventHandler.remove) {
	// 			tvEventHandler.remove();
	// 		}
	// 	};
	// }, []);

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
						isFirst={index === 0}
						isFocused={index === currentFocusedIndex}
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
