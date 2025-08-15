import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, FlatList, Pressable, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';
import TopBarPhone from '../components/topbar.phone';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AnimeItem from '../../models/anime_item';
import { ProgressData } from '../../types/progress';
import { AnimeCardPhone } from '../components/anime_card.phone';
import { SectionHeaderPhone } from '../components/section_header.phone';
import { HomeMobileProps } from '../../types/home';

export const HomePhone: React.FC<HomeMobileProps> = ({ animeList, allProgress, isLoading, isGlobalLoading, searchValue, setSearchValue, onRefresh, onSelectAnime, onOpenSettings, onOpenChooseUser, onOpenResume }) => {
    const navigation: any = useNavigation();
    const [page, setPage] = useState<number>(1);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const pageSize = 50;

    useEffect(() => {
        setPage(1);
    }, [animeList, searchValue]);

    const paginatedAnimes = animeList.slice(0, page * pageSize);

    const handleEndReached = () => {
        if (isLoadingMore) return;
        if (paginatedAnimes.length < animeList.length) {
            setIsLoadingMore(true);
            setPage((p) => p + 1);
            setTimeout(() => setIsLoadingMore(false), 300);
        }
    };

    return (
        <View style={styles.container}>
            <TopBarPhone onResume={onOpenResume} onChooseUser={onOpenChooseUser} onSettings={onOpenSettings} />

            {isLoading && animeList.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.getPrimaryColor()} />
                </View>
            ) : (
                <FlatList
                    data={paginatedAnimes}
                    keyExtractor={(it) => it.id.toString()}
                    renderItem={({ item }) => <AnimeCardPhone item={item} onPress={onSelectAnime} list />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 8, paddingBottom: 120 }}
                    refreshControl={<RefreshControl refreshing={isGlobalLoading} onRefresh={onRefresh} tintColor={Colors.getPrimaryColor()} />}
                    onEndReached={handleEndReached}
                    onEndReachedThreshold={0.5}
                    ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                    ListFooterComponent={isLoadingMore ? <ActivityIndicator color={Colors.getPrimaryColor()} style={{ marginVertical: 12 }} /> : null}
                    ListHeaderComponent={() => (
                        <>
                            <View style={styles.searchRow}>
                                <Icon name="search" size={20} color="#999" style={{ marginRight: 8 }} />
                                <TextInput
                                    placeholder="Rechercher un anime"
                                    placeholderTextColor="#999"
                                    style={styles.searchInput}
                                    value={searchValue}
                                    onChangeText={(text) => {
                                        setSearchValue(text);
                                    }}
                                    clearButtonMode="while-editing"
                                    returnKeyType="search"
                                />
                            </View>

                            {allProgress && allProgress.length > 0 ? (
                                <>
                                    <SectionHeaderPhone title="Continuer" onSeeAll={() => {
                                        navigation && navigation.navigate && navigation.navigate('Resume', {
                                            progressList: allProgress,
                                        });
                                    }} />
                                    <FlatList
                                        data={allProgress.filter(item => item.completed !== 1)}
                                        keyExtractor={(it) => `${it.anime.id}`}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        renderItem={({ item }) => <AnimeCardPhone item={item} onPress={() => onSelectAnime(item.anime)} />}
                                        contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 4 }}
                                    />
                                </>
                            ) : null}

                            <SectionHeaderPhone title="Tous les animes" onSeeAll={undefined} />
                        </>
                    )}
                    ListEmptyComponent={
                        !isLoading ? (
                            <View style={{ paddingVertical: 18, alignItems: 'center' }}>
                                <Text style={{ color: '#9b9b9b' }}>Aucun anime disponible.</Text>
                            </View>
                        ) : null
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 14
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    logo: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700'
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 8
    },
    iconBtn: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f0f0f',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 12
    },
    searchInput: {
        color: '#fff',
        flex: 1,
        fontSize: 14
    },
    featured: {
        height: 160,
        marginBottom: 12
    },
    featuredBg: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 12
    },
    featuredOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)'
    },
    featuredContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    playButton: {
        backgroundColor: '#fff',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center'
    },
    featuredTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700'
    },
    animeCard: {
        flexDirection: 'row',
        marginBottom: 12,
        backgroundColor: '#0b0b0b',
        borderRadius: 10,
        overflow: 'hidden'
    },
    poster: {
        width: 120,
        height: 160
    },
    animeInfo: {
        flex: 1,
        padding: 10,
        justifyContent: 'center'
    },
    animeTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6
    },
    animeProgress: {
        color: '#9b9b9b',
        fontSize: 12
    },
});

export default HomePhone;
