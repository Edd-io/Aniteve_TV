import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	Animated,
	Image,
	DeviceEventEmitter,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { RemoteControlKey } from '../../constants/remote_controller';
import { AnimeApiService } from '../../data/anime_api_service';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../constants/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export const Login: React.FC = () => {
	const [url, setUrl] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [indexFocused, setIndexFocused] = useState(0);
	const urlInputRef = useRef<TextInput>(null);
	const passwordInputRef = useRef<TextInput>(null);

	const fadeAnim = useRef(new Animated.Value(0)).current;
	const scaleAnim = useRef(new Animated.Value(0.8)).current;
	const slideAnim = useRef(new Animated.Value(30)).current;
	const apiService = AnimeApiService.getInstance();
	const navigation = useNavigation<HomeScreenNavigationProp>();


	useEffect(() => {
		AsyncStorage.removeItem('user')
		const animationSequence = Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 800,
				useNativeDriver: true,
			}),
			Animated.spring(scaleAnim, {
				toValue: 1,
				tension: 50,
				friction: 7,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 600,
				useNativeDriver: true,
			}),
		]);

		animationSequence.start();
	}, []);

	const handleLogin = async () => {
		setError('');

		if (!url.trim()) {
			setError('Veuillez saisir une URL');
			return;
		}

		if (!password.trim()) {
			setError('Veuillez saisir un mot de passe');
			return;
		}

		setIsLoading(true);

		apiService.login(url, password)
			.then(() => {
				navigation.replace('ChooseUser');
			})
			.catch((err) => {
				setIsLoading(false);
				setError(err.message || 'Identifiants incorrects');
			});
	};

	useFocusEffect(
		useCallback(() => {
			const subscription = DeviceEventEmitter.addListener('keyPressed', (keyCode: number) => {
				if (keyCode == RemoteControlKey.DPAD_UP) {
					setIndexFocused(prev => Math.max(prev - 1, 0));
				} else if (keyCode == RemoteControlKey.DPAD_DOWN) {
					setIndexFocused(prev => Math.min(prev + 1, 2));
				} else if (keyCode == RemoteControlKey.DPAD_CONFIRM) {
					if (indexFocused === 0) {
						urlInputRef.current?.focus();
					} else if (indexFocused === 1) {
						passwordInputRef.current?.focus();
					} else if (indexFocused === 2) {
						handleLogin();
					}
				}
			});

			return () => subscription.remove();
		}, [indexFocused])
	);

	return (
		<View style={styles.container}>
			<View style={styles.backgroundGradient} />

			<Animated.View
				style={[
					styles.content,
					{
						opacity: fadeAnim,
						transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
					},
				]}
			>
				<View style={styles.logoContainer}>
					<View style={styles.logo}>
						<Image
							source={require('../../../assets/images/logo.png')}
							style={styles.imageLogo}
							resizeMode="contain"
						/>
					</View>
					<Text style={styles.title}>Aniteve</Text>
					<Text style={styles.subtitle}>Connexion</Text>
				</View>

				<View style={styles.formContainer}>
					<View style={[
						styles.inputContainer,
						indexFocused === 0 && styles.inputFocused
					]}>
						<Text style={styles.inputLabel}>URL du serveur</Text>
						<TextInput
							ref={urlInputRef}
							style={styles.input}
							value={url}
							onChangeText={setUrl}
							placeholder="https://votre-serveur.com"
							placeholderTextColor="#666666"
							keyboardType="url"
							autoCapitalize="none"
							textContentType="URL"
							autoCorrect={false}
							editable={!isLoading && indexFocused === 0}
						/>
					</View>

					<View style={[
						styles.inputContainer,
						indexFocused === 1 && styles.inputFocused
					]}>
						{/* FIXME: Hide the password but impossible due to a bug: it's impossible to delete what has been typed */}
						<Text style={styles.inputLabel}>Mot de passe</Text>
						<TextInput
							ref={passwordInputRef}
							style={styles.input}
							value={password}
							onChangeText={setPassword}
							placeholder="Votre mot de passe"
							placeholderTextColor="#666666"
							keyboardType="default"
							autoCorrect={false}
							editable={!isLoading && indexFocused === 1}
						/>
					</View>

					{error ? (
						<View style={styles.errorContainer}>
							<Text style={styles.errorText}>{error}</Text>
						</View>
					) : null}

					<TouchableOpacity
						style={[
							styles.loginButton,
							isLoading && styles.loginButtonDisabled,
							indexFocused === 2 && styles.loginButtonFocused
						]}
						disabled={isLoading}
					>
						<Text style={styles.loginButtonText}>
							{isLoading ? 'Connexion...' : 'Se connecter'}
						</Text>
					</TouchableOpacity>
				</View>
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#222222',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 40,
	},
	backgroundGradient: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: '#222222ff',
		opacity: 0.9,
	},
	content: {
		width: '100%',
		maxWidth: 500,
		alignItems: 'center',
	},
	logoContainer: {
		alignItems: 'center',
		marginBottom: 20,
	},
	logo: {
		width: 80,
		height: 80,
		borderRadius: 20,
		backgroundColor: '#ffffff',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: Colors.primary,
		shadowOffset: {
			width: 0,
			height: 10,
		},
		shadowOpacity: 0.5,
		shadowRadius: 20,
		elevation: 10,
		marginBottom: 20,
	},
	imageLogo: {
		width: 80,
		height: 80,
		borderRadius: 20,
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		color: '#ffffff',
		letterSpacing: 3,
		textAlign: 'center',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: Colors.primary,
		letterSpacing: 1,
		textAlign: 'center',
		opacity: 0.8,
	},
	formContainer: {
		width: '100%',
		alignItems: 'center',
	},
	inputContainer: {
		width: '100%',
		marginBottom: 5,
		paddingHorizontal: 15,
		paddingVertical: 10,
		borderRadius: 20,
	},
	inputLabel: {
		fontSize: 14,
		color: '#ffffff',
		marginBottom: 8,
		letterSpacing: 0.5,
		fontWeight: '500',
	},
	input: {
		width: '100%',
		height: 45,
		backgroundColor: '#333333',
		borderRadius: 12,
		paddingHorizontal: 20,
		fontSize: 16,
		color: '#ffffff',
		borderWidth: 2,
		borderColor: 'transparent',
	},
	errorContainer: {
		width: '100%',
		backgroundColor: '#ff4444',
		borderRadius: 8,
		padding: 15,
		marginBottom: 15,
		opacity: 0.9,
	},
	errorText: {
		color: '#ffffff',
		fontSize: 14,
		textAlign: 'center',
		fontWeight: '500',
	},
	loginButton: {
		width: '100%',
		height: 45,
		backgroundColor: Colors.primary,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: Colors.primary,
		shadowOffset: {
			width: 0,
			height: 5,
		},
		shadowOpacity: 0.3,
		shadowRadius: 10,
		elevation: 5,
	},
	loginButtonDisabled: {
		opacity: 0.6,
	},
	loginButtonFocused: {
		borderWidth: 3,
		borderColor: Colors.primary,
		backgroundColor: '#444',
	},
	loginButtonText: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: 'bold',
		letterSpacing: 1,
	},
	inputFocused: {
		backgroundColor: '#747474ff',
		borderRadius: 20,
	},
});