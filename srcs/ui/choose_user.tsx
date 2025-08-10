import { DeviceEventEmitter, Text, View, StyleSheet, Pressable, TextInput, Alert, FlatList } from "react-native";
import { AnimeApiService, User } from "../data/anime_api_service";
import { useCallback, useEffect, useState, useRef } from "react";
import { RemoteControlKey } from "../constants/remote_controller";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Colors } from "../constants/colors";
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ChooseUser: React.FC = () => {
	const navigation = useNavigation();
	const apiService = new AnimeApiService();
	const flatListRef = useRef<FlatList>(null);

	const [users, setUsers] = useState<User[]>([]);
	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const [showAddForm, setShowAddForm] = useState<boolean>(false);
	const [newUserName, setNewUserName] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [formButtonIndex, setFormButtonIndex] = useState<number>(0);
	const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);

	const listData = [...users, { id: -1, name: 'ADD_USER_ITEM' } as User];

	const addNewUser = async () => {
		if (!newUserName.trim()) {
			Alert.alert("Erreur", "Veuillez entrer un nom d'utilisateur");
			return;
		}

		setIsLoading(true);
		try {
			const success = await apiService.addNewUser(newUserName.trim());
			if (success) {
				await fetchUsers();
				setNewUserName('');
				setShowAddForm(false);
				setSelectedIndex(users.length - 1);
			}
		} catch (error) {
			console.error('Error adding new user:', error);
			Alert.alert("Erreur", "Échec de l'ajout de l'utilisateur");
		} finally {
			setIsLoading(false);
		}
	};
	
	const fetchUsers = async () => {
		try {
			setIsLoadingUsers(true);
			const users = await apiService.fetchAllUsers();
			setUsers(users);
		} catch (error) {
			console.error('Error fetching users:', error);
		} finally {
			setIsLoadingUsers(false);
		}
	};

	const selectUser = (user: User) => {
		AnimeApiService.setUser(user);
		navigation.navigate('Home' as never);
	};

	const scrollToIndex = (index: number) => {
		if (flatListRef.current && index >= 0 && index < listData.length) {
			flatListRef.current.scrollToIndex({
				index,
				animated: true,
				viewPosition: 0.5
			});
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	useFocusEffect(
		useCallback(() => {
			const subscription = DeviceEventEmitter.addListener('keyPressed', (keyCode: number) => {
				if (showAddForm) {
					if (keyCode === RemoteControlKey.DPAD_LEFT) {
						setFormButtonIndex(prev => Math.max(0, prev - 1));
					} else if (keyCode === RemoteControlKey.DPAD_RIGHT) {
						setFormButtonIndex(prev => Math.min(1, prev + 1));
					} else if (keyCode === RemoteControlKey.DPAD_CONFIRM) {
						if (formButtonIndex === 0) {
							setShowAddForm(false);
							setNewUserName('');
							setFormButtonIndex(0);
						} else {
							addNewUser();
						}
					}
					return;
				}

				const totalItems = listData.length;
				
				if (keyCode === RemoteControlKey.DPAD_LEFT) {
					const newIndex = Math.max(0, selectedIndex - 1);
					setSelectedIndex(newIndex);
					scrollToIndex(newIndex);
				} else if (keyCode === RemoteControlKey.DPAD_RIGHT) {
					const newIndex = Math.min(totalItems - 1, selectedIndex + 1);
					setSelectedIndex(newIndex);
					scrollToIndex(newIndex);
				} else if (keyCode === RemoteControlKey.DPAD_CONFIRM) {
					if (selectedIndex === users.length) {
						setShowAddForm(true);
						setFormButtonIndex(0);
					} else if (users[selectedIndex]) {
						selectUser(users[selectedIndex]);
						AnimeApiService.setUser(users[selectedIndex]);
						AsyncStorage.setItem('user', JSON.stringify(users[selectedIndex]));
					}
				}
			});

			return () => subscription.remove();
		}, [showAddForm, users, selectedIndex, listData, formButtonIndex])
	);

	const renderUserItem = ({ item, index }: { item: User; index: number }) => {
		const isSelected = selectedIndex === index;
		const isAddButton = item.name === 'ADD_USER_ITEM';
		
		if (isAddButton) {
			return (
				<Pressable
					style={[
						styles.userItem,
						styles.addUserItem,
						isSelected && styles.selectedItem
					]}
					onPress={() => setShowAddForm(true)}
				>
					<View style={[styles.userAvatar, styles.addUserAvatar]}>
						<Icon name="add" size={32} color="#fff" />
					</View>
					<Text style={styles.userName}>
						Ajouter un utilisateur
					</Text>
				</Pressable>
			);
		}

		return (
			<Pressable
				style={[
					styles.userItem,
					isSelected && styles.selectedItem
				]}
				onPress={() => selectUser(item)}
			>
				<View style={styles.userAvatar}>
					<Text style={styles.userAvatarText}>
						{item.name.charAt(0).toUpperCase()}
					</Text>
				</View>
				<Text style={styles.userName} numberOfLines={1}>
					{item.name}
				</Text>
			</Pressable>
		);
	};

	if (showAddForm) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Nouvel utilisateur</Text>
				<View style={styles.addFormContainer}>
					<TextInput
						style={styles.textInput}
						placeholder="Nom d'utilisateur"
						placeholderTextColor="#999"
						value={newUserName}
						onChangeText={setNewUserName}
						autoFocus
						onSubmitEditing={addNewUser}
					/>
					<View style={styles.formButtons}>
						<Pressable
							style={[
								styles.button,
								styles.cancelButton,
								formButtonIndex === 0 && styles.selectedButton
							]}
							onPress={() => {
								setShowAddForm(false);
								setNewUserName('');
								setFormButtonIndex(0);
							}}
						>
							<Text style={styles.buttonText}>Annuler</Text>
						</Pressable>
						<Pressable
							style={[
								styles.button,
								styles.confirmButton,
								formButtonIndex === 1 && styles.selectedButton
							]}
							onPress={addNewUser}
							disabled={isLoading}
						>
							<Text style={styles.buttonText}>
								{isLoading ? 'Ajout...' : 'Ajouter'}
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		);
	}

	if (isLoadingUsers) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Chargement des utilisateurs...</Text>
				<View style={styles.loadingContainer}>
					<View style={styles.loadingSpinner} />
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Choisir un utilisateur</Text>
			<FlatList
				ref={flatListRef}
				data={listData}
				renderItem={renderUserItem}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.listContainer}
				showsHorizontalScrollIndicator={false}
				horizontal
				getItemLayout={(data, index) => ({
					length: 200,
					offset: 200 * index,
					index,
				})}
				scrollEnabled={false}
			/>
			<Text style={styles.instructions}>
				Utilisez les flèches gauche/droite pour naviguer et appuyez sur OK pour sélectionner
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
		paddingHorizontal: 40,
		paddingVertical: 60,
	},
	title: {
		fontSize: 36,
		fontWeight: 'bold',
		color: '#fff',
		textAlign: 'center',
		marginBottom: 40,
	},
	listContainer: {
		paddingHorizontal: 20,
		alignItems: 'center',
	},
	userItem: {
		alignItems: 'center',
		padding: 20,
		marginHorizontal: 15,
		borderRadius: 15,
		backgroundColor: '#1a1a1a',
		borderWidth: 3,
		borderColor: 'transparent',
		width: 180,
		height: 220,
		justifyContent: 'center',
	},
	selectedItem: {
		borderColor: Colors.primary,
		backgroundColor: '#2a2a2a',
	},
	addUserItem: {
		borderStyle: 'dashed',
		borderColor: '#444',
	},
	userAvatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: Colors.primary,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 15,
	},
	addUserAvatar: {
		backgroundColor: '#444',
	},
	userAvatarText: {
		fontSize: 32,
		fontWeight: 'bold',
		color: '#fff',
	},
	userName: {
		fontSize: 16,
		color: '#fff',
		fontWeight: '500',
		textAlign: 'center',
	},
	instructions: {
		fontSize: 14,
		color: '#999',
		textAlign: 'center',
		marginTop: 20,
		paddingHorizontal: 20,
	},
	addFormContainer: {
		backgroundColor: '#1a1a1a',
		borderRadius: 15,
		padding: 40,
		alignItems: 'center',
		maxWidth: 400,
		alignSelf: 'center',
	},
	textInput: {
		width: '100%',
		height: 50,
		backgroundColor: '#333',
		borderRadius: 10,
		paddingHorizontal: 15,
		color: '#fff',
		fontSize: 16,
		marginBottom: 30,
		borderWidth: 2,
		borderColor: Colors.primary,
	},
	formButtons: {
		flexDirection: 'row',
		gap: 20,
	},
	button: {
		paddingHorizontal: 30,
		paddingVertical: 12,
		borderRadius: 10,
		minWidth: 100,
		alignItems: 'center',
	},
	cancelButton: {
		backgroundColor: '#444',
	},
	confirmButton: {
		backgroundColor: Colors.primary,
	},
	selectedButton: {
		borderWidth: 2,
		borderColor: '#fff',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingSpinner: {
		width: 60,
		height: 60,
		borderRadius: 30,
		borderWidth: 4,
		borderColor: '#333',
		borderTopColor: Colors.primary,
		transform: [{ rotate: '45deg' }],
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '500',
	},
});
