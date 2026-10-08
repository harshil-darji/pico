/**
 * Test database client — SQLite-based, file-backed.
 * Uses a locally-generated Prisma schema so no live database is needed.
 * Tables are created automatically via `migrate push`.
 */
import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PRISMA_DIR = join(__dirname, 'prisma');
const DB_FILE = join(PRISMA_DIR, 'test.db');
const SCHEMA_PATH = join(PRISMA_DIR, 'schema.prisma');

// Only the tables needed for Phase 1 routes.
const SCHEMA = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./test.db"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  bots      Bot[]
}

model Bot {
  id      String   @id @default(cuid())
  userId  String
  name    String
  role    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  conversations Conversation[]
}

model Conversation {
  id       String   @id @default(cuid())
  botId    String
  title    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  bot      Bot      @relation(fields: [botId], references: [id], onDelete: Cascade)
  messages Message[]
}

model Message {
  id             String    @id @default(cuid())
  conversationId String
  role           MessageRole
  content        String
  createdAt      DateTime  @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}

enum MessageRole {
  user
  assistant
  system
  tool
}
`;

// Idempotent: generate only once per process.
let generated = false;

function setup() {
  if (generated) return;
  generated = true;

  // Clean previous test db
  try { rmSync(DB_FILE, { force: true }); } catch { /* ignore */ }

  mkdirSync(PRISMA_DIR, { recursive: true });
  writeFileSync(SCHEMA_PATH, SCHEMA);

  const rootDir = join(__dirname, '../..');

  // Generate Prisma client
  execSync(`pnpm --filter @bots/api prisma generate --schema=${SCHEMA_PATH}`, {
    cwd: rootDir,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  // Push schema to SQLite (creates tables)
  execSync(`pnpm --filter @bots/api prisma db push --schema=${SCHEMA_PATH}`, {
    cwd: rootDir,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

setup();

// Re-export the generated PrismaClient.
export { PrismaClient } from '@prisma/client';
