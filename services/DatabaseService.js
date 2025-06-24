import { openDatabaseAsync } from 'expo-sqlite';
import { tables } from './db/tables'; // your array of CREATE TABLE SQL strings

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

export async function executeSql(sql, params = []) {
	const db = await getDb();
	try {
		const statements = [[sql, params]];
		const resultSet = await db.execAsync(statements, false); // false = not readOnly
		const rows = resultSet[0]?.rows ?? [];
		return { rows };
	} catch (error) {
		console.warn('SQL Error:', sql, params, error);
		throw error;
	}
}

function parseRows(rowsArray) {
	return rowsArray.map((row) => row);
}

export async function getAll(table) {
	try {
		const result = await executeSql(`SELECT * FROM ${table}`);
		return result?.rows ? parseRows(result.rows) : [];
	} catch (error) {
		console.warn(`getAll(${table}) failed:`, error);
		return [];
	}
}

export async function getByField(table, field, value) {
	try {
		const result = await executeSql(`SELECT * FROM ${table} WHERE ${field} = ?`, [value]);
		return result?.rows ? parseRows(result.rows) : [];
	} catch (error) {
		console.warn(`getByField(${table}, ${field}) failed:`, error);
		return [];
	}
}

// === INCOME ===
export async function getIncomeEventsForMonth(month) {
	const result = await executeSql(
		"SELECT * FROM income_events WHERE strftime('%Y-%m', expected_date) = ?",
		[month]
	);
	return result?.rows ? parseRows(result.rows) : [];
}

export async function insert(table, fields) {
	const keys = Object.keys(fields);
	const placeholders = keys.map(() => '?').join(', ');
	const values = Object.values(fields);
	await executeSql(
		`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
		values
	);
}

export async function update(table, fields, id) {
	const set = Object.keys(fields)
		.map((key) => `${key} = ?`)
		.join(', ');
	const values = [...Object.values(fields), id];
	await executeSql(`UPDATE ${table} SET ${set} WHERE id = ?`, values);
}

export async function remove(table, id) {
	await executeSql(`DELETE FROM ${table} WHERE id = ?`, [id]);
}

export async function insertIncomeWithEvent(income) {
	await insert('incomes', income);
	const result = await executeSql('SELECT last_insert_rowid() as id');
	const incomeId = result.rows.item(0).id;

	await insert('income_events', {
		income_id: incomeId,
		budget_id: income.budget_id,
		description: income.description,
		expected_date: income.expected_date,
		amount: income.amount
	});
}

// === EXPENSES ===
export async function insertExpenseWithEvent(expense) {
	await insert('expenses', expense);
	const result = await executeSql('SELECT last_insert_rowid() as id');
	const expenseId = result.rows.item(0).id;

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
	const result = await executeSql(
		"SELECT * FROM expense_events WHERE strftime('%Y-%m', due_day) = ?",
		[month]
	);
	return result?.rows ? parseRows(result.rows) : [];
}

export async function deleteFutureExpenseEvents(expenseId, fromDate = new Date()) {
	const cutoff = fromDate.toISOString().split('T')[0]; // YYYY-MM-DD

	const result = await executeSql(
		"SELECT COUNT(*) as count FROM expense_events WHERE expense_id = ? AND due_day < ?",
		[expenseId, cutoff]
	);
	const hasHistory = result.rows.item(0).count > 0;

	if (hasHistory) {
		await executeSql(
			"DELETE FROM expense_events WHERE expense_id = ? AND due_day >= ?",
			[expenseId, cutoff]
		);
	} else {
		await executeSql("DELETE FROM expense_events WHERE expense_id = ?", [expenseId]);
		await executeSql("DELETE FROM expenses WHERE id = ?", [expenseId]);
	}
}

// === SETTINGS HELPERS ===

export async function getUserSettings(userId) {
	const result = await executeSql("SELECT * FROM settings WHERE user_id = ?", [userId]);
	return result.rows.length ? result.rows.item(0) : null;
}

export async function upsertSettings(fields) {
	const existing = await getUserSettings(fields.user_id);
	if (existing) {
		await update('settings', fields, existing.id);
	} else {
		await insert('settings', fields);
	}
}

// === MONTHLY DETAILS HELPERS ===

export async function getMonthlyDetail(budgetId, month) {
	const result = await executeSql(
		"SELECT * FROM monthly_details WHERE budget_id = ? AND month = ?",
		[budgetId, month]
	);
	return result.rows.length ? result.rows.item(0) : null;
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
