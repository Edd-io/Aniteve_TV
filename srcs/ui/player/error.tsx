import { JSX } from "react";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";

export const ErrorComponent = ({ error }: { error: string | null }): JSX.Element | null => {
    if (error == null) {
        return null;
    }
    return (
        <View style={styles.errorContainer}>
            <Icon name="error-outline" size={48} color={Colors.primary} />
            <Text style={styles.errorText}>{error}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    errorContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    errorText: {
        color: 'white',
        fontSize: 20,
        marginTop: 16,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
});