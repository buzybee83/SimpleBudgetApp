import React, { useEffect, useContext, useState } from 'react';
import {
	SafeAreaView,
	Text,
	View,
	StyleSheet,
	Modal
} from 'react-native';
import {
	ActivityIndicator,
	Divider,
	Snackbar
} from 'react-native-paper';
// import Modal from 'react-native-modal';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from 'react-native-elements';
import { Constants, DarkTheme } from '../constants/Theme';
import { Context as ExpenseContext } from '../context/ExpenseContext';
import { Context as BudgetContext } from '../context/BudgetContext';
import { ButtonIcon } from '../components/Icons';
import ExpenseListView from '../components/ExpenseListView';
import ExpenseForm from '../components/ExpenseForm';
import TotalAmount from '../components/TotalAmount';
import { getCurrentMonth, getMonthLong } from '../services/utilHelper';

const ExpensesScreen = ({ navigation }) => {
	const {
		state,
		fetchExpenses,
		createExpense,
		updateExpense,
		deleteExpense,
		deleteManyExpenses,
		clearLoadingError,
		clearError
	} = useContext(ExpenseContext);
	const budgetContext = useContext(BudgetContext);
	const [expense, setExpense] = useState(null);
	const [formTitle, setTitle] = useState('');
	const [listState, setListState] = useState({ isLoading: true, isSaving: false });
	const [modalVisible, setModalVisible] = useState(false);
	const [monthDetails, setMonthDetails] = useState(null);
	const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);
	const [toastSate, setToastState] = useState({ 
		validationMessage: '', 
		isError: false, 
		isVisible: false 
	});  

	const onDismissSnackBar = () => {
		setToastState({...toastSate, isVisible: false, isError: false });
		clearError();
	};

	const refreshExpenseData = React.useCallback(async () => {
		setListState({ ...listState, isLoading: true });
		if (monthDetails) {
			await fetchExpenses(monthDetails.month);
		}
	});

	const checkMonthDetails = async () => {
		const month = await getCurrentMonth(month);
		if (!monthDetails || month._id !== monthDetails._id) {
			state.expenses = [];
			setMonthDetails(month);
			const headerTitle = getMonthLong(month.month, 'Expenses');
			navigation.setOptions({ headerTitle });
		}
	};

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', async () => {
			if (state.loadingErrorMessage) {
				clearLoadingError();
			}
			await checkMonthDetails();
		});
		return unsubscribe;
	}, [navigation]);

	useEffect(() => {
		console.log('##refresh EXPENSE START');
		setListState({ ...listState, isLoading: true });
		try {
			refreshExpenseData();
		} catch(err) {
			console.warn(`Error loading Expenses. ${err}`)
		} finally {
			setListState({ ...listState, isLoading: false });
			if (state.errorMessage || state.loadingErrorMessage) {
				setToastState({
					isVisible: true, 
					isError: true,
					validationMessage: state.errorMessage || state.loadingErrorMessage
				});
			}
			console.log('##refresh EXPENSE END');
		}
	}, [monthDetails, state.lastUpdated]);

	useEffect(() => {
		if (state.errorMessage || state.loadingErrorMessage) {
			setToastState({
				isVisible: true, 
				isError: true,
				validationMessage: state.errorMessage || state.loadingErrorMessage
			});
		}
	}, [state.errorMessage, state.loadingErrorMessage]);

	const togglePaid = async (id) => {
		setListState({ ...listState, isSaving: true });
		const updatedItem = state.expenses.filter(item => item._id === id)[0];
		try {
			updatedItem.isPaid = !updatedItem.isPaid;
			await updateExpense(updatedItem);
			setToastState({
				isVisible: true, 
				isError: false, 
				validationMessage: 'Successfully updated expense' 
			});
			budgetContext.fetchMonthDetails(monthDetails);
		} catch (err) {
			console.warn('ERROR OCCURED IN SAVING EXPENSE - ', err)
		} finally {
			setListState({ ...listState, isSaving: false });
		}
	};

	const onSubmitExpense = async (data, expenseRef) => {
		setListState({ ...listState, isSaving: true });

		try {
			data.frequency = {
				isRecurring: data.isRecurring,
				recurringType: data.recurringType
			};
			data.dueDay = new Date(new Date(monthDetails.month).setDate(data.dueDay));
			let mssg = ''
			if (expenseRef && expenseRef._id) {
				expenseRef = {
					...expenseRef,
					...data
				};
				await updateExpense(expenseRef);
				mssg = 'Successfully updated expense';
			} else {
				data.budgetId = budgetContext.state.budget._id,
				await createExpense(data);
				mssg = 'Successfully created expense';
			}
			setToastState({
				isVisible: true, 
				isError: false,
				validationMessage: mssg
			});
			budgetContext.fetchMonthDetails(monthDetails);
		} catch (err) {
			console.warn('ERROR OCCURED IN SAVING EXPENSE - ', err)
		} finally {
			hideModal();
			setListState({ ...listState, isSaving: false });
		}
	};

	const onDeleteExpense = async (id) => {
		try {
			await deleteExpense(id);
			setToastState({
				isVisible: true, 
				isError: false,
				validationMessage: 'Successfully deleted expense'
			});
			budgetContext.fetchMonthDetails(monthDetails);
		} catch (err) {
			console.warn(err);
		} finally {
			if (modalVisible) {
				hideModal();
			}
		}
	};

	const onMultiDeleteExpenses = async (expenseIds) => {
		await deleteManyExpenses(expenseIds);
		setToastState({
			isVisible: true, 
			isError: false,
			validationMessage: 'Successfully deleted expenses'
		});
		budgetContext.fetchMonthDetails(monthDetails);
	}

	const toggleMultiSelectAction = (enabled) => {
		setMultiSelectEnabled(enabled);
	}

	const editExpense = (id, title) => {
		const expense = state.expenses.filter(item => item._id == id)[0];
		setExpense(expense);
		openModalForm(null, title);
	};

	const openModalForm = (ev, title) => {
		if (title) setTitle(title);
		else setTitle('Add Expense');
		setModalVisible(true);
	};

	const hideModal = () => {
		setExpense(null);
		setModalVisible(false);
	};

	return (
		<SafeAreaView style={styles.container}>
			{listState.isLoading ? 
				<ActivityIndicator animating={true} style={{ paddingVertical: 45 }} color={Constants.primaryColor}/> :
				<>
					<View style={{flex: 1, justifyContent: 'center'}}>
                        <TotalAmount 
							items={state.expenses} 
							calculateAmount={true}
							fieldKey="amount" 
							heading={true}
							color={Constants.warnColor}
							alignment="center"
						/>
                    </View>
					<View style={{flex: 8}}>
						<ExpenseListView 
							expenses={state.expenses} 
							currentMonth={monthDetails}
							onMultiSelectEnabled={toggleMultiSelectAction}
							onUpdate={togglePaid}
							onDelete={onDeleteExpense} 
							onDeleteMany={onMultiDeleteExpenses}
							onViewDetails={editExpense}
						/>
					</View>
					<Modal
						visible={modalVisible}
						animationType="slide"
						presentationStyle="formSheet"
						onRequestClose={hideModal}
					>
						<View style={styles.modalView}>
							<Text style={styles.modalTextHeader}>
								{formTitle}
							</Text>
							<MaterialIcons 
								style={{position: 'absolute', right: 8, top: -8}} 
								name="close" 
								size={28} 
								onPress={hideModal}
							/>
							<Divider style={{ height: 2 }} />
							{listState.isSaving ?
								<ActivityIndicator animating={true} style={{ paddingVertical: 30 }} /> :
								<ExpenseForm onSubmitForm={onSubmitExpense} expense={expense} onDelete={onDeleteExpense} />
							}
						</View>
					</Modal>
					{ modalVisible || multiSelectEnabled || state.loadingErrorMessage ? null :  
						<Button
							buttonStyle={styles.actionButton}
							raised
							onPress={openModalForm}
							icon={
								<ButtonIcon
									name="md-add"
									size={48}
									position="center"
									color="white"
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
		backgroundColor: Constants.warnColor
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
	},
	successToast: {
		backgroundColor: Constants.darkGrey,
		fontWeight: Constants.fontWeightMedium
	},
	errorToast: {
		backgroundColor: Constants.errorBackground,
		color: Constants.whiteColor,
		fontWeight: Constants.fontWeightHeavy
	}
});

export default ExpensesScreen;
