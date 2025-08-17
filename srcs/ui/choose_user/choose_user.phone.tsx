import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, RefreshControl, ActivityIndicator, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { User } from '../../types/user';
import { Colors } from '../../constants/colors';

type Props = {
    users: User[];
    isLoadingUsers: boolean;
    selectUser: (user: User) => void;
    fetchUsers: () => Promise<void>;
    onAddUserPress: () => void;
};

export const ChooseUserPhone: React.FC<Props> = ({ users, isLoadingUsers, selectUser, fetchUsers, onAddUserPress }) => {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        if (!query.trim()) return users;
        const q = query.toLowerCase();
        return users.filter(u => u.name.toLowerCase().includes(q));
    }, [users, query]);

    const renderItem = ({ item }: { item: User }) => (
        <Pressable style={styles.card} onPress={() => selectUser(item)}>
            <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
            </View>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        </Pressable>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.title}>Choisir un utilisateur</Text>
                        <Text style={styles.subtitle}>{users.length} utilisateur(s)</Text>
                    </View>

                    <Pressable style={styles.addButton} onPress={onAddUserPress}>
                        <Icon name="person-add" size={20} color="#fff" />
                    </Pressable>
                </View>

                <View style={styles.searchRow}>
                    <Icon name="search" size={20} color="#999" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un utilisateur"
                        placeholderTextColor="#999"
                        value={query}
                        onChangeText={setQuery}
                    />
                </View>

                {isLoadingUsers && users.length === 0 ? (
                    <View style={{ paddingTop: 20 }}>
                        <ActivityIndicator size="large" color={Colors.getPrimaryColor()} />
                    </View>
                ) : (
                    filtered.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
                            <Pressable style={styles.emptyAdd} onPress={onAddUserPress}>
                                <Text style={styles.emptyAddText}>Ajouter un utilisateur</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <FlatList
                            data={filtered}
                            keyExtractor={(it) => it.id.toString()}
                            renderItem={renderItem}
                            numColumns={2}
                            columnWrapperStyle={styles.column}
                            contentContainerStyle={styles.listContent}
                            refreshControl={<RefreshControl refreshing={isLoadingUsers} onRefresh={fetchUsers} tintColor={Colors.getPrimaryColor()} />}
                        />
                    )
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 18,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    title: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
    },
    subtitle: {
        color: '#8a8a8a',
        fontSize: 12,
        marginTop: 4,
    },
    addButton: {
        backgroundColor: Colors.getPrimaryColor(),
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 4,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f0f0f',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 14,
    },
    searchInput: {
        color: '#fff',
        flex: 1,
        fontSize: 14,
    },
    listContent: {
        paddingBottom: 120,
    },
    column: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#0b0b0b',
        width: '48%',
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    avatarContainer: {
        marginBottom: 12,
    },
    avatar: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: Colors.getPrimaryColor(),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.06)'
    },
    avatarText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '800',
    },
    cardName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        maxWidth: '90%'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#8a8a8a',
        fontSize: 16,
        marginBottom: 12,
    },
    emptyAdd: {
        backgroundColor: Colors.getPrimaryColor(),
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
    },
    emptyAddText: {
        color: '#fff',
        fontWeight: '600',
    },
    cardPlaceholder: {
        width: '48%',
        height: 140,
        borderRadius: 14,
        backgroundColor: '#0b0b0b',
        opacity: 0.6,
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#222',
        marginBottom: 10,
    },
    linePlaceholder: {
        width: '60%',
        height: 12,
        backgroundColor: '#222',
        borderRadius: 6,
    }
});

export default ChooseUserPhone;
