import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { SectionHeaderPhoneProps } from '../../types/components';

export const SectionHeaderPhone: React.FC<SectionHeaderPhoneProps> = ({ title, onSeeAll }) => (
	<View style={styles.row}>
		<Text style={styles.title}>{title}</Text>
		{onSeeAll ? (
			<Pressable onPress={onSeeAll} style={styles.seeAll}>
				<Text style={styles.seeAllText}>Voir tout</Text>
			</Pressable>
		) : null}
	</View>
);

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 12,
		marginBottom: 8
	},
	title: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '700'
	},
	seeAll: {
		paddingHorizontal: 8,
		paddingVertical: 6
	},
	seeAllText: {
		color: Colors.getPrimaryColor(),
		fontWeight: '600'
	},
});
