import { createConnection } from "mysql";
export * from "mysql";

export const db = createConnection({
  host: "mysql",
  user: "root",
  password: "foo",
});

/**
 * @param {import("mysql").Connection} db
 * @param {string | import("mysql").Query} query
 * @returns {Promise<any>}
 */
export function asyncQuery(db, query) {
  return new Promise((resolve, reject) => {
    db.query(query, function (error, results) {
      if (error != null) {
        return reject(error);
      }

      return resolve(results);
    });
  });
}

/**
 * @param {import("mysql").Connection} db
 */
export async function initialiseDatabase(db) {
  const CREATE_TODO_DATABASE = "CREATE DATABASE IF NOT EXISTS todo";
  const CREATE_TODOS_TABLE =
    "CREATE TABLE IF NOT EXISTS todo.todos (id int NOT NULL AUTO_INCREMENT, description TEXT NOT NULL, PRIMARY KEY (id));";

  return new Promise((resolve, reject) => {
    db.beginTransaction(async function (transactionError) {
      if (transactionError != null) {
        return reject(transactionError);
      }

      await asyncQuery(db, CREATE_TODO_DATABASE);
      await asyncQuery(db, CREATE_TODOS_TABLE);

      db.commit(function (commitError) {
        if (commitError != null) {
          return reject(commitError);
        }
        return resolve();
      });
    });
  });
}
