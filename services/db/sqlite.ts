import SQLite, { SQLResultSet, SQLTransaction } from 'react-native-sqlite-storage';

const DB_NAME = 'BudgetApp.db';

export function getDB() {
  return SQLite.openDatabase(DB_NAME);
}

export function execSql<T = any>(
  tx: SQLTransaction,
  sql: string,
  params: any[] = []
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    tx.executeSql(
      sql,
      params,
      (_tx, result: SQLResultSet) => {
        const rows: any[] = [];
        for (let i = 0; i < result.rows.length; i++) {
          rows.push(result.rows.item(i));
        }
        resolve(rows as T[]);
      },
      (_tx, err) => {
        reject(err);
        return false;
      }
    );
  });
}
