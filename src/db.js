import { createPool } from "mariadb";
export * from "mariadb";

export const db = createPool({
  host: "mariadb",
  user: "root",
  password: "foo",
});

/**
 * @param {import("mariadb").Pool} db
 */
export async function initialiseDatabase(db) {
  const CREATE_TODO_DATABASE = "CREATE DATABASE IF NOT EXISTS todo";
  const CREATE_TODOS_TABLE =
    "CREATE TABLE IF NOT EXISTS todo.todos (id int NOT NULL AUTO_INCREMENT, description TEXT NOT NULL, PRIMARY KEY (id));";

  const connection = await db.getConnection();
  await connection.beginTransaction();
  await connection.query(CREATE_TODO_DATABASE);
  await connection.query(CREATE_TODOS_TABLE);
  await connection.commit();
}
