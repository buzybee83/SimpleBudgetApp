
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const DB_NAME = 'budget.db';

function getDb() {
	return SQLite.openDatabase({ name: DB_NAME, location: 'default' });
}

export async function initDatabase() {
	const db = await getDb();

	await db.executeSql(
		`CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY,
			email TEXT UNIQUE NOT NULL,
			password_hash TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   		);`
	);

	await db.executeSql(
		`CREATE TABLE IF NOT EXISTS settings (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id TEXT UNIQUE NOT NULL,
			projected_savings REAL,
			show_preview BOOLEAN DEFAULT 1,
			intro_status TEXT,
			first_pay_date TEXT,
			income_type TEXT CHECK(income_type IN ('Weekly', 'Bi-Weekly', 'Semi-Monthly', 'Monthly')) DEFAULT 'Bi-Weekly',
			income_amount REAL,
			threshold_enabled BOOLEAN DEFAULT 0,
			threshold_amount REAL,
			savings_enabled BOOLEAN DEFAULT 0,
			savings_override BOOLEAN DEFAULT 0,
			savings_amount REAL,
			savings_amount_type TEXT CHECK(savings_amount_type IN ('%', '$')) DEFAULT '%',
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP
 		);`
	);

	await db.executeSql(
		`CREATE TABLE IF NOT EXISTS monthly_details (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			budget_id INTEGER NOT NULL,
			month TEXT NOT NULL,
			total_income REAL DEFAULT 0,
			total_expenses REAL DEFAULT 0,
			expenses_paid REAL DEFAULT 0,
			total_savings REAL DEFAULT 0,
			balance REAL DEFAULT 0,
			is_active BOOLEAN DEFAULT 1,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (budget_id) REFERENCES settings(id)
    	);`
	);

	await db.executeSql(
		`CREATE TABLE IF NOT EXISTS monthly_savings (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			month_id INTEGER NOT NULL,
			income_id INTEGER NOT NULL,
			amount REAL NOT NULL,
			FOREIGN KEY (month_id) REFERENCES monthly_details(id),
			FOREIGN KEY (income_id) REFERENCES incomes(id)
    	);`
	);

	await db.executeSql(
		`CREATE TABLE IF NOT EXISTS incomes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			budget_id INTEGER NOT NULL,
			description TEXT NOT NULL,
			expected_date TEXT NOT NULL,
			is_automated BOOLEAN DEFAULT 1,
			frequency_type TEXT DEFAULT 'Paycheck',
			frequency TEXT DEFAULT 'Bi-Weekly',
			amount REAL NOT NULL,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    	);`
	);

	await db.executeSql(
		`CREATE TABLE IF NOT EXISTS income_events (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			income_id INTEGER NOT NULL,
			budget_id INTEGER NOT NULL,
			description TEXT NOT NULL,
			expected_date TEXT NOT NULL,
			amount REAL NOT NULL,
			override BOOLEAN DEFAULT 0,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (income_id) REFERENCES incomes(id),
			FOREIGN KEY (budget_id) REFERENCES settings(id)
    	);`
	);

	await db.executeSql(
		`CREATE TABLE IF NOT EXISTS expenses (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			budget_id INTEGER NOT NULL,
			income_id INTEGER,
			name TEXT NOT NULL,
			due_day TEXT NOT NULL,
			amount REAL NOT NULL,
			split_amount REAL,
			is_paid BOOLEAN DEFAULT 0,
			is_recurring BOOLEAN DEFAULT 1,
			recurring_type TEXT CHECK(recurring_type IN ('Weekly', 'Bi-Weekly', 'Semi-Monthly', 'Monthly', 'Bi-Monthly')) DEFAULT 'Monthly',
			split BOOLEAN DEFAULT 0,
			fixed_amount BOOLEAN DEFAULT 0,
			sequence_tag TEXT,
			status TEXT CHECK(status IN ('A', 'D')) DEFAULT 'A',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    	);`
	);

	await db.executeSql(
		`CREATE TABLE IF NOT EXISTS expense_events (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			expense_id INTEGER NOT NULL,
			budget_id INTEGER NOT NULL,
			name TEXT NOT NULL,
			due_day TEXT NOT NULL,
			amount REAL NOT NULL,
			is_paid BOOLEAN DEFAULT 0,
			override BOOLEAN DEFAULT 0,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (expense_id) REFERENCES expenses(id),
			FOREIGN KEY (budget_id) REFERENCES settings(id)
    	);`
	);

	await db.executeSql(
		`CREATE TABLE IF NOT EXISTS envelopes (
			id UUID PRIMARY KEY,
			user_id UUID,
			name TEXT NOT NULL,
			budgeted_amount NUMERIC NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    	);`
	);

	await db.executeSql(
		`CREATE TABLE IF NOT EXISTS envelope_allocations (
			id UUID PRIMARY KEY,
			user_id UUID,
			income_id UUID,
			envelope_id UUID,
			amount NUMERIC,
			created_at TIMESTAMP
		);`
	);

	await db.executeSql(
		`CREATE TABLE IF NOT EXISTS debts (
			id UUID PRIMARY KEY,
			user_id UUID,
			name TEXT,
			total_amount NUMERIC,
			interest_rate NUMERIC,
			min_payment NUMERIC,
			strategy TEXT CHECK(strategy IN ('snowball', 'avalanche')),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`
	);

	await db.executeSql(
		`CREATE TABLE IF NOT EXISTS savings_goals (
			id UUID PRIMARY KEY,
			user_id UUID,
			name TEXT,
			target_amount NUMERIC,
			current_amount NUMERIC DEFAULT 0,
			due_date DATE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`
	);

	await db.executeSql(
		`CREATE TABLE IF NOT EXISTS notifications (
			id UUID PRIMARY KEY,
			user_id UUID,
			type TEXT,
			reference_id UUID,
			scheduled_for TIMESTAMP,
			triggered BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`
	);
}