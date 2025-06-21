import SQLite, { SQLiteDatabase, ResultSet } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const DB_NAME = 'budget.db';

async function getDb(): Promise<SQLiteDatabase> {
  return SQLite.openDatabase({ name: DB_NAME, location: 'default' });
}

export async function initDatabase() {
  const db = await getDb();
  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL,
      description TEXT,
      date TEXT
    );`
  );
  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL,
      description TEXT,
      date TEXT
    );`
  );
  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS envelopes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      budget REAL
    );`
  );
  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL,
      description TEXT,
      date TEXT
    );`
  );
}

export async function executeSql(sql: string, params: any[] = []): Promise<ResultSet> {
  const db = await getDb();
  const [result] = await db.executeSql(sql, params);
  return result;
}

export async function getAll<T = any>(table: string): Promise<T[]> {
  const result = await executeSql(`SELECT * FROM ${table}`);
  const items: T[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    items.push(result.rows.item(i));
  }
  return items;
}

export async function insert(table: string, fields: Record<string, any>) {
  const keys = Object.keys(fields);
  const placeholders = keys.map(() => '?').join(', ');
  const values = Object.values(fields);
  await executeSql(
    `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
    values
  );
}

export async function update(table: string, fields: Record<string, any>, id: number) {
  const set = Object.keys(fields)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = [...Object.values(fields), id];
  await executeSql(`UPDATE ${table} SET ${set} WHERE id = ?`, values);
}

export async function remove(table: string, id: number) {
  await executeSql(`DELETE FROM ${table} WHERE id = ?`, [id]);
}
