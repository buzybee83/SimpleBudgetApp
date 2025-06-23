import React, { useState, useEffect, useCallback } from 'react';
import {
	Text,
	StyleSheet,
	View,
	Dimensions,
	TouchableOpacity,
	TouchableHighlight,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { ButtonIcon } from '../components/Icons';
import { ActivityIndicator,	Card, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Constants } from '../constants/Theme';
import { getMonthLong, nth } from '../services/utilHelper';

const WINDOW_WIDTH = Dimensions.get('window').width;

const ExpenseListView = ({ 
	expenses, 
	currentMonth, 
	onUpdate, 
	onDelete, 
	onDeleteMany,
	onMultiSelectEnabled,
	onViewDetails, 
	showPreview 
}) => {
	const [action, setAction] = useState('');
	const [items, setItems] = useState('');
	const [loading, setLoading] = useState(true);
	const [previewRow, setPreviewRow] = useState('0');
	const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);
	
	useEffect(() => {
		setLoading(true);
		if (expenses) {
			setItems(expenses);
			if (showPreview) {
				setPreviewRow(expenses[0]?._id);
			} else {
				setPreviewRow('0');
			}
			setLoading(false);
		}
	}, [expenses]);

	const ContentTitle = ({ item }) => {
		return (
			<View style={styles.titleContainer}>
				<Text style={styles.titleText}>{item.name}</Text>
				<Text style={styles.titleText}>{item.amount.toLocaleString("en-US",{style: "currency", currency: "USD"})}</Text>
			</View>
		);
	}

	const ContentDescription = ({ day, isPaid, isRecurring }) => {
		const textColor = isPaid ? { color: Constants.successColor, marginTop: -6 } : { color: Constants.errorText };
		return (
			<View style={styles.descriptionContainer}>
				<Text style={[styles.infoText, textColor]}>{isPaid ?
					<MaterialIcons
						size={28}
						name="check"
					/> : 'Not Paid'}
				</Text>
				<Text style={styles.infoText}>
					{`${!isRecurring ? 'One-Time ' : ''}Due: ${getMonthLong(currentMonth.month)} ${day}${nth(day)}`}
				</Text>
			</View>
		)
	};

	const resetSelection = () => {
		expenses = expenses.map(exp => {
			exp.isSelected = false;
			return exp;
		});
		setItems(expenses);
	};

	const closeRow = (rowMap, rowKey) => {
		if (rowMap[rowKey]) {
			rowMap[rowKey].closeRow();
		}
	};

	const toggleMultiselect = (reset = true) => {
		const enabled = !multiSelectEnabled;
		setMultiSelectEnabled(enabled);
		if (reset && !enabled) resetSelection();
		if (onMultiSelectEnabled) onMultiSelectEnabled(enabled);
	}

	const toggleCheck = async (rowMap, rowKey) => {
		setAction('update');
		await onUpdate(rowKey);
		setAction('');
		closeRow(rowMap, rowKey);
	};

	const deleteRow = async (rowMap, rowKey) => {
		setAction('delete');
		await onDelete(rowKey);
		closeRow(rowMap, rowKey);
		setAction('');
	};

	const deleteMany = async () => {
		setLoading(true);
		toggleMultiselect(false);
		const itemsToDelete = items
			.filter(itm => itm.isSelected)
			.map(itm => itm._id);
		await onDeleteMany(itemsToDelete);
		setLoading(false);
	}

	const viewDetails = (rowMap, rowKey) => {
		closeRow(rowMap, rowKey);
		onViewDetails(rowKey, 'Expense Details');
	}

	const renderItem = ({ item }, rowMap) => (
		<TouchableHighlight
			underlayColor={Constants.tintColorLight}
			onPress={() => closeRow(rowMap, item._id)}
			onLongPress={() => toggleMultiselect()}
			style={styles.rowContainer}
		>
			<View style={styles.rowContent}>
				{multiSelectEnabled &&
					<Checkbox
						style={styles.checkbox}
						value={item.isSelected}
						onValueChange={() => {
							expenses = expenses.map(exp => {
								if (exp._id == item._id) exp.isSelected = !exp.isSelected;
								return exp;
							});
							setItems(expenses);
							console.log('Selected>', expenses)
						}}
						color={Constants.warnColor}
					/>
				}
				<MaterialIcons
					size={30}
					style={{marginRight: 8}}
					name="credit-card"
				/>
				<View style={styles.rowContentItems}>
					<ContentTitle item={item} />
					<ContentDescription
						day={new Date(item.dueDay).getDate()}
						isPaid={item.isPaid}
						isRecurring={item.frequency.isRecurring}
					/>
				</View>
			</View>
		</TouchableHighlight>
	);

	const renderHiddenItem = (data, rowMap) => (
		<View style={styles.rowBack}>
			<TouchableOpacity
				style={styles.backLeftBtn}
				onPress={() => toggleCheck(rowMap, data.item._id)}
			>
				{action == 'update' ?
					<ActivityIndicator animating={true} color={Constants.primaryColor} /> :
					<>
						<MaterialIcons
							size={28}
							name={data.item.isPaid ? 'close' : 'check'}
						/>
						<Text style={{ paddingTop: 8 }}>{data.item.isPaid ? 'Not Paid' : 'Paid'}</Text>
					</>
				}
			</TouchableOpacity>
			<TouchableOpacity
				style={[styles.backRightBtn, styles.backRightBtnLeft]}
				onPress={() => deleteRow(rowMap, data.item._id)}
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
				onPress={() => viewDetails(rowMap, data.item._id)}
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
					data={items}
					keyExtractor={itemToId}
					renderItem={renderItem}
					renderHiddenItem={renderHiddenItem}
					leftOpenValue={95}
					rightOpenValue={-150}
					previewRowKey={previewRow}
					previewOpenValue={-40}
					previewOpenDelay={2000}
				/>
				{!multiSelectEnabled ? null :  
					<Button
						buttonStyle={styles.actionButton}
						raised
						onPress={deleteMany}
						icon={
							<ButtonIcon
								type="material"
								name="delete"
								size={40}
								position="center"
								color={Constants.warnColor}
							/>
						}
					/>
				}
			</View>
		);
	} else {
		return (
			<Card style={styles.noContentContainer}>
				<Text style={styles.noItemsText}>No expenses found.</Text>
				<View style={styles.helpTextContainer}>
					<MaterialIcons name="info" size={34} color={Constants.primaryColor} />
					<Text style={styles.helpText}>Start adding your monthly expenses here by pressing the [+] button bellow.</Text>
				</View>
			</Card>
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
	checkbox: {
		marginEnd: 12
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
	actionButton: {
		display: 'flex',
		position: 'absolute',
		bottom: 8,
		alignSelf: 'center',
		justifyContent: 'center',
		paddingLeft: 10,
		width: 64,
		height: 64,
		borderRadius: 100,
		backgroundColor: Constants.whiteColor
	},
});

export default ExpenseListView;