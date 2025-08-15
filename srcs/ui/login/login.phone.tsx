import React, { Dispatch, JSX, useState } from "react";
import {
	Text,
	View,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	Alert,
	Image,
} from "react-native";
import { Colors } from '../../constants/colors';

export const LoginPhone = ({
	handleLogin,
	url,
	password,
	error,
	setError,
	setUrl,
	setPassword
}: {
	handleLogin: () => void;
	url: string;
	password: string;
	error: string | null;
	setError: Dispatch<React.SetStateAction<string>>;
	setUrl: Dispatch<React.SetStateAction<string>>;
	setPassword: Dispatch<React.SetStateAction<string>>;
}): JSX.Element => {
	const [urlFocused, setUrlFocused] = useState<boolean>(false);
	const [passwordFocused, setPasswordFocused] = useState<boolean>(false);

	const handleUrlChange = (text: string) => {
		setUrl(text);
		if (error) setError('');
	};

	const handlePasswordChange = (text: string) => {
		setPassword(text);
		if (error) setError('');
	};

	const handleUrlKeyPress = (e: any) => {
		const key = e.nativeEvent.key;
		if (key === 'Backspace' && urlFocused) {
			setUrl((prev) => {
				const next = prev.slice(0, -1);
				return next;
			});
		}
	};

	const handlePasswordKeyPress = (e: any) => {
		const key = e.nativeEvent.key;
		if (key === 'Backspace' && passwordFocused) {
			setPassword((prev) => prev.slice(0, -1));
		}
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<View style={styles.card}>
				<Image
					source={require('../../../assets/images/logo.png')}
					style={styles.logoImage}
					accessibilityLabel="Logo Aniteve"
				/>
				<Text style={styles.title}>Connexion</Text>

				<Text style={styles.label}>URL</Text>
				<TextInput
					value={url}
					onChangeText={handleUrlChange}
					onKeyPress={handleUrlKeyPress}
					onFocus={() => setUrlFocused(true)}
					onBlur={() => setUrlFocused(false)}
					autoFocus={true}
					placeholder="https://exemple.com"
					placeholderTextColor="#bdbdbd"
					style={styles.input}
					keyboardType="url"
					autoCapitalize="none"
					accessibilityLabel="Champ URL"
				/>

				<Text style={styles.label}>Mot de passe</Text>
				<TextInput
					value={password}
					onChangeText={handlePasswordChange}
					onKeyPress={handlePasswordKeyPress}
					onFocus={() => setPasswordFocused(true)}
					onBlur={() => setPasswordFocused(false)}
					placeholder="••••••••"
					placeholderTextColor="#bdbdbd"
					secureTextEntry
					style={styles.input}
					accessibilityLabel="Champ mot de passe"
				/>

				{error ? <Text style={styles.error}>{error}</Text> : null}

				<TouchableOpacity style={styles.button} onPress={handleLogin} accessibilityRole="button">
					<Text style={styles.buttonText}>Confirmer</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#222222',
		justifyContent: 'center',
		padding: 24,
	},
	card: {
		backgroundColor: 'rgba(255, 255, 255, 0.17)',
		borderRadius: 12,
		padding: 20,
		shadowColor: '#000',
		shadowOpacity: 0.25,
		shadowRadius: 8,
	},
	logo: {
		fontSize: 24,
		color: '#fff',
		fontWeight: 'bold',
		marginBottom: 6,
		textAlign: 'center',
	},
	logoImage: {
		width: 80,
		height: 80,
		resizeMode: 'contain',
		alignSelf: 'center',
		marginBottom: 8,
		backgroundColor: '#fff',
		borderRadius: 20,
	},
	title: {
		color: '#ccc',
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 12,
		textAlign: 'center',
	},
	label: {
		color: '#9b9b9b',
		fontSize: 12,
		marginTop: 8,
		marginBottom: 6,
	},
	input: {
		backgroundColor: 'transparent',
		color: '#fff',
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#222',
	},
	button: {
		marginTop: 16,
		backgroundColor: Colors.getPrimaryColor(),
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	buttonText: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 16,
	},
	error: {
		color: '#ff6b6b',
		marginTop: 8,
		textAlign: 'center',
	},
});
