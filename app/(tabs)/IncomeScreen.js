import { MaterialIcons } from '@expo/vector-icons';
import React, { useContext, useEffect, useState } from 'react';
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
import { ButtonIcon } from '../components/Icons';
import IncomeForm from '../components/IncomeForm';
import IncomeListView from '../components/IncomeListView';
import TotalAmount from '../components/TotalAmount';
import { Constants, DarkTheme } from '../constants/Theme';
import { Context as BudgetContext } from '../context/BudgetContext';
import { Context as IncomeContext } from '../context/IncomeContext';
import { getCurrentMonth, getMonthLong } from '../services/utilHelper';

const IncomeScreen = ({ navigation }) => {
	const {
		state,
		fetchIncome,
		createIncome,
		updateIncome,
		updateIncomeItem,
		deleteIncomeItem,
		clearLoadingError,
		clearError
	} = useContext(IncomeContext);
	const budgetContext = useContext(BudgetContext);
	const [income, setIncome] = useState(null);
	const [formTitle, setTitle] = useState('');
	const [listState, setListState] = useState({ isLoading: true, isSaving: false });
	const [modalVisible, setModalVisible] = useState(false);
	const [currentMonth, setCurrentMonth] = useState(null);
	const [toastSate, setToastState] = useState({ 
		validationMessage: '', 
		isError: false, 
		isVisible: false 
	});  
	
	const onDismissSnackBar = () => {
		setToastState({...toastSate, isVisible: false, isError: false });
		clearError();
	};

	const refreshIncomeData = React.useCallback(async () => {
		if (currentMonth) {
			await fetchIncome(currentMonth.month);
		}
	});

	const checkCurrentMonth = async () => {
		const month = await getCurrentMonth(budgetContext.state.budget.monthlyBudget);
		if (!currentMonth || month._id !== currentMonth._id) {
			state.income = [];
			setCurrentMonth(month);
			const headerTitle = getMonthLong(month.month, 'Income');
			navigation.setOptions({ headerTitle });
		}
	};

	useEffect(() => {
		setListState({ ...listState, isLoading: true })
		const unsubscribe = navigation.addListener('focus', () => {
			if (state.loadingErrorMessage) {
				clearLoadingError();
			}
			checkCurrentMonth();
		});
		return unsubscribe;
	}, [navigation]);

	useEffect(() => {
		console.log('##refresh INCOME START');
		setListState({ ...listState, isLoading: true });
		try {
			refreshIncomeData();
		} catch (err) {
			console.warn(`Error loading Income. ${err}`)
		} finally {
			setListState({ ...listState, isLoading: false });
			if (state.errorMessage || state.loadingErrorMessage) {
				setToastState({
					isVisible: true, 
					isError: true,
					validationMessage: state.errorMessage || state.loadingErrorMessage
				});
			}
			console.log('##refresh INCOME DONE');
		}
	}, [currentMonth, state.lastUpdated]);

	useEffect(() => {
		if (state.errorMessage || state.loadingErrorMessage) {
			setToastState({
				isVisible: true, 
				isError: true,
				validationMessage: state.errorMessage || state.loadingErrorMessage
			});
		}
	}, [state.errorMessage, state.loadingErrorMessage]);

	const actionRequired = (itemToDelete) => {
		Alert.alert(
			"Warning",
			"This is part of your recurring monthly income. How would you like to proceed?",
			[
				{
					text: "Delete all occurrances",
					onPress: () => deleteIncome(itemToDelete, 'all'),
					style: 'destructive'
				},
				{
					text: "Delete this only",
					onPress: () => deleteIncome(itemToDelete, 'current'),
				}, {
					text: "Cancel",
					onPress: () => hideModal(),
					style: "cancel"
				}
			]
		);
	};

	const onSubmitIncome = async (data, incomeRef, saveOption) => {
		try {
			// data.amount = parseFloat(data.amount).toFixed(2);
			let statusMsg = '';
			data.incomeFrequency = {
				frequencyType: data.frequencyType,
				frequency: data.frequency
			}
			data.expectedDate = new Date(new Date(currentMonth.month).setDate(data.expectedDate));
			console.log('NEW income= ', data)
			if (incomeRef && incomeRef._id) {
				incomeRef = {
					...incomeRef,
					...data
				};

				saveOption = saveOption?.value;
				if (saveOption) {
					incomeRef._id = incomeRef.incomeId ? incomeRef.incomeId : incomeRef._id;
					await updateIncome(incomeRef, saveOption);
					statusMsg = 'Successfully updated income series';
				} else {
					await updateIncomeItem(incomeRef);
					statusMsg = 'Successfully updated income';
				}
			} else {
				data.isAutomated = data.frequencyType !== 'Misc/One time' ? true : false;
				await createIncome(data);
				statusMsg = `Successfully created income ${data.isAutomated ? 'series': ''}`;
			}
			setToastState({
				isVisible: true, 
				isError: false,
				validationMessage: statusMsg
			});
			budgetContext.fetchMonthDetails(currentMonth);
		} catch (err) {
			Alert.alert(`Oops, something went wrong. Error: ${err}`);
			console.log(`ERROR OCCURED IN ${incomeRef ? 'SAVING' : 'CREATING'} INCOME => `, err)
		} finally {
			hideModal();
		}
	};

	const onDelete = (itemToDelete) => {
		if (!itemToDelete.isAutomated) {
			deleteIncome(itemToDelete)
		} else {
			actionRequired(itemToDelete);
		}
	};

	const deleteIncome = async (itemToDelete, deleteOccurrences) => {
		try {
			await deleteIncomeItem(itemToDelete, deleteOccurrences);
			console.log(deleteOccurrences)
			setToastState({
				isVisible: true, 
				isError: false,
				validationMessage: `Successfully deleted income ${deleteOccurrences == 'all' ? 'series' : ''}`
			});
			budgetContext.fetchMonthDetails(currentMonth);
		} catch (err) {
			console.warn(err);
		} finally {
			if (modalVisible) {
				hideModal();
			}
		}
	};

	const editIncome = (incomeToEdit, title) => {
		setIncome(incomeToEdit);
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
							items={state.income}
							fieldKey="amount"
							calculateAmount={true}
							color={Constants.successColor}
							heading={true}
							alignment="center"
						/>
					</View>
					<View style={{ flex: 8 }}>
						<IncomeListView
							income={state.income}
							currentMonth={currentMonth}
							onDelete={onDelete}
							onViewDetails={editIncome}
							showPreview={budgetContext.state.budget?.settings.showPreview}
						/>
					</View>

					<Modal
						visible={modalVisible}
						animationType="slide"
						presentationStyle="pageSheet"
						onRequestClose={hideModal}
					>
						<View style={styles.modalView}>
							<Text style={styles.modalTextHeader}>
								{formTitle}
							</Text>
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
									settings={budgetContext.state.budget?.settings}
								/>
							}
						</View>
					</Modal>
					{modalVisible || state.loadingErrorMessage ? null :
						<Button
							buttonStyle={styles.actionButton}
							raised
							onPress={openModalForm}
							icon={
								<ButtonIcon
									name="md-add"
									size={48}
									position="center"
								/>
							}
						/>
					}
					<Snackbar
						style={ toastSate.isError ? styles.errorToast : styles.successToast}
						visible={toastSate.isVisible}
						onDismiss={onDismissSnackBar}
						action={{
							labelStyle: { fontSize: 24 },
							color: toastSate.isError ? '#fff' : Constants.secondaryColor,
							icon: 'close',
							onPress: () => {
								onDismissSnackBar()
							},
						}}
					>
						{ toastSate.validationMessage }
					</Snackbar>
				</>
			}
		</SafeAreaView>
	);
}
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
