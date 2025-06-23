
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
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
import ExpenseForm from '../../components/ExpenseForm';
import ExpenseListView from '../../components/ExpenseListView';
import { ButtonIcon } from '../../components/Icons';
import TotalAmount from '../../components/TotalAmount';
import { Constants, DarkTheme } from '../../constants/Theme';
import {
	deleteFutureExpenseEvents,
	getExpenseEventsForMonth,
	insertExpenseWithEvent,
	remove,
	update
} from '../../services/databaseService';
import { getCurrentMonth, getMonthLong } from '../services/utilHelper';

const ExpensesScreen = ({ navigation }) => {
  const [expenses, setExpenses] = useState([]);
  const [expense, setExpense] = useState(null);
  const [formTitle, setTitle] = useState('');
  const [listState, setListState] = useState({ isLoading: true, isSaving: false });
  const [modalVisible, setModalVisible] = useState(false);
  const [monthDetails, setMonthDetails] = useState(null);
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);
  const [toastState, setToastState] = useState({
    validationMessage: '',
    isError: false,
    isVisible: false
  });

  const onDismissSnackBar = () => {
    setToastState({ ...toastState, isVisible: false });
  };

  const loadExpenses = async (month) => {
    setListState({ ...listState, isLoading: true });
    try {
      const items = await getExpenseEventsForMonth(month);
      setExpenses(items);
    } catch (err) {
      setToastState({
        isVisible: true,
        isError: true,
        validationMessage: 'Failed to load expenses'
      });
    } finally {
      setListState({ ...listState, isLoading: false });
    }
  };

  const checkMonthDetails = async () => {
    const month = await getCurrentMonth();
    if (!monthDetails || month.month !== monthDetails.month) {
      setMonthDetails(month);
      const headerTitle = getMonthLong(month.month, 'Expenses');
      navigation.setOptions({ headerTitle });
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkMonthDetails();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (monthDetails) {
      loadExpenses(monthDetails.month);
    }
  }, [monthDetails]);

  const togglePaid = async (item) => {
    setListState({ ...listState, isSaving: true });
    try {
      const updatedItem = { ...item, is_paid: !item.is_paid };
      await update('expense_events', updatedItem, item.id);
      setToastState({
        isVisible: true,
        isError: false,
        validationMessage: 'Successfully updated expense'
      });
      loadExpenses(monthDetails.month);
    } catch (err) {
      console.warn('Error updating expense', err);
    } finally {
      setListState({ ...listState, isSaving: false });
    }
  };

  const onSubmitExpense = async (data, expenseRef) => {
    setListState({ ...listState, isSaving: true });
    try {
      data.due_day = new Date(new Date(monthDetails.month).setDate(data.dueDay)).toISOString().split('T')[0];
      data.budget_id = 1; // Placeholder for now

      if (expenseRef && expenseRef.id) {
        await update('expenses', data, expenseRef.id);
        setToastState({
          isVisible: true,
          isError: false,
          validationMessage: 'Successfully updated expense'
        });
      } else {
        await insertExpenseWithEvent(data);
        setToastState({
          isVisible: true,
          isError: false,
          validationMessage: 'Successfully created expense'
        });
      }
      loadExpenses(monthDetails.month);
    } catch (err) {
      console.warn('Error saving expense', err);
    } finally {
      hideModal();
      setListState({ ...listState, isSaving: false });
    }
  };

  const onDeleteExpense = async (item) => {
    if (!item.is_recurring) {
      await remove('expense_events', item.id);
    } else {
      await deleteFutureExpenseEvents(item.expense_id);
    }
    setToastState({
      isVisible: true,
      isError: false,
      validationMessage: 'Successfully deleted expense'
    });
    loadExpenses(monthDetails.month);
  };

  const onMultiDeleteExpenses = async (expenseIds) => {
    for (const id of expenseIds) {
      await remove('expense_events', id);
    }
    setToastState({
      isVisible: true,
      isError: false,
      validationMessage: 'Successfully deleted expenses'
    });
    loadExpenses(monthDetails.month);
  };

  const toggleMultiSelectAction = (enabled) => {
    setMultiSelectEnabled(enabled);
  };

  const editExpense = (item, title) => {
    setExpense(item);
    openModalForm(null, title);
  };

  const openModalForm = (ev, title) => {
    setTitle(title || 'Add Expense');
    setModalVisible(true);
  };

  const hideModal = () => {
    setExpense(null);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {listState.isLoading ?
        <ActivityIndicator animating={true} style={{ paddingVertical: 45 }} color={Constants.primaryColor} /> :
        <>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <TotalAmount
              items={expenses}
              calculateAmount={true}
              fieldKey="amount"
              heading={true}
              color={Constants.warnColor}
              alignment="center"
            />
          </View>
          <View style={{ flex: 8 }}>
            <ExpenseListView
              expenses={expenses}
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
                <ExpenseForm onSubmitForm={onSubmitExpense} expense={expense} onDelete={onDeleteExpense} />
              }
            </View>
          </Modal>
          {modalVisible || multiSelectEnabled ? null :
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