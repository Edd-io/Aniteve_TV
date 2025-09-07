import React from 'react';
import { View, StyleSheet, Text, Pressable, StatusBar } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../constants/routes';
import { ResumePhone } from './resume.phone';
import AnimeItem from '../../models/anime_item';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ResumeScreenRouteProp = RouteProp<RootStackParamList, 'Resume'>;
type ResumeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Resume'>;

export const ResumeScreen: React.FC = () => {
	const insets = useSafeAreaInsets();
	const route = useRoute<ResumeScreenRouteProp>();
	const navigation = useNavigation<ResumeScreenNavigationProp>();
	const { progressList } = route.params;

	const handleSelectAnime = (anime: AnimeItem) => {
		navigation.navigate('Anime', { anime });
	};

	const handleGoBack = () => {
		navigation.goBack();
	};

	return (
		<View style={styles.container}>
				<View style={[styles.header, { paddingTop: insets.top }]}>
					<Pressable onPress={handleGoBack} style={styles.backButton}>
						<Icon name="arrow-back" size={24} color="#fff" />
					</Pressable>
					<Text style={styles.title}>Continuer à regarder</Text>
					<View style={styles.placeholder} />
				</View>
				<ResumePhone
					progressList={progressList}
					onSelectAnime={handleSelectAnime}
				/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	backButton: {
		padding: 8,
	},
	title: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '700',
		flex: 1,
		textAlign: 'center',
	},
	placeholder: {
		width: 40,
	},
});

export default ResumeScreen;
