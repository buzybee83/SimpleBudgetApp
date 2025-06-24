import { openDatabaseAsync } from 'expo-sqlite';
import { tables } from './db/tables';

let db;

export async function getDb() {
	if (!db) {
		db = await openDatabaseAsync('budget.db');
	}
	return db;
}

export async function initDatabase() {
	const db = await getDb();

	for (let i = 0; i < tables.length; i++) {
		const sql = tables[i];
		try {
			await db.execAsync(sql);
		} catch (err) {
			console.error(`Error in table #${i + 1}:`, err);
			throw err;
		}
	}
}

export async function getAll(table) {
	const db = await getDb();
	try {
		return await db.getAllAsync(`SELECT * FROM ${table}`);
	} catch (error) {
		console.warn(`getAll(${table}) failed:`, error);
		return [];
	}
}

export async function getByField(table, field, value) {
	const db = await getDb();
	try {
		return await db.getAllAsync(`SELECT * FROM ${table} WHERE ${field} = ?`, value);
	} catch (error) {
		console.warn(`getByField(${table}, ${field}) failed:`, error);
		return [];
	}
}

export async function getIncomeEventsForMonth(month) {
	const db = await getDb();
	return await db.getAllAsync(
		"SELECT * FROM income_events WHERE strftime('%Y-%m', expected_date) = ?",
		month
	);
}

export async function insert(table, fields) {
	const db = await getDb();
	const keys = Object.keys(fields);
	const placeholders = keys.map(() => '?').join(', ');
	const values = Object.values(fields);
	await db.runAsync(
		`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
		...values
	);
}

export async function update(table, fields, id) {
	const db = await getDb();
	const set = Object.keys(fields).map((key) => `${key} = ?`).join(', ');
	const values = [...Object.values(fields), id];
	await db.runAsync(`UPDATE ${table} SET ${set} WHERE id = ?`, ...values);
}

export async function remove(table, id) {
	const db = await getDb();
	await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, id);
}

export async function insertIncomeWithEvent(income) {
	await insert('incomes', income);
	const db = await getDb();
	const result = await db.getFirstAsync('SELECT last_insert_rowid() as id');
	const incomeId = result.id;

	await insert('income_events', {
		income_id: incomeId,
		budget_id: income.budget_id,
		description: income.description,
		expected_date: income.expected_date,
		amount: income.amount
	});
}

export async function insertExpenseWithEvent(expense) {
	await insert('expenses', expense);
	const db = await getDb();
	const result = await db.getFirstAsync('SELECT last_insert_rowid() as id');
	const expenseId = result.id;

	await insert('expense_events', {
		expense_id: expenseId,
		budget_id: expense.budget_id,
		name: expense.name,
		due_day: expense.due_day,
		amount: expense.amount,
		is_paid: expense.is_paid || 0
	});
}

export async function getExpenseEventsForMonth(month) {
	const db = await getDb();
	return await db.getAllAsync(
		"SELECT * FROM expense_events WHERE strftime('%Y-%m', due_day) = ?",
		month
	);
}

export async function deleteFutureExpenseEvents(expenseId, fromDate = new Date()) {
	const db = await getDb();
	const cutoff = fromDate.toISOString().split('T')[0];

	const result = await db.getFirstAsync(
		"SELECT COUNT(*) as count FROM expense_events WHERE expense_id = ? AND due_day < ?",
		expenseId, cutoff
	);

	if (result.count > 0) {
		await db.runAsync(
			"DELETE FROM expense_events WHERE expense_id = ? AND due_day >= ?",
			expenseId, cutoff
		);
	} else {
		await db.runAsync("DELETE FROM expense_events WHERE expense_id = ?", expenseId);
		await db.runAsync("DELETE FROM expenses WHERE id = ?", expenseId);
	}
}

export async function getUserSettings(userId) {
	const db = await getDb();
	return await db.getFirstAsync("SELECT * FROM settings WHERE user_id = ?", userId);
}

export async function upsertSettings(fields) {
	const existing = await getUserSettings(fields.user_id);
	if (existing) {
		await update('settings', fields, existing.id);
	} else {
		await insert('settings', fields);
	}
}

export async function getMonthlyDetail(budgetId, month) {
	const db = await getDb();
	return await db.getFirstAsync(
		"SELECT * FROM monthly_details WHERE budget_id = ? AND month = ?",
		budgetId, month
	);
}

export async function upsertMonthlyDetail(fields) {
	const existing = await getMonthlyDetail(fields.budget_id, fields.month);
	if (existing) {
		await update('monthly_details', fields, existing.id);
	} else {
		await insert('monthly_details', fields);
	}
}

export async function addMonthlySavings(monthId, incomeId, amount) {
	await insert('monthly_savings', { month_id: monthId, income_id: incomeId, amount });
}
