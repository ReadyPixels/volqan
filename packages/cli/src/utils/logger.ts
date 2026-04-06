/**
 * @file utils/logger.ts
 * @description Colored console output using ANSI escape codes (no external deps).
 */

// ---------------------------------------------------------------------------
// ANSI color codes
// ---------------------------------------------------------------------------

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

const FG = {
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
} as const;

const BG = {
  blue: '\x1b[44m',
  green: '\x1b[42m',
} as const;

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

function colorize(text: string, ...codes: string[]): string {
  // Skip colors in non-TTY environments
  if (!process.stdout.isTTY) return text;
  return `${codes.join('')}${text}${RESET}`;
}

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

export const logger = {
  /** Print a blank line. */
  blank(): void {
    console.log('');
  },

  /** Print an info message with a cyan bullet. */
  info(message: string): void {
    console.log(`  ${colorize('ℹ', FG.cyan)}  ${message}`);
  },

  /** Print a success message with a green check. */
  success(message: string): void {
    console.log(`  ${colorize('✔', FG.green)}  ${message}`);
  },

  /** Print a warning message with a yellow triangle. */
  warn(message: string): void {
    console.log(`  ${colorize('⚠', FG.yellow)}  ${message}`);
  },

  /** Print an error message with a red cross. */
  error(message: string): void {
    console.error(`  ${colorize('✖', FG.red)}  ${colorize(message, FG.red)}`);
  },

  /** Print a step indicator (numbered step). */
  step(n: number, message: string): void {
    const num = colorize(` ${n} `, BG.blue, FG.white, BOLD);
    console.log(`  ${num}  ${message}`);
  },

  /** Print a loading/spinner-like message with a cyan dash. */
  pending(message: string): void {
    console.log(`  ${colorize('⟳', FG.cyan)}  ${colorize(message, DIM)}`);
  },

  /** Print a section header. */
  header(title: string): void {
    console.log('');
    console.log(colorize(`  ${title}`, BOLD, FG.white));
    console.log(colorize(`  ${'─'.repeat(title.length)}`, FG.gray));
  },

  /** Print the Volqan banner. */
  banner(): void {
    const lines = [
      '',
      colorize('   ██╗   ██╗ ██████╗ ██╗      ██████╗  █████╗ ███╗   ██╗', FG.cyan, BOLD),
      colorize('   ██║   ██║██╔═══██╗██║     ██╔═══██╗██╔══██╗████╗  ██║', FG.cyan, BOLD),
      colorize('   ██║   ██║██║   ██║██║     ██║   ██║███████║██╔██╗ ██║', FG.blue, BOLD),
      colorize('   ╚██╗ ██╔╝██║   ██║██║     ██║▄▄ ██║██╔══██║██║╚██╗██║', FG.blue, BOLD),
      colorize('    ╚████╔╝ ╚██████╔╝███████╗╚██████╔╝██║  ██║██║ ╚████║', FG.magenta, BOLD),
      colorize('     ╚═══╝   ╚═════╝ ╚══════╝ ╚══▀▀═╝ ╚═╝  ╚═╝╚═╝  ╚═══╝', FG.magenta, BOLD),
      '',
      colorize('   The Open Core Headless CMS', FG.gray),
      colorize('   https://volqan.link  ·  https://bazarix.link', FG.gray),
      '',
    ];
    lines.forEach((l) => console.log(l));
  },

  /** Print a key-value pair (for showing config). */
  kv(key: string, value: string): void {
    console.log(`  ${colorize(key.padEnd(20), FG.gray)}  ${colorize(value, FG.white)}`);
  },

  /** Print the "next steps" box. */
  nextSteps(projectName: string): void {
    console.log('');
    console.log(colorize('  ┌─────────────────────────────────────────────────┐', FG.green));
    console.log(colorize('  │                                                 │', FG.green));
    console.log(colorize('  │   ', FG.green) + colorize('🚀 Your Volqan project is ready!', FG.white, BOLD) + colorize('         │', FG.green));
    console.log(colorize('  │                                                 │', FG.green));
    console.log(colorize('  └─────────────────────────────────────────────────┘', FG.green));
    console.log('');
    console.log('  ' + colorize('Next steps:', FG.white, BOLD));
    console.log('');
    console.log(`    ${colorize('cd', FG.cyan)} ${projectName}`);
    console.log(`    ${colorize('pnpm dev', FG.cyan)}`);
    console.log('');
    console.log('  ' + colorize('Admin panel:', FG.gray) + ' http://localhost:3001');
    console.log('  ' + colorize('API:        ', FG.gray) + ' http://localhost:3000/api');
    console.log('');
    console.log('  ' + colorize('Documentation:', FG.gray) + ' https://volqan.link/docs');
    console.log('  ' + colorize('Marketplace:  ', FG.gray) + ' https://bazarix.link');
    console.log('');
  },
};
