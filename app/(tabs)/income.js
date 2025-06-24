
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
	Alert,
	Modal,
	SafeAreaView,
	StyleSheet,
	Text,
	View
} from 'react-native';
import { Button } from 'react-native-elements';
import {
	ActivityIndicator,
	Divider,
	Snackbar
} from 'react-native-paper';
import { ButtonIcon } from '../../components/Icons';
import IncomeForm from '../../components/IncomeForm';
import IncomeListView from '../../components/IncomeListView';
import TotalAmount from '../../components/TotalAmount';
import { Constants, DarkTheme } from '../../constants/Theme';
import {
	deleteFutureIncomeEvents,
	getIncomeEventsForMonth,
	insertIncomeWithEvent,
	remove,
	update
} from '../../services/DatabaseService';
import { getCurrentMonth, getMonthLong } from '../../services/utils/utilHelper';

const IncomeScreen = ({ navigation }) => {
	const [incomeEvents, setIncomeEvents] = useState([]);
	const [listState, setListState] = useState({ isLoading: true, isSaving: false });
	const [modalVisible, setModalVisible] = useState(false);
	const [currentMonth, setCurrentMonth] = useState(null);
	const [income, setIncome] = useState(null);
	const [formTitle, setTitle] = useState('');
	const [toastState, setToastState] = useState({
		validationMessage: '',
		isError: false,
		isVisible: false
	});

	const onDismissSnackBar = () => {
		setToastState({ ...toastState, isVisible: false });
	};

	const loadIncomeEvents = async (month) => {
		setListState({ ...listState, isLoading: true });
		try {
			const items = await getIncomeEventsForMonth(month);
			setIncomeEvents(items);
		} catch (err) {
			setToastState({
				isVisible: true,
				isError: true,
				validationMessage: 'Failed to load income data.'
			});
		} finally {
			setListState({ ...listState, isLoading: false });
		}
	};

	const checkCurrentMonth = async () => {
		const month = await getCurrentMonth();
		if (!currentMonth || month.month !== currentMonth.month) {
			setCurrentMonth(month);
			const headerTitle = getMonthLong(month.month, 'Income');
			navigation.setOptions({ headerTitle });
		}
	};

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			checkCurrentMonth();
		});
		return unsubscribe;
	}, [navigation]);

	useEffect(() => {
		if (currentMonth) {
			loadIncomeEvents(currentMonth.month);
		}
	}, [currentMonth]);

	const onSubmitIncome = async (data, incomeRef, saveOption) => {
		try {
			setListState({ ...listState, isSaving: true });
			data.incomeFrequency = {
				frequencyType: data.frequencyType,
				frequency: data.frequency
			};
			data.expected_date = new Date(new Date(currentMonth.month).setDate(data.expectedDate)).toISOString().split('T')[0];
			if (incomeRef && incomeRef.id) {
				await update('incomes', data, incomeRef.id);
				setToastState({
					isVisible: true,
					isError: false,
					validationMessage: 'Successfully updated income'
				});
			} else {
				data.is_automated = data.frequencyType !== 'Misc/One time';
				data.budget_id = 1; // Placeholder
				await insertIncomeWithEvent(data);
				setToastState({
					isVisible: true,
					isError: false,
					validationMessage: 'Successfully created income'
				});
			}
			loadIncomeEvents(currentMonth.month);
		} catch (err) {
			Alert.alert(`Error saving income: ${err}`);
		} finally {
			setListState({ ...listState, isSaving: false });
			hideModal();
		}
	};

	const onDelete = (item) => {
		if (!item.is_automated) {
			remove('income_events', item.id).then(() => loadIncomeEvents(currentMonth.month));
		} else {
			Alert.alert(
				"Warning",
				"This is part of a recurring income. How would you like to proceed?",
				[
					{
						text: "Delete all future",
						onPress: async () => {
							await deleteFutureIncomeEvents(item.income_id);
							loadIncomeEvents(currentMonth.month);
						},
						style: 'destructive'
					},
					{
						text: "Delete this only",
						onPress: async () => {
							await remove('income_events', item.id);
							loadIncomeEvents(currentMonth.month);
						}
					},
					{ text: "Cancel", style: "cancel" }
				]
			);
		}
	};

	const editIncome = (item, title) => {
		setIncome(item);
		openModalForm(null, title);
	};

	const openModalForm = (ev, title) => {
		if (title) setTitle(title);
		else setTitle('Add Income');
		setModalVisible(true);
	};

	const hideModal = () => {
		setIncome(null);
		setModalVisible(false);
	};

	return (
		<SafeAreaView style={styles.container}>
			{listState.isLoading ?
				<ActivityIndicator animating={true} style={{ flex: 1 }} color={Constants.primaryColor} /> :
				<>
					<View style={{ flex: 1, justifyContent: 'center' }}>
						<TotalAmount
							items={incomeEvents}
							fieldKey="amount"
							calculateAmount={true}
							color={Constants.successColor}
							heading={true}
							alignment="center"
						/>
					</View>
					<View style={{ flex: 8 }}>
						<IncomeListView
							income={incomeEvents}
							currentMonth={currentMonth}
							onDelete={onDelete}
							onViewDetails={editIncome}
							showPreview={true}
						/>
					</View>

					<Modal
						visible={modalVisible}
						animationType="slide"
						presentationStyle="pageSheet"
						onRequestClose={hideModal}
					>
						<View style={styles.modalView}>
							<Text style={styles.modalTextHeader}>{formTitle}</Text>
							<MaterialIcons
								style={{ position: 'absolute', right: 8, top: -8 }}
								name="close"
								size={28}
								onPress={hideModal}
							/>
							<Divider style={{ height: 2 }} />
							{listState.isSaving ?
								<ActivityIndicator animating={true} style={{ paddingVertical: 30 }} /> :
								<IncomeForm
									onSubmitForm={onSubmitIncome}
									income={income}
									onDelete={onDelete}
								/>
							}
						</View>
					</Modal>
					<Button
						buttonStyle={styles.actionButton}
						raised
						onPress={openModalForm}
						icon={<ButtonIcon name="md-add" size={48} position="center" />}
					/>
					<Snackbar
						style={toastState.isError ? styles.errorToast : styles.successToast}
						visible={toastState.isVisible}
						onDismiss={onDismissSnackBar}
						action={{
							labelStyle: { fontSize: 24 },
							color: toastState.isError ? '#fff' : Constants.secondaryColor,
							icon: 'close',
							onPress: () => onDismissSnackBar()
						}}
					>
						{toastState.validationMessage}
					</Snackbar>
				</>
			}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignContent: 'stretch',
		justifyContent: 'space-between',
		...DarkTheme
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
		backgroundColor: Constants.secondaryColor
	},
	modalView: {
		flex: 1,
		backgroundColor: 'white',
		marginTop: 20,
		paddingHorizontal: 24
	},
	modalTextHeader: {
		fontSize: Constants.fontLarge,
		fontWeight: Constants.fontWeightMedium,
		marginBottom: 12,
		textAlign: "center"
	}
});

export default IncomeScreen;