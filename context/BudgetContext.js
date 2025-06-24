import React, { createContext, useReducer } from 'react';
import {
  getAll,
  getByField,
  insert
} from '../services/DatabaseService';

const BudgetContext = createContext();

const initialState = {
  budget: null,
  currentMonth: null,
  errorMessage: '',
  firstActiveIdx: 0
};

const budgetReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BUDGET':
      return { ...state, budget: action.payload };
    case 'SET_MONTH':
      return { ...state, currentMonth: action.payload };
    case 'SET_ERROR':
      return { ...state, errorMessage: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, errorMessage: '' };
    case 'SET_ACTIVE_INDEX':
      return { ...state, firstActiveIdx: action.payload };
    default:
      return state;
  }
};

export const BudgetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  const fetchBudget = async () => {
    try {
      const budgets = await getAll('budgets');
      if (budgets.length > 0) {
        dispatch({ type: 'SET_BUDGET', payload: budgets[0] });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch budget' });
    }
  };

  const fetchMonthDetails = async (month) => {
    try {
      const [details] = await getByField('months', 'month', month);
      dispatch({ type: 'SET_MONTH', payload: details });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch month details' });
    }
  };

  const createBudget = async (budget) => {
    try {
      await insert('settings', budget);
      await fetchBudget();
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create budget' });
    }
  };

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return (
    <BudgetContext.Provider
      value={{
        state,
        fetchBudget,
        fetchMonthDetails,
        createBudget,
        clearError,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export { BudgetContext };
