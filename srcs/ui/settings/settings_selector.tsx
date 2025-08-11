import React, { FC, useEffect, useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    DeviceEventEmitter,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RemoteControlKey } from '../../constants/remote_controller';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/colors';

export interface SettingsData {
    primaryColor: string;
    timeSkip: number;
}

interface SettingsSelectorProps {
    visible: boolean;
    close: () => void;
    settings: SettingsData;
    onSettingsChange: (settings: SettingsData) => void;
}

enum SettingsIndex {
    PRIMARY_COLOR = 0,
    TIME_SKIP = 1,
    DELETE_CONNECTION = 2,
}

const TIME_SKIP_OPTIONS = [5, 10, 15, 30, 60];

export const SettingsSelector: FC<SettingsSelectorProps> = ({
    visible,
    close,
    settings,
    onSettingsChange
}) => {
    const screenHeight = Dimensions.get('window').height;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [timeSkipIndex, setTimeSkipIndex] = useState(() => {
        const index = TIME_SKIP_OPTIONS.indexOf(settings.timeSkip);
        return index >= 0 ? index : 2;
    });
    const [colorIndex, setColorIndex] = useState(() => {
        const index = Colors.availableColors.findIndex(color => color.value === settings.primaryColor);
        return index >= 0 ? index : 0;
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

    const handleColorChange = (direction: 'left' | 'right') => {
        setColorIndex(prevIndex => {
            let newIndex;
            if (direction === 'left') {
                newIndex = prevIndex > 0 ? prevIndex - 1 : Colors.availableColors.length - 1;
            } else {
                newIndex = prevIndex < Colors.availableColors.length - 1 ? prevIndex + 1 : 0;
            }

            const newTimeSkip = TIME_SKIP_OPTIONS[timeSkipIndex];
            const newColor = Colors.availableColors[newIndex];
            const newSettings = {primaryColor: newColor.value, timeSkip: newTimeSkip };
            onSettingsChange(newSettings);

            return newIndex;
        });
    };

    const handleTimeSkipChange = (direction: 'left' | 'right') => {
        setTimeSkipIndex(prevIndex => {
            let newIndex;
            if (direction === 'left') {
                newIndex = prevIndex > 0 ? prevIndex - 1 : TIME_SKIP_OPTIONS.length - 1;
            } else {
                newIndex = prevIndex < TIME_SKIP_OPTIONS.length - 1 ? prevIndex + 1 : 0;
            }

            const newTimeSkip = TIME_SKIP_OPTIONS[newIndex];
            const newColor = Colors.availableColors[colorIndex];
            const newSettings = { primaryColor: newColor.value, timeSkip: newTimeSkip };
            onSettingsChange(newSettings);

            return newIndex;
        });
    };

    const handleDeleteConnection = () => {
        Alert.alert(
            'Supprimer la connexion',
            'Êtes-vous sûr de vouloir supprimer toutes les données de connexion ? Vous devrez vous reconnecter.',
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            Alert.alert('Succès', 'Toutes les données ont été supprimées. L\'application va se fermer.');
                            setTimeout(() => {
                                throw new Error('App restart required');
                            }, 1000);
                        } catch (error) {
                            console.error('Error clearing AsyncStorage:', error);
                            Alert.alert('Erreur', 'Impossible de supprimer les données.');
                        }
                    },
                },
            ]
        );
    };

    useFocusEffect(
        useCallback(() => {
            const handleRemoteControlEvent = (keyCode: number) => {
                if (!visible) return;

                if (keyCode === RemoteControlKey.DPAD_UP) {
                    setSelectedIndex(prevIndex => Math.max(prevIndex - 1, 0));
                } else if (keyCode === RemoteControlKey.DPAD_DOWN) {
                    setSelectedIndex(prevIndex => Math.min(prevIndex + 1, 2));
                } else if (keyCode === RemoteControlKey.DPAD_LEFT) {
                    if (selectedIndex === SettingsIndex.PRIMARY_COLOR) {
                        handleColorChange('left');
                    } else if (selectedIndex === SettingsIndex.TIME_SKIP) {
                        handleTimeSkipChange('left');
                    }
                } else if (keyCode === RemoteControlKey.DPAD_RIGHT) {
                    if (selectedIndex === SettingsIndex.PRIMARY_COLOR) {
                        handleColorChange('right');
                    } else if (selectedIndex === SettingsIndex.TIME_SKIP) {
                        handleTimeSkipChange('right');
                    }
                } else if (keyCode === RemoteControlKey.DPAD_CONFIRM) {
                    if (selectedIndex === SettingsIndex.DELETE_CONNECTION) {
                        handleDeleteConnection();
                    }
                } else if (keyCode === RemoteControlKey.BACK) {
                    close();
                }
            };

            const subscription = DeviceEventEmitter.addListener('keyPressed', handleRemoteControlEvent);
            return () => subscription.remove();
        }, [visible, selectedIndex, settings])
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
                        <Icon name="settings" size={24} color="#ffffff" />
                        <Text style={styles.headerTitle}>Paramètres</Text>
                    </View>

                    <View style={styles.settingsContainer}>
                        <TouchableOpacity
                            style={[
                                styles.settingItem,
                                selectedIndex === SettingsIndex.PRIMARY_COLOR ?
                                    { ...styles.settingSelected, borderColor: Colors.getPrimaryColor() } : {}
                            ]}
                        >
                            <View style={styles.settingContent}>
                                <Icon name="palette" size={24} color="#ffffff" style={styles.settingIcon} />
                                <View style={styles.settingTextContainer}>
                                    <Text style={styles.settingTitle}>Couleur primaire</Text>
                                    <Text style={styles.settingDescription}>
                                        Couleur principale de l'interface
                                    </Text>
                                </View>
                                <View style={styles.colorContainer}>
                                    <Icon name="chevron-left" size={20} color="#ffffff" />
                                    <View style={[styles.colorPreview, { backgroundColor: Colors.availableColors[colorIndex].value }]} />
                                    <Text style={styles.colorName}>{Colors.availableColors[colorIndex].name}</Text>
                                    <Icon name="chevron-right" size={20} color="#ffffff" />
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.settingItem,
                                selectedIndex === SettingsIndex.TIME_SKIP ?
                                    { ...styles.settingSelected, borderColor: Colors.getPrimaryColor() } : {}
                            ]}
                        >
                            <View style={styles.settingContent}>
                                <Icon name="fast-forward" size={24} color="#ffffff" style={styles.settingIcon} />
                                <View style={styles.settingTextContainer}>
                                    <Text style={styles.settingTitle}>Avance/Recul rapide</Text>
                                    <Text style={styles.settingDescription}>
                                        Temps d'avance ou de recul en secondes
                                    </Text>
                                </View>
                                <View style={styles.timeSkipContainer}>
                                    <Icon name="chevron-left" size={20} color="#ffffff" />
                                    <Text style={styles.timeSkipValue}>{TIME_SKIP_OPTIONS[timeSkipIndex]}s</Text>
                                    <Icon name="chevron-right" size={20} color="#ffffff" />
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.settingItem,
                                styles.dangerItem,
                                selectedIndex === SettingsIndex.DELETE_CONNECTION ?
                                    { ...styles.settingSelected, borderColor: Colors.getPrimaryColor() } : {}
                            ]}
                        >
                            <View style={styles.settingContent}>
                                <Icon name="delete-forever" size={24} color="#ff4444" style={styles.settingIcon} />
                                <View style={styles.settingTextContainer}>
                                    <Text style={[styles.settingTitle, { color: '#ff4444' }]}>Supprimer connexion</Text>
                                    <Text style={styles.settingDescription}>
                                        Efface toutes les données de connexion
                                    </Text>
                                </View>
                                <Icon name="chevron-right" size={20} color="#ff4444" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Utilisez les flèches pour naviguer, "OK" pour valider, "Retour" pour fermer.
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
        width: '80%',
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
    settingsContainer: {
        paddingVertical: 15,
    },
    settingItem: {
        borderRadius: 12,
        marginBottom: 8,
        marginHorizontal: 15,
        borderWidth: 2,
        borderColor: 'transparent',
        overflow: 'hidden',
        backgroundColor: 'rgba(30, 30, 30, 0.8)',
    },
    settingSelected: {
        backgroundColor: 'rgba(95, 95, 95, 0.38)',
    },
    dangerItem: {
        backgroundColor: 'rgba(60, 20, 20, 0.8)',
    },
    settingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 16,
        minHeight: 70,
    },
    settingIcon: {
        marginRight: 15,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    settingDescription: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
    },
    toggleContainer: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        minWidth: 50,
        alignItems: 'center',
    },
    toggleActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    toggleInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    toggleText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    timeSkipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    timeSkipValue: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 12,
        minWidth: 30,
        textAlign: 'center',
    },
    colorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    colorPreview: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    colorName: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        marginHorizontal: 8,
        minWidth: 50,
        textAlign: 'center',
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
