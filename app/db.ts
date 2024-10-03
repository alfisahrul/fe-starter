import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { genSaltSync, hashSync } from 'bcrypt-ts';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/

const host = process.env.POSTGRES_HOST;
const user = process.env.POSTGRES_USER;
const password = process.env.POSTGRES_PASSWORD;
const database = process.env.POSTGRES_DATABASE;
const port = parseInt(process.env.POSTGRES_PORT || '5432', 10); // Convert to number

// Check that all required variables are defined
if (!host || !user || !password || !database) {
  throw new Error("Missing one or more required environment variables.");
}

// Create the database client without a full URL
let client = postgres({
  host,
  port,
  username: user,
  password,
  database,
});

// Initialize drizzle ORM
let db = drizzle(client);

// Example function to test the connection
async function testConnection() {
  try {
    console.log("Connection successful, fetched result:");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

testConnection();

export async function getUser(email: string) {
  const users = await ensureTableExists();
  return await db.select().from(users).where(eq(users.email, email));
}

export async function createUser(email: string, password: string) {
  const users = await ensureTableExists();
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  return await db.insert(users).values({ email, password: hash });
}

async function ensureTableExists() {
  const result = await client`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'User'
    );`;

  if (!result[0].exists) {
    await client`
      CREATE TABLE "User" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(64),
        password VARCHAR(64)
      );`;
  }

  const table = pgTable('User', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 64 }),
    password: varchar('password', { length: 64 }),
  });

  return table;
}
