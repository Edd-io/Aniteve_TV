import React, { Dispatch, SetStateAction, useState } from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../constants/colors';
import { AnimeApiService } from "../../data/anime_api_service";
import { TopBarProps } from "../../types/components";
import { SelectedPart } from "../../types/home";

export default function TopBar({
	selectedPart,
	index,
	searchInputRef,
	setSearchValue,
	setIsLoading,
	searchValue
}: TopBarProps): React.JSX.Element {
	const currentFocusedIndex = index;
	const isSelected = selectedPart === SelectedPart.TOPBAR;
	const [localSearchValue, setLocalSearchValue] = useState('');

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
					isSelected && currentFocusedIndex === 0 && styles.focusedElement,
					isSelected && currentFocusedIndex === 0 ? { backgroundColor: Colors.getPrimaryColor() } : {}
				]}
				isTVSelectable={false}
			>
				<View style={{ width: 180 }}>
					<TextInput
						style={styles.searchPlaceholder}
						ref={searchInputRef}
						editable={isSelected && currentFocusedIndex === 0}
						placeholder="Rechercher un anime..."
						onChangeText={setLocalSearchValue}
						value={localSearchValue || searchValue}
						onSubmitEditing={() => {
							setIsLoading(true);
							setSearchValue(localSearchValue);
						}}
					/>
				</View>
				<Icon name="search" size={24} color="#fff" style={{ marginLeft: 10 }} />
			</View>
			<View style={styles.headerIcons}>
				<View
					style={[
						styles.button,
						isSelected && currentFocusedIndex === 1 && styles.focusedElement,
						isSelected && currentFocusedIndex === 1 ? { backgroundColor: Colors.getPrimaryColor() } : {}
					]}
					isTVSelectable={false}
				>
					<Icon name="play-arrow" size={24} color="#fff" />
				</View>
				<View
					style={[
						styles.button,
						isSelected && currentFocusedIndex === 2 && styles.focusedElement,
						isSelected && currentFocusedIndex === 2 ? { backgroundColor: Colors.getPrimaryColor() } : {}
					]}
					isTVSelectable={false}
				>
					<View style={{ width: 24, height: 24, borderRadius: 100, borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
						<Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{AnimeApiService.getActualUser()?.name[0] ?? '?'}</Text>
					</View>
				</View>
				<View
					style={[
						styles.button,
						isSelected && currentFocusedIndex === 3 && styles.focusedElement,
						isSelected && currentFocusedIndex === 3 ? { backgroundColor: Colors.getPrimaryColor() } : {}
					]}
					isTVSelectable={false}
				>
					<Icon name="settings" size={24} color="#fff" />
				</View>
			</View>
		</View>
	);
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
		borderRadius: 10,
	},
});
