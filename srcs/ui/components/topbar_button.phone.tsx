import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, GestureResponderEvent } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../constants/colors';
import { TopBarButtonProps } from '../../types/components';


const TopBarButton: React.FC<TopBarButtonProps> = ({ icon, label, onPress, accessibilityLabel, size = 22 }) => {
	return (
		<TouchableOpacity
			style={styles.container}
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			activeOpacity={0.75}
		>
			<View style={styles.iconWrapper}>
				<Icon name={icon} size={size} color="#fff" />
			</View>
			{label ? <Text style={styles.label}>{label}</Text> : null}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		marginLeft: 8,
	},
	iconWrapper: {
		width: 48,
		height: 48,
		borderRadius: 12,
		backgroundColor: Colors.getPrimaryColor(),
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.25,
		shadowRadius: 6,
		elevation: 4,
	},
	label: {
		color: '#ccc',
		fontSize: 12,
		marginTop: 6,
	}
});

export default TopBarButton;
