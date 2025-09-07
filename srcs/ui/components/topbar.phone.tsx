import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TopBarButton from './topbar_button.phone';
import { TopBarPhoneProps } from '../../types/components';

export const TopBarPhone: React.FC<TopBarPhoneProps> = ({ onResume, onChooseUser, onSettings }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.logo}>Aniteve</Text>
            <View style={styles.buttons}>
                <TopBarButton icon="person" accessibilityLabel="Choose user" onPress={() => onChooseUser && onChooseUser()} />
                <TopBarButton icon="settings" accessibilityLabel="Settings" onPress={() => onSettings && onSettings()} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 6,
    },
    logo: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    buttons: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});

export default TopBarPhone;
