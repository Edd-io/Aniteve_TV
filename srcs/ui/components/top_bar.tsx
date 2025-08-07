import React from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function TopBar(): React.JSX.Element {
	const searchInputRef = React.useRef<TextInput>(null);

	return (
		<View style={styles.header}>
			<Text style={styles.logo}>Aniteve</Text>

			<View style={{ flex: 1 }} />

			<View
				style={styles.searchContainer}
				// onPress={() => openSearch(searchInputRef)}
				isTVSelectable={false}
			>
				<View style={{ width: 180 }}>
					<TextInput
						style={styles.searchPlaceholder}
						ref={searchInputRef}
						placeholder="Rechercher un anime..."
					/>
				</View>
				<Icon name="search" size={24} color="#fff" style={{ marginLeft: 10 }} />
			</View>
			<View style={styles.headerIcons}>
				<View
					style={styles.button}
					// onPress={() => console.log('Play pressed')}
					isTVSelectable={false}
				>
					<Icon name="play-arrow" size={24} color="#fff" />
				</View>
				<View
					style={styles.button}
					// onPress={() => console.log('Settings pressed')}
					isTVSelectable={false}
				>
					<Icon name="settings" size={24} color="#fff" />
				</View>
			</View>
		</View>
	);
}

function openSearch(searchInputRef: React.RefObject<TextInput>) {
	if (searchInputRef.current) {
		searchInputRef.current.clear();
		searchInputRef.current.focus();
	}
}

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 30,
		paddingTop: 20,
		backgroundColor: 'transparent',
	},
	logo: {
		fontSize: 24,
		color: '#fff',
		fontWeight: 'bold',
	},
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		height: 45,
		padding: 3,
		paddingHorizontal: 10,
		borderRadius: 10,
		backgroundColor: '#2e2e2e88',
	},
	searchPlaceholder: {
		backgroundColor: 'transparent',
		color: '#ccc',
		padding: 10,
		borderRadius: 10,
	},
	headerIcons: {
		flexDirection: 'row',
		gap: 10,
	},
	button: {
		borderRadius: 10,
		width: 45,
		height: 45,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 3,
		backgroundColor: '#2e2e2e88',
	},
});
