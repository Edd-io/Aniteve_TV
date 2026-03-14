import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Platform, Vibration, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import AnimeItem from '../../models/anime_item';
import { AnimeCardProps } from '../../types/home';

export const AnimeCardPhone: React.FC<AnimeCardProps> = ({ item, onPress, list = false }) => {
    const anime: AnimeItem = 'anime' in item ? item.anime : item;
    const img: String | undefined = 'poster' in item ? item.poster : anime.img;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 20,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
        }).start();
    };

    if (list) {
        const genres = (anime.genres || []).slice(0, 3).map(g => String(g)).join(', ');
        return (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={() => { Vibration.vibrate(40); onPress && onPress(anime) }}
                    style={styles.rowContainer}
                    android_ripple={{ color: '#222' }}
                >
                    <View style={styles.rowImageWrapper}>
                        {img && String(img) !== 'null' ? (
                            <Image source={{ uri: String(img) }} style={styles.rowImage} />
                        ) : (
                            <View style={[styles.rowImage, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                                <Icon name="image-not-supported" size={24} color="#666" />
                            </View>
                        )}
                    </View>
                    <View style={styles.rowInfo} pointerEvents="none">
                        <Text style={styles.rowTitle} numberOfLines={2}>{String(anime.title)}</Text>
                        {anime.alternativeTitle ? <Text style={styles.rowSubtitle} numberOfLines={1}>{String(anime.alternativeTitle)}</Text> : null}
                        {genres ? <Text style={styles.rowGenres} numberOfLines={1}>{genres}</Text> : null}
                    </View>
                    <Icon name="chevron-right" size={28} color="#8a8a8a" />
                </Pressable>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => { Vibration.vibrate(40); onPress && onPress(anime) }}
                style={[styles.container, styles.large]}
                android_ripple={{ color: '#222' }}
            >
                {img && String(img) !== 'null' ? (
                    <Image source={{ uri: String(img) }} style={styles.image} />
                ) : (
                    <View style={[styles.image, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                        <Icon name="image-not-supported" size={32} color="#666" />
                    </View>
                )}
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={styles.gradient} />
                <View style={styles.info} pointerEvents="none">
                    <Text style={styles.title} numberOfLines={2}>{String(anime.title)}</Text>
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#0b0b0b',
        marginRight: 12,
    },
    large: {
        height: 250,
    },
    image: {
        aspectRatio: 2 / 3,
        height: '100%'
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 100,
    },
    rowImageWrapper: {
        width: 136,
        height: 136,
        borderRadius: 8,
        marginRight: 14,
        backgroundColor: '#111',
        overflow: 'hidden',
        position: 'relative'
    },
    info: {
        position: 'absolute',
        left: 8,
        right: 8,
        bottom: 8,
    },
    title: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#0f0f0f',
        marginBottom: 12,
        overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
            android: { elevation: 3 }
        })
    },
    rowImage: {
        width: '100%',
        height: '100%',
        borderRadius: 0,
        backgroundColor: '#111'
    },
    rowGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 80,
    },
    rowInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    rowTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    rowSubtitle: {
        color: '#cfcfcf',
        fontSize: 13,
        marginBottom: 6,
    },
    rowGenres: {
        color: '#9b9b9b',
        fontSize: 12,
    }
});
