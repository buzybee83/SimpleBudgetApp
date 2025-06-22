export interface Income { id?: number; amount: number; date: string; source?: string; notes?: string }
export interface Expense { id?: number; amount: number; date: string; category?: string; notes?: string; envelope_id?: number }
export interface Envelope { id?: number; name: string; budget: number; balance: number }
export interface Debt { id?: number; name: string; principal: number; interest_rate?: number; due_date?: string; type?: string }

export type TableName = 'income' | 'expenses' | 'envelopes' | 'debts';

export type ModelOf<T extends TableName> =
  T extends 'income'     ? Income    :
  T extends 'expenses'   ? Expense   :
  T extends 'envelopes'  ? Envelope  :
  T extends 'debts'      ? Debt      :
  never;
