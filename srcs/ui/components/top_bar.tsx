import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Keyboard } from "react-native";

export default function TopBar(): React.JSX.Element {
	const searchInputRef = React.useRef<TextInput>(null);
	const searchBarRef = React.useRef<View>(null);
	const [focused, setFocused] = useState<string | null>(null);
	const [shouldRefocus, setShouldRefocus] = useState(false);

	useEffect(() => {
		const keyboardListener = Keyboard.addListener('keyboardDidHide', () => {
			setShouldRefocus(true);
			setFocused('search');
		});
		return () => keyboardListener.remove();
	}, []);

	return (
		<View style={styles.header}>
			<Text style={styles.logo}>Aniteve</Text>

			<View style={{ flex: 1 }} />

			<TouchableOpacity
				ref={searchBarRef}
				style={[styles.searchContainer, focused === 'search' && styles.focusedSearchBar]}
				onFocus={() => { setFocused('search'); setShouldRefocus(false); }}
				onBlur={() => setFocused(null)}
				onPress={() => openSearch(searchInputRef)}
				hasTVPreferredFocus={shouldRefocus}
			>
				<View style={{ width: 180 }}>
					<TextInput
						style={styles.searchPlaceholder}
						ref={searchInputRef}
						placeholder="Rechercher un anime..."
					/>
				</View>
				<Icon name="search" size={24} color="#fff" style={{ marginLeft: 10 }} />
			</TouchableOpacity>
			<View style={styles.headerIcons}>
				<TouchableOpacity
					style={[styles.button, focused === 'play' && styles.focusedButton]}
					onFocus={() => setFocused('play')}
					onBlur={() => setFocused(null)}
					onPress={() => console.log('Play pressed')}
				>
					<Icon name="play-arrow" size={24} color="#fff" />
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.button, focused === 'settings' && styles.focusedButton]}
					onFocus={() => setFocused('settings')}
					onPress={() => console.log('Settings pressed')}
				>
					<Icon name="settings" size={24} color="#fff" />
				</TouchableOpacity>
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
	},
	searchPlaceholder: {
		backgroundColor: '#2e2e2e88',
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
	},
	focusedButton: {
		backgroundColor: '#00000072',
		opacity: 1
	},
	focusedSearchBar: {
		backgroundColor: '#00000072',
		opacity: 1,
	},
});