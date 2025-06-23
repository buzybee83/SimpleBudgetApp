import * as React from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { Constants } from '../constants/Theme';

const TabBarIcon = (props) => {
	return (
		<MaterialIcons
			name={props.name}
			size={30}
			style={{ marginBottom: -3 }}
			color={props.focused ? Constants.iconSelected : Constants.iconDefault}
		/>
	);
}

const InputIcon = (props) => {
	return (
		<Ionicons
			name={props.name}
			size={props.size}
			style={styles[props.class]}
			color={props.focused ? Constants.iconSelected : Constants.iconDefault}
		/>
	);
}

const ButtonIcon = (props) => {
	if (props.type == 'material') {
		return (
			<MaterialIcons
				name={props.name}
				size={props.size}
				style={styles[props.position]}
				color={props.color}
			/>
		)
	} 
	return (
		<Ionicons
			name={props.name}
			size={props.size}
			style={styles[props.position]}
			color={props.color}
		/>
	);
}

const ListIcon = (props) => {
	return (
		<Ionicons
			name={props.name}
			size={props.size}
			style={props.style}
			color={props.focused ? Constants.iconSelected : Constants.iconDefault}
		/>
	);
}

const styles = StyleSheet.create({
	leftIcon: {
		marginLeft: -11,
		marginRight: 6
	},
	left: {
		display: 'flex',
		marginRight: 6
	},
	center: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
		textAlign: 'center',
	}
});

export { TabBarIcon, InputIcon, ButtonIcon }