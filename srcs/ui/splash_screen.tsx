import React, { useEffect, useRef } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Animated,
	ActivityIndicator,
	Image
} from 'react-native';
import { Colors } from '../constants/colors';


export const SplashScreen: React.FC = () => {
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const scaleAnim = useRef(new Animated.Value(0.3)).current;
	const slideAnim = useRef(new Animated.Value(50)).current;
	const rotateAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const animationSequence = Animated.sequence([
			Animated.parallel([
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
			]),
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 600,
				useNativeDriver: true,
			}),
			Animated.timing(rotateAnim, {
				toValue: 1,
				duration: 1000,
				useNativeDriver: true,
			}),
		]);

		animationSequence.start(() => {

		});
	}, [fadeAnim, scaleAnim, slideAnim, rotateAnim]);

	const rotateInterpolate = rotateAnim.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg'],
	});

	return (
		<View style={styles.container}>
			<View style={styles.backgroundGradient} />

			<Animated.View
				style={[
					styles.content,
					{
						opacity: fadeAnim,
						transform: [{ scale: scaleAnim }],
					},
				]}
			>
				<View style={styles.logoContainer}>
					<View style={styles.logo}>
						<Image
							source={require('../../assets/images/logo.png')}
							style={styles.imageLogo}
							resizeMode="contain"
						/>
					</View>
				</View>

				<Animated.View
					style={[
						styles.titleContainer,
						{
							transform: [{ translateY: slideAnim }],
							opacity: fadeAnim,
						},
					]}
				>
					<Text style={styles.title}>Aniteve</Text>
					<Text style={styles.subtitle}>By Edd-io</Text>
				</Animated.View>
			</Animated.View>

			<Animated.View
				style={[
					styles.loadingContainer,
					{
						opacity: fadeAnim,
						transform: [{ translateY: slideAnim }],
					},
				]}
			>
				<ActivityIndicator size="large" color={'#ffffff'} />
				<Text style={styles.loadingText}>Chargement...</Text>
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
	},
	content: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	logoContainer: {
		marginBottom: 40,
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
	},
	titleContainer: {
		alignItems: 'center',
		marginBottom: 60,
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
		fontSize: 14,
		color: Colors.primary,
		letterSpacing: 1,
		textAlign: 'center',
		opacity: 0.8,
	},
	loadingContainer: {
		position: 'absolute',
		bottom: 80,
		alignItems: 'center',
	},
	loadingText: {
		fontSize: 12,
		color: Colors.primary,
		opacity: 0.6,
		letterSpacing: 1,
		marginTop: 8,
	},
	imageLogo: {
		width: 80,
		height: 80,
		borderRadius: 20,
	},
});
