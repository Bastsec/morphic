import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as relations from './relations'
import * as schema from './schema'

// For server-side usage only
// Use restricted user for application if available, otherwise fall back to regular user
const isDevelopment = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'

// Helper type for all tables
export type Schema = typeof schema

// Lazily initialize the database client to avoid build-time crashes
let _db: any | null = null

function resolveConnectionString(): string | undefined {
  const conn =
    process.env.DATABASE_RESTRICTED_URL ?? // Prefer restricted user
    process.env.DATABASE_URL ??
    (isTest ? 'postgres://user:pass@localhost:5432/testdb' : undefined)

  return conn
}

function initDb() {
  const connectionString = resolveConnectionString()
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL or DATABASE_RESTRICTED_URL environment variable is not set'
    )
  }

  if (isDevelopment) {
    console.log(
      '[DB] Using connection:',
      process.env.DATABASE_RESTRICTED_URL
        ? 'Restricted User (RLS Active)'
        : 'Owner User (RLS Bypassed)'
    )
  }

  const client = postgres(connectionString, {
    ssl: { rejectUnauthorized: false },
    prepare: false,
    max: 20 // Max 20 connections
  })

  _db = drizzle(client, {
    schema: { ...schema, ...relations }
  })

  // Verify restricted user permissions on startup (development only)
  if (process.env.DATABASE_RESTRICTED_URL && !isTest) {
    if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
      ;(async () => {
        try {
          const result = await _db!.execute<{ current_user: string }>(
            sql`SELECT current_user`
          )
          const currentUser = result[0]?.current_user

          if (isDevelopment) {
            console.log('[DB] ✓ Connection verified as user:', currentUser)
          }

          // Verify it's the restricted user (app_user)
          if (
            currentUser &&
            !currentUser.includes('app_user') &&
            !currentUser.includes('neondb_owner')
          ) {
            console.warn(
              '[DB] ⚠️ Warning: Expected app_user but connected as:',
              currentUser
            )
          }
        } catch (error) {
          console.error('[DB] ✗ Failed to verify database connection:', error)
        }
      })()
    }
  }
}

export function getDb() {
  if (_db) return _db
  initDb()
  return _db!
}

// Export a lazy proxy so existing imports `db` continue to work
export const db: any = new Proxy({}, {
  get(_target, prop) {
    const instance = getDb() as any
    const value = instance[prop]
    return typeof value === 'function' ? value.bind(instance) : value
  }
})
