import React, { useState, useEffect, useCallback } from 'react';
import {
	Text,
	StyleSheet,
	View,
	Dimensions,
	TouchableOpacity,
	TouchableHighlight,
} from 'react-native';
import { ActivityIndicator,	Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Constants } from '../constants/Theme';
import { nth, getMonthLong } from '../services/utilHelper';

const WINDOW_WIDTH = Dimensions.get('window').width;

const IncomeListView = ({ income, currentMonth, onDelete, onViewDetails, showPreview }) => {
	const [action, setAction] = useState('');
	const [items, setItems] = useState('');
	const [loading, setLoading] = useState(true);
	const [previewRow, setPreviewRow] = useState('0');

	useEffect(() => {
		if (income) {
			setItems(income);
			if (showPreview) {
				setPreviewRow(income[0]?._id);
			} else {
				setPreviewRow('0');
			}
			setLoading(false);
		}
	}, [income]);

	const getStatus = (day) => {
		let today = new Date();
		day = new Date(day);
		if (day.getFullYear() <= today.getFullYear()) {
			if (day.getDate() > today.getDate() && day.getMonth() >= today.getMonth()) {
				return 'Expected';
			} 
			return 'Received';
		} else {
			return 'Expected';
		}
	}

	const ContentTitle = ({ item }) => {
		return (
			<View style={styles.titleContainer}>
				<Text style={styles.titleText}>{item.description}</Text>
				<Text style={styles.titleText}>
					{item.amount.toLocaleString("en-US",{style: "currency", currency: "USD"})}
				</Text>
			</View>
		);
	}

	const ContentDescription = ({ date, incomeType, frequency }) => {
		date = new Date(date);
		const day = date.getDate();
		incomeType = incomeType ? incomeType : 'One Time';
		return (
			<View style={styles.descriptionContainer}>
				<Text style={styles.infoText}>
					{incomeType} {incomeType == 'Recurring'? `(${frequency})` : ''}
				</Text>
				<Text style={styles.infoText}>
					{`${getStatus(date)} ${date.toLocaleString('default', { month: 'long' })} ${day}${nth(day)}`}
				</Text>
			</View>
		)
	};

	const closeRow = (rowMap, rowKey) => {
		if (rowMap[rowKey]) {
			rowMap[rowKey].closeRow();
		}
	};

	const deleteRow = async (rowMap, rowData) => {
		setAction('delete');
		await onDelete(rowData);
		closeRow(rowMap, rowData._id);
		setAction('');
	};

	const viewDetails = (rowMap, rowDetails) => {
		closeRow(rowMap, rowDetails._id);
		onViewDetails(rowDetails, 'Income Details');
	}

	const renderItem = ({ item }, rowMap) => (
		<TouchableHighlight
			underlayColor={Constants.tintColorLight}
			onPress={() => closeRow(rowMap, item._id)}
			style={styles.rowContainer}
		>
			<View style={styles.rowContent}>
				<MaterialIcons
					size={30}
					style={{marginRight: 6}}
					name="attach-money"
				/>
				<View style={styles.rowContentItems}>
					<ContentTitle item={item} />
					<ContentDescription
						date={item.expectedDate}
						incomeType={item?.incomeFrequency?.frequencyType}
						frequency={item?.incomeFrequency?.frequency}
					/>
				</View>
			</View>
		</TouchableHighlight>
	);
		
	const renderHiddenItem = (data, rowMap) => (
		<View style={styles.rowBack}>
			
			<TouchableOpacity
				style={[styles.backRightBtn, styles.backRightBtnLeft]}
				onPress={() => deleteRow(rowMap, data.item)}
			>
				{action == 'delete' ?
					<ActivityIndicator animating={true} color="white" /> :
					<MaterialIcons
						name="delete"
						size={30}
						color="white"
					/>
				}
			</TouchableOpacity>
			<TouchableOpacity
				style={[styles.backRightBtn, styles.backRightBtnRight]}
				onPress={() => viewDetails(rowMap, data.item)}
			>
				<MaterialIcons
					name="mode-edit"
					size={30}
					color="white"
				/>
			</TouchableOpacity>
		</View>
	);

	const itemToId = useCallback(item => item._id, []);
	
	if (loading) {
		return <ActivityIndicator animating={true} style={{ paddingVertical: 65 }}  color="white" />;
	} else if (items && items.length) {
		return (
			<View style={styles.container}>	
				<SwipeListView
					data={income}
					keyExtractor={itemToId}
					renderItem={renderItem}
					renderHiddenItem={renderHiddenItem}
					disableRightSwipe={true}
					rightOpenValue={-150}
					previewRowKey={previewRow}
					previewOpenValue={-40}
					previewOpenDelay={2000}
				/>
			</View>
		);
	} else {
		return (
			<>
				<Card style={styles.noContentContainer}>
					<Text style={styles.noItemsText}>No income found for {getMonthLong(currentMonth?.month)}.</Text>
					<View style={styles.helpTextContainer}>
						<MaterialIcons name="info" size={34} color={Constants.primaryColor} />
						<Text style={styles.helpText}>Start adding your monthly income here by pressing the [+] button bellow.</Text>
					</View>
				</Card>
			</>
		)
	}
};

const styles = StyleSheet.create({
	noContentContainer: {
		backgroundColor: Constants.whiteColor,
		alignSelf: 'center',
		flexDirection: "column",
		width: (WINDOW_WIDTH - 1),
		height: '100%',
		marginTop: 1,
		paddingTop: 24
	},
	noItemsText: {
		alignSelf: 'center',
		fontSize: Constants.fontMedium,
	},
	helpTextContainer: {
		display: 'flex',
		flexDirection: 'row',
		padding: 24
	},
	helpText: {
		marginHorizontal: 18,
		paddingEnd: 6
	},
	container: {
		backgroundColor: Constants.whiteColor,
		marginTop: 1,
		height: '100%',
	},
	rowContainer: {
		backgroundColor: Constants.whiteColor,
		borderBottomColor: '#ccc',
		borderBottomWidth: 1,
		height: 65,
	},
	rowContent: {
		flex: 1,
		flexDirection: "row",
		paddingStart: 20,
		alignItems: 'center'
	},
	rowContentItems: {
		flex: 1,
		flexDirection: "column",
		paddingEnd: 20
	},
	titleContainer: {
		flex: 1,
		paddingTop: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	descriptionContainer: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	titleText: {
		fontSize: Constants.fontMedium,
		fontWeight: Constants.fontWeightHeavy,
	},
	infoText: {
		fontSize: Constants.fontSmall,
		color: '#4c4c4c',
	},
	errorText: {
		color: Constants.errorText
	},
	rowBack: {
		backgroundColor: '#DDD',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingLeft: 10,
	},
	backLeftBtn: {
		flexDirection: 'row',
	},
	backRightBtn: {
		alignItems: 'center',
		bottom: 0,
		justifyContent: 'center',
		position: 'absolute',
		top: 0,
		width: 75,
	},
	backRightBtnLeft: {
		backgroundColor: Constants.errorBackground,
		right: 75,
	},
	backRightBtnRight: {
		backgroundColor: Constants.primaryColor,
		right: 0,
	},
});

export default IncomeListView;