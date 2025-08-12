import { JSX } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { getBetterLogo } from "../../utils/get_better_logo";
import { TMDBData } from "../../types/tmdb";

export const LoadingComponent = ({ onLoading, tmdbData }: { onLoading: boolean; tmdbData?: TMDBData | null }): JSX.Element | null => {
    if (!onLoading) {
        return null;
    }
    return (
        <View style={styles.loadingContainer}>
            {tmdbData && (() => {
                const betterLogo = getBetterLogo(tmdbData);
                if (!betterLogo) {
                    return null;
                }
                return (
                    <Image
                        source={{ uri: betterLogo }}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                );
            })()}
            <ActivityIndicator size={450} color="#FFFFFF" />
        </View>
    );
}

const styles = StyleSheet.create({
	loadingContainer: {
		position: 'absolute',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 2,
	},
	logoImage: {
		position: 'absolute',
		maxWidth: 400,
		maxHeight: 400,
		width: '100%',
		height: '100%',
		top: '50%',
		left: '50%',
		transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 2,
	},
});