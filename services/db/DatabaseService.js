import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const DB_NAME = 'budget.db';

function getDb() {
	return SQLite.openDatabase({ name: DB_NAME, location: 'default' });
}

export async function initDatabase() {
	const db = await getDb();
	
	//  USERS (Cloud Only)
	await db.executeSql(
		`CREATE TABLE users (
			id UUID PRIMARY KEY,
			email TEXT UNIQUE NOT NULL,
			password_hash TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`
	);
	await db.executeSql(
		`CREATE TABLE income_events (
			id UUID PRIMARY KEY,
			user_id UUID,
			name TEXT,
			amount NUMERIC NOT NULL,
			date DATE NOT NULL,
			recurring BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`
	);
	await db.executeSql(
		`CREATE TABLE expenses (
			id UUID PRIMARY KEY,
			user_id UUID,
			name TEXT,
			amount NUMERIC NOT NULL,
			due_date DATE,
			recurring BOOLEAN DEFAULT FALSE,
			category TEXT,
			envelope_id UUID,
			linked_income_id UUID,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`
	);
	await db.executeSql(
		`CREATE TABLE envelopes (
			id UUID PRIMARY KEY,
			user_id UUID,
			name TEXT NOT NULL,
			budgeted_amount NUMERIC NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`
	);
	await db.executeSql(
		`CREATE TABLE envelope_allocations (
			id UUID PRIMARY KEY
			user_id UUID
			income_id UUID
			envelope_id UUID
			amount NUMERIC
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

export async function executeSql(sql, params = []) {
	const db = await getDb();
	const [result] = await db.executeSql(sql, params);
	return result;
}

export async function getAll(table) {
	const result = await executeSql(`SELECT * FROM ${table}`);
	const items = [];
	for (let i = 0; i < result.rows.length; i++) {
		items.push(result.rows.item(i));
	}
	return items;
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