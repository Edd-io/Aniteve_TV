import React from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SelectedPart } from "../home/home";

export default function TopBar(
	{ selectedPart, index }: { selectedPart: SelectedPart, index: number }
): React.JSX.Element {
	const searchInputRef = React.useRef<TextInput>(null);
	const currentFocusedIndex = index;
	const isSelected = selectedPart === SelectedPart.TOPBAR;

	return (
		<View style={styles.header}>
			<Text style={[
				styles.logo,
			]}>
				Aniteve
			</Text>

			<View style={{ flex: 1 }} />

			<View
				style={[
					styles.searchContainer,
					isSelected && currentFocusedIndex === 0 && styles.focusedElement
				]}
				isTVSelectable={false}
			>
				<View style={{ width: 180 }}>
					<TextInput
						style={styles.searchPlaceholder}
						ref={searchInputRef}
						editable={isSelected && currentFocusedIndex === 0}
						placeholder="Rechercher un anime..."
					/>
				</View>
				<Icon name="search" size={24} color="#fff" style={{ marginLeft: 10 }} />
			</View>
			<View style={styles.headerIcons}>
				<View
					style={[
						styles.button,
						isSelected && currentFocusedIndex === 1 && styles.focusedElement
					]}
					isTVSelectable={false}
				>
					<Icon name="play-arrow" size={24} color="#fff" />
				</View>
				<View
					style={[
						styles.button,
						isSelected && currentFocusedIndex === 2 && styles.focusedElement
					]}
					isTVSelectable={false}
				>
					<View style={{ width: 24, height: 24, borderRadius: 100, borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
						<Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>A</Text>
					</View>
				</View>
				<View
					style={[
						styles.button,
						isSelected && currentFocusedIndex === 3 && styles.focusedElement
					]}
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
		marginRight: 10,
		backgroundColor: '#00000034',
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
	},
	focusedElement: {
		backgroundColor: '#17171788',
		borderRadius: 10,
	},
});
