#!/usr/bin/env node

/**
 * @file volqan.ts
 * @description `volqan` — CLI for working with an existing Volqan project.
 *
 * Usage:
 *   volqan create extension <name>
 *   volqan create theme <name>
 *
 * This is the `volqan` bin entry (package.json), separate from `create-volqan-app`
 * (index.ts), which scaffolds a brand new project. Commands here operate inside an
 * existing project, starting with extension and theme scaffolding.
 */

import { logger } from './utils/logger.js';
import { createExtension, createTheme } from './commands/create.js';

// ---------------------------------------------------------------------------
// Help
// ---------------------------------------------------------------------------

function printHelp(): void {
  console.log('Usage: volqan <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  create extension <name>   Scaffold a new Volqan extension');
  console.log('  create theme <name>       Scaffold a new Volqan theme');
  console.log('');
  console.log('Run "volqan --help" to see this message again.');
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const [command, subcommand, name] = args;

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    process.exit(command ? 0 : 1);
  }

  if (command === 'create') {
    if (!subcommand || !name) {
      logger.error('Usage: volqan create <extension|theme> <name>');
      process.exit(1);
    }

    if (subcommand === 'extension') {
      await createExtension(name);
      return;
    }

    if (subcommand === 'theme') {
      await createTheme(name);
      return;
    }

    logger.error(`Unknown create target "${subcommand}". Expected "extension" or "theme".`);
    process.exit(1);
  }

  logger.error(`Unknown command "${command}".`);
  printHelp();
  process.exit(1);
}

main();