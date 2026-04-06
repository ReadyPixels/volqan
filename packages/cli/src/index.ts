#!/usr/bin/env node

/**
 * @file index.ts
 * @description create-volqan-app — Interactive scaffolding tool for Volqan projects.
 *
 * Usage:
 *   npx create-volqan-app
 *   pnpm create volqan-app
 *
 * What it does:
 * 1. Shows the Volqan banner
 * 2. Prompts for project name
 * 3. Prompts for database (PostgreSQL / MySQL / SQLite)
 * 4. Prompts for auth providers (Google, GitHub, or none)
 * 5. Creates the project directory
 * 6. Writes all template files (.env, package.json, tsconfig, volqan.config.ts)
 * 7. Runs pnpm install
 * 8. Runs prisma generate + prisma migrate dev
 * 9. Prints success with next steps
 */

import { execSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

import { logger } from './utils/logger.js';
import {
  promptText,
  promptSelect,
  promptMultiSelect,
  promptConfirm,
  closePrompts,
} from './utils/prompts.js';
import {
  copyTemplate,
  writeFileWithDirs,
  randomHex,
  isEmptyOrAbsent,
} from './utils/files.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DBProvider = 'postgresql' | 'mysql' | 'sqlite';
type AuthProvider = 'google' | 'github';

interface ScaffoldOptions {
  projectName: string;
  dbProvider: DBProvider;
  authProviders: AuthProvider[];
  installDeps: boolean;
  runMigrations: boolean;
  targetDir: string;
}

// ---------------------------------------------------------------------------
// Database URL templates
// ---------------------------------------------------------------------------

const DB_URLS: Record<DBProvider, string> = {
  postgresql: 'postgresql://postgres:postgres@localhost:5432/{{PROJECT_NAME_SNAKE}}',
  mysql: 'mysql://root:password@localhost:3306/{{PROJECT_NAME_SNAKE}}',
  sqlite: 'file:./dev.db',
};

const DB_LABELS: Record<DBProvider, string> = {
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  sqlite: 'SQLite',
};

// ---------------------------------------------------------------------------
// Main scaffolding function
// ---------------------------------------------------------------------------

async function scaffold(opts: ScaffoldOptions): Promise<void> {
  const {
    projectName,
    dbProvider,
    authProviders,
    installDeps,
    runMigrations,
    targetDir,
  } = opts;

  const projectNameSnake = projectName.replace(/[-\s]/g, '_').toLowerCase();
  const jwtSecret = randomHex(32);
  const databaseUrl = DB_URLS[dbProvider].replace('{{PROJECT_NAME_SNAKE}}', projectNameSnake);

  const templateVars = {
    PROJECT_NAME: projectName,
    PROJECT_NAME_SNAKE: projectNameSnake,
    DB_PROVIDER: dbProvider,
    DATABASE_URL: databaseUrl,
    JWT_SECRET: jwtSecret,
    AUTH_GOOGLE: authProviders.includes('google') ? 'true' : '',
    AUTH_GITHUB: authProviders.includes('github') ? 'true' : '',
  };

  // -------------------------------------------------------------------------
  // Step 1: Create directory
  // -------------------------------------------------------------------------

  logger.step(1, `Creating project directory: ${projectName}/`);

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // -------------------------------------------------------------------------
  // Step 2: Write template files
  // -------------------------------------------------------------------------

  logger.step(2, 'Writing project files...');

  await copyTemplate('package.json.template', join(targetDir, 'package.json'), templateVars);
  await copyTemplate('tsconfig.json.template', join(targetDir, 'tsconfig.json'), templateVars);
  await copyTemplate('env.template', join(targetDir, '.env'), templateVars);

  // Write volqan.config.ts (template uses simple {{VAR}} syntax with inline conditionals)
  const configContent = buildVolqanConfig(templateVars);
  await writeFileWithDirs(join(targetDir, 'volqan.config.ts'), configContent);

  // Create minimal src/index.ts entry point
  await writeFileWithDirs(
    join(targetDir, 'src/index.ts'),
    buildServerEntry(projectName),
  );

  // Create prisma/schema.prisma
  await writeFileWithDirs(
    join(targetDir, 'prisma/schema.prisma'),
    buildPrismaSchema(dbProvider, databaseUrl),
  );

  // Create empty extensions and themes directories with .gitkeep
  await writeFileWithDirs(join(targetDir, 'extensions/.gitkeep'), '');
  await writeFileWithDirs(join(targetDir, 'themes/.gitkeep'), '');
  await writeFileWithDirs(join(targetDir, 'public/uploads/.gitkeep'), '');

  // .gitignore
  await writeFileWithDirs(
    join(targetDir, '.gitignore'),
    GITIGNORE_CONTENT,
  );

  // README.md
  await writeFileWithDirs(
    join(targetDir, 'README.md'),
    buildReadme(projectName, dbProvider, authProviders),
  );

  logger.success('Project files created.');

  // -------------------------------------------------------------------------
  // Step 3: Install dependencies
  // -------------------------------------------------------------------------

  if (installDeps) {
    logger.step(3, 'Installing dependencies with pnpm...');
    try {
      execSync('pnpm install', { cwd: targetDir, stdio: 'inherit' });
      logger.success('Dependencies installed.');
    } catch {
      logger.error('pnpm install failed. Run it manually in the project directory.');
    }
  }

  // -------------------------------------------------------------------------
  // Step 4: Prisma setup
  // -------------------------------------------------------------------------

  if (installDeps && runMigrations) {
    logger.step(4, 'Running Prisma setup...');
    try {
      execSync('pnpm prisma generate', { cwd: targetDir, stdio: 'inherit' });
      logger.success('Prisma client generated.');

      if (dbProvider === 'sqlite') {
        execSync('pnpm prisma migrate dev --name init', { cwd: targetDir, stdio: 'inherit' });
        logger.success('Database migrated.');
      } else {
        logger.warn(
          `Skipping auto-migration for ${DB_LABELS[dbProvider]}. ` +
            `Run "pnpm prisma migrate dev" after configuring your database.`,
        );
      }
    } catch {
      logger.warn('Prisma setup failed. Configure your database URL and run manually.');
    }
  }
}

// ---------------------------------------------------------------------------
// Content generators
// ---------------------------------------------------------------------------

function buildVolqanConfig(vars: Record<string, string>): string {
  const authProviders: string[] = [];
  if (vars.AUTH_GOOGLE) {
    authProviders.push(`    {
      id: 'google' as const,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },`);
  }
  if (vars.AUTH_GITHUB) {
    authProviders.push(`    {
      id: 'github' as const,
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },`);
  }

  return `import { defineConfig } from '@volqan/core';

export default defineConfig({
  database: {
    provider: '${vars.DB_PROVIDER}',
    url: process.env.DATABASE_URL!,
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: '7d',
    },
    providers: [
${authProviders.join('\n')}
    ],
  },
  admin: {
    path: '/admin',
    title: '${vars.PROJECT_NAME} Admin',
  },
  extensionsDir: './extensions',
  themesDir: './themes',
  storage: {
    provider: 'local',
    local: { uploadDir: './public/uploads' },
  },
});
`;
}

function buildServerEntry(projectName: string): string {
  return `/**
 * ${projectName} — Volqan application entry point
 */

import { createVolqanServer } from '@volqan/core';
import config from '../volqan.config.js';

const server = await createVolqanServer(config);
const port = parseInt(process.env.PORT ?? '3000', 10);

server.listen(port, () => {
  console.log(\`[${projectName}] Server running at http://localhost:\${port}\`);
  console.log(\`[${projectName}] Admin panel at http://localhost:\${parseInt(process.env.ADMIN_PORT ?? '3001', 10)}\`);
});
`;
}

function buildPrismaSchema(provider: DBProvider, url: string): string {
  const prismaProvider = provider === 'postgresql' ? 'postgresql' : provider === 'mysql' ? 'mysql' : 'sqlite';
  return `// This is your Prisma schema file.
// Learn more at https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${prismaProvider}"
  url      = env("DATABASE_URL")
}

// Volqan core models are auto-generated by @volqan/core/prisma
// Add your custom models below:

`;
}

function buildReadme(
  projectName: string,
  db: DBProvider,
  authProviders: AuthProvider[],
): string {
  return `# ${projectName}

Built with [Volqan](https://volqan.link) — the Open Core Headless CMS.

## Stack

- **Database**: ${DB_LABELS[db]}
- **Auth**: ${authProviders.length > 0 ? authProviders.join(', ') : 'Email/password only'}
- **CMS**: Volqan + Admin UI

## Getting Started

\`\`\`bash
cp .env.example .env   # configure your environment
pnpm install
pnpm db:migrate        # run database migrations
pnpm dev               # start development servers
\`\`\`

## Admin Panel

Visit [http://localhost:3001](http://localhost:3001) to access the Volqan admin panel.

## Marketplace

Browse extensions and themes at [https://bazarix.link](https://bazarix.link).

## Documentation

Full documentation at [https://volqan.link/docs](https://volqan.link/docs).
`;
}

const GITIGNORE_CONTENT = `# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# Prisma
prisma/*.db
prisma/*.db-journal

# Uploads
public/uploads/

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp
`;

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  logger.banner();

  console.log('  Welcome to create-volqan-app!\n');
  console.log('  This tool will scaffold a new Volqan project.\n');

  try {
    // Collect options
    const projectName = await promptText('Project name', 'my-volqan-app');

    const targetDir = resolve(process.cwd(), projectName);

    if (!await isEmptyOrAbsent(targetDir)) {
      logger.warn(`Directory "${projectName}" already exists and is not empty.`);
      const proceed = await promptConfirm('Continue anyway?', false);
      if (!proceed) {
        logger.info('Aborted.');
        closePrompts();
        process.exit(0);
      }
    }

    const dbProvider = await promptSelect<DBProvider>(
      'Database',
      [
        { label: 'PostgreSQL', value: 'postgresql', description: 'Recommended for production' },
        { label: 'MySQL / MariaDB', value: 'mysql', description: 'Popular alternative' },
        { label: 'SQLite', value: 'sqlite', description: 'Simple, no server needed — great for development' },
      ],
      0,
    );

    const authProviders = await promptMultiSelect<AuthProvider>(
      'Auth providers (optional)',
      [
        { label: 'Google OAuth', value: 'google' },
        { label: 'GitHub OAuth', value: 'github' },
      ],
    );

    const installDeps = await promptConfirm('Install dependencies now?', true);
    const runMigrations = installDeps
      ? await promptConfirm('Run database migrations?', dbProvider === 'sqlite')
      : false;

    closePrompts();

    logger.blank();
    logger.header('Summary');
    logger.kv('Project', projectName);
    logger.kv('Database', DB_LABELS[dbProvider]);
    logger.kv('Auth', authProviders.length > 0 ? authProviders.join(', ') : 'None');
    logger.kv('Install deps', installDeps ? 'Yes' : 'No');
    logger.kv('Run migrations', runMigrations ? 'Yes' : 'No');
    logger.blank();

    await scaffold({
      projectName,
      dbProvider,
      authProviders,
      installDeps,
      runMigrations,
      targetDir,
    });

    logger.nextSteps(projectName);
  } catch (err) {
    closePrompts();
    logger.error(`An unexpected error occurred: ${String(err)}`);
    process.exit(1);
  }
}

main();
