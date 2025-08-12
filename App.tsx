import React, { useEffect, useRef, useState } from 'react';
import {
	StyleSheet,
	View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Home } from './srcs/ui/home/home';
import { Anime } from './srcs/ui/anime/anime';
import { RootStackParamList } from './srcs/constants/routes';
import { Player } from './srcs/ui/player/player';
import { SplashScreen } from './srcs/ui/splash_screen';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { Animated } from 'react-native';
import { Login } from './srcs/ui/login/login';
import { AnimeApiService } from './srcs/data/anime_api_service';
import { ChooseUser } from './srcs/ui/choose_user';
import { Colors } from './srcs/constants/colors';
import { SettingsData } from './srcs/ui/settings/settings_selector';

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
	const [showSplash, setShowSplash] = useState(true);
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const [showMain, setShowMain] = useState(false);
	const [showLogin, setShowLogin] = useState(false);
	const [userSelected, setUserSelected] = useState(false);

	const handleSplashFinish = React.useCallback(() => {
		setShowSplash(false);
		setShowMain(true);
	}, []);

	useEffect(() => {
		const checkLoginStatus = async () => {
			const apiService = AnimeApiService.getInstance();

			try {
				const savedSettings = await AsyncStorage.getItem('app_settings');
				if (savedSettings) {
					const settings: SettingsData = JSON.parse(savedSettings);
					if (settings.primaryColor) {
						Colors.setPrimaryColor(settings.primaryColor);
					}
				}

				const token = await AsyncStorage.getItem('token');
				const addr = await AsyncStorage.getItem('addr');
				const user = await AsyncStorage.getItem('user');

				if (token && addr) {
					apiService.checkTokenValidity(token, addr)
						.then(isValid => {
							if (isValid) {
								AnimeApiService.setToken(token);
								AnimeApiService.setBaseUrl(addr);
								if (user) {
									setUserSelected(true);
									const parsedUser = JSON.parse(user);
									AnimeApiService.setUser(parsedUser);
								} 
							} else {
								setShowLogin(true);
							}
						})
						.catch(() => setShowLogin(true))
						.finally(() => {
							handleSplashFinish();
						});
				} else {
					setShowLogin(true);
					handleSplashFinish();
				}
			} catch (error) {
				setShowLogin(true);
				handleSplashFinish();
				console.error('Error checking login status:', error);
			}
		};

		setTimeout(() => {
			checkLoginStatus();
		}, 1500);
	}, []);

	useEffect(() => {
		if (showMain) {
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 500,
				useNativeDriver: true,
			}).start();
		}
	}, [showMain, fadeAnim]);

	return (
		<>
			{showSplash && (
				<SplashScreen />
			)}
			{showMain && (
				<Animated.View style={{ flex: 1, opacity: fadeAnim }}>
					<NavigationContainer>
						<Stack.Navigator
							initialRouteName={showLogin ? "Login" : (userSelected ? "Home" : "ChooseUser")}
							screenOptions={{
								headerShown: false,
								cardStyle: { backgroundColor: '#0a0a0a' }
							}}
						>
							<Stack.Screen name="Home" component={Home} />
							<Stack.Screen name="Anime" component={Anime} />
							<Stack.Screen name="Player" component={Player} />
							<Stack.Screen name="Login" component={Login} />
							<Stack.Screen name="ChooseUser" component={ChooseUser} />
						</Stack.Navigator>
					</NavigationContainer>
				</Animated.View>
			)}
		</>
	);
}

export default App;
