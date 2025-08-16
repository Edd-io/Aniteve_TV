import React, { FC } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Season } from '../../types/user';

const { width } = Dimensions.get('window');

interface Props {
	visible: boolean;
	seasons: Season[];
	currentSeason?: Season | null;
	averageColor?: number[];
	closePopup: () => void;
	onSeasonSelect: (season: Season) => void;
}

export const SeasonSelectorPhone: FC<Props> = ({ visible, seasons, currentSeason, averageColor = [30, 30, 30], closePopup, onSeasonSelect }) => {
	const primaryColor = (alpha: number) => `rgba(${averageColor[0]}, ${averageColor[1]}, ${averageColor[2]}, ${alpha})`;
	
	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={closePopup}
		>
			<TouchableOpacity 
				style={styles.backdrop} 
				activeOpacity={1} 
				onPress={closePopup}
			>
				<TouchableOpacity 
					style={styles.sheet} 
					activeOpacity={1}
					onPress={(e) => e.stopPropagation()}
				>
					<View style={styles.header}>
						<Text style={styles.title}>Sélectionner une saison</Text>
						<TouchableOpacity 
							style={styles.closeButton} 
							onPress={closePopup}
						>
							<Icon name="close" size={20} color="#888888" />
						</TouchableOpacity>
					</View>

					<FlatList
						data={seasons}
						keyExtractor={(item, idx) => `${item.name}-${idx}`}
						showsVerticalScrollIndicator={false}
						renderItem={({ item, index }) => {
							const isSelected = currentSeason?.url === item.url;
							return (
								<TouchableOpacity
									style={[
										styles.seasonItem,
										{ 
											backgroundColor: isSelected ? primaryColor(0.4) : primaryColor(0.1),
											borderColor: isSelected ? primaryColor(0.6) : 'transparent'
										}
									]}
									onPress={() => { onSeasonSelect(item); closePopup(); }}
									activeOpacity={0.7}
								>
									<View style={styles.seasonContent}>
										<Text style={[
											styles.seasonText, 
											{ color: isSelected ? '#ffffff' : '#cccccc' }
										]}>
											{item.name}
										</Text>
										{item.lang && (
											<View style={[styles.langBadge, { backgroundColor: primaryColor(0.6) }]}>
												<Text style={styles.langText}>{item.lang.toUpperCase()}</Text>
											</View>
										)}
									</View>
									{isSelected && (
										<Icon name="check-circle" size={20} color="#ffffff" />
									)}
								</TouchableOpacity>
							);
						}}
					/>
				</TouchableOpacity>
			</TouchableOpacity>
		</Modal>
	);
};

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'flex-end',
	},
	sheet: {
		backgroundColor: '#1a1a1a',
		padding: 24,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		maxHeight: '70%',
		minHeight: 300,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255,255,255,0.1)',
	},
	title: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: '700',
		letterSpacing: 0.5,
	},
	closeButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
	seasonItem: {
		marginBottom: 12,
		padding: 16,
		borderRadius: 12,
		borderWidth: 2,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	seasonContent: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	seasonText: {
		fontSize: 16,
		fontWeight: '600',
		marginRight: 12,
	},
	langBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
	},
	langText: {
		color: '#ffffff',
		fontSize: 10,
		fontWeight: '700',
		letterSpacing: 0.5,
	},
	item: {
		paddingVertical: 12,
		paddingHorizontal: 8,
		borderRadius: 8,
	},
	currentItem: {
		backgroundColor: 'rgba(255,255,255,0.06)'
	},
	itemText: {
		color: '#ddd'
	},
	currentItemText: {
		color: '#fff',
		fontWeight: '700'
	},
	closeBtn: {
		marginTop: 12,
		alignSelf: 'flex-end'
	},
	closeText: {
		color: '#bbb'
	}
});
