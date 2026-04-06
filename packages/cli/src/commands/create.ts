/**
 * @file commands/create.ts
 * @description `volqan create extension <name>` and `volqan create theme <name>` commands.
 *
 * Scaffolds new extension or theme projects with proper boilerplate,
 * ready to develop against @volqan/extension-sdk or @volqan/theme-sdk.
 */

import { mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

import { logger } from '../utils/logger.js';
import { writeFileWithDirs } from '../utils/files.js';

// ---------------------------------------------------------------------------
// Extension scaffolding
// ---------------------------------------------------------------------------

/**
 * Scaffold a new Volqan extension project.
 *
 * @param name - The extension name (e.g. "my-extension"). Used as directory name and package name.
 */
export async function createExtension(name: string): Promise<void> {
  const targetDir = resolve(process.cwd(), name);

  if (existsSync(targetDir)) {
    logger.error(`Directory "${name}" already exists.`);
    process.exit(1);
  }

  logger.header(`Creating extension: ${name}`);
  logger.blank();

  mkdirSync(targetDir, { recursive: true });

  const safeName = name.replace(/[^a-z0-9-]/g, '-').toLowerCase();
  const vendorSlug = 'my-org';

  // package.json
  await writeFileWithDirs(
    join(targetDir, 'package.json'),
    JSON.stringify(
      {
        name: safeName,
        version: '0.1.0',
        private: true,
        type: 'module',
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        files: ['dist'],
        scripts: {
          dev: 'tsc -w -p tsconfig.json',
          build: 'tsc -p tsconfig.json',
          typecheck: 'tsc --noEmit -p tsconfig.json',
          test: 'node --test',
          clean: 'rm -rf dist',
        },
        peerDependencies: {
          '@volqan/core': '>=0.1.0',
        },
        devDependencies: {
          '@volqan/core': '^0.1.0',
          '@volqan/extension-sdk': '^0.1.0',
          typescript: '^5.9.0',
          '@types/node': '^22.0.0',
        },
        engines: {
          node: '>=22',
        },
      },
      null,
      2,
    ) + '\n',
  );

  // tsconfig.json
  await writeFileWithDirs(
    join(targetDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
          isolatedModules: true,
          verbatimModuleSyntax: true,
          declaration: true,
          declarationMap: true,
          sourceMap: true,
          outDir: 'dist',
          rootDir: 'src',
        },
        include: ['src/**/*.ts'],
        exclude: ['node_modules', 'dist'],
      },
      null,
      2,
    ) + '\n',
  );

  // src/index.ts
  await writeFileWithDirs(
    join(targetDir, 'src/index.ts'),
    `import { defineExtension } from '@volqan/extension-sdk';
import type { ExtensionContext } from '@volqan/extension-sdk';

export default defineExtension({
  id: '${vendorSlug}/${safeName}',
  version: '0.1.0',
  name: '${titleCase(safeName)}',
  description: 'A Volqan extension',
  author: { name: 'Your Name' },

  async onInstall(ctx: ExtensionContext) {
    ctx.logger.info('${titleCase(safeName)} installed');
  },

  async onActivate(ctx: ExtensionContext) {
    ctx.logger.info('${titleCase(safeName)} activated');
  },

  async onDeactivate(ctx: ExtensionContext) {
    ctx.logger.info('${titleCase(safeName)} deactivated');
  },

  async onBoot(ctx: ExtensionContext) {
    ctx.logger.info('${titleCase(safeName)} booted');
  },
});
`,
  );

  // src/index.test.ts
  await writeFileWithDirs(
    join(targetDir, 'src/index.test.ts'),
    `import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createTestContext } from '@volqan/extension-sdk';
import extension from './index.js';

describe('${safeName}', () => {
  it('should have correct metadata', () => {
    assert.equal(extension.id, '${vendorSlug}/${safeName}');
    assert.equal(extension.version, '0.1.0');
    assert.ok(extension.name);
    assert.ok(extension.description);
  });

  it('should run onInstall without errors', async () => {
    const ctx = createTestContext();
    await extension.onInstall?.(ctx);
    assert.ok(ctx._logs.length > 0, 'Expected at least one log message');
  });
});
`,
  );

  // README.md
  await writeFileWithDirs(
    join(targetDir, 'README.md'),
    `# ${titleCase(safeName)}

A [Volqan](https://volqan.link) extension.

## Development

\`\`\`bash
pnpm install
pnpm dev          # Watch mode
pnpm build        # Production build
pnpm typecheck    # Type check
pnpm test         # Run tests
\`\`\`

## Usage

\`\`\`ts
import extension from '${safeName}';

// Register with Volqan
await extensionManager.install(extension);
await extensionManager.enable(extension.id);
\`\`\`

## Publishing

To publish to the [Bazarix marketplace](https://bazarix.link):

1. Build the extension: \`pnpm build\`
2. Submit at [bazarix.link/developer/submit](https://bazarix.link/developer/submit)

## License

MIT
`,
  );

  // .gitignore
  await writeFileWithDirs(
    join(targetDir, '.gitignore'),
    `node_modules/
dist/
*.log
.DS_Store
`,
  );

  logger.success(`Extension scaffolded at ./${name}/`);
  logger.blank();
  logger.info('Next steps:');
  console.log(`    cd ${name}`);
  console.log('    pnpm install');
  console.log('    pnpm dev');
  logger.blank();
}

// ---------------------------------------------------------------------------
// Theme scaffolding
// ---------------------------------------------------------------------------

/**
 * Scaffold a new Volqan theme project.
 *
 * @param name - The theme name (e.g. "my-theme"). Used as directory name and package name.
 */
export async function createTheme(name: string): Promise<void> {
  const targetDir = resolve(process.cwd(), name);

  if (existsSync(targetDir)) {
    logger.error(`Directory "${name}" already exists.`);
    process.exit(1);
  }

  logger.header(`Creating theme: ${name}`);
  logger.blank();

  mkdirSync(targetDir, { recursive: true });

  const safeName = name.replace(/[^a-z0-9-]/g, '-').toLowerCase();
  const vendorSlug = 'my-org';

  // package.json
  await writeFileWithDirs(
    join(targetDir, 'package.json'),
    JSON.stringify(
      {
        name: safeName,
        version: '0.1.0',
        private: true,
        type: 'module',
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        files: ['dist'],
        scripts: {
          dev: 'tsc -w -p tsconfig.json',
          build: 'tsc -p tsconfig.json',
          typecheck: 'tsc --noEmit -p tsconfig.json',
          clean: 'rm -rf dist',
        },
        peerDependencies: {
          '@volqan/core': '>=0.1.0',
        },
        devDependencies: {
          '@volqan/core': '^0.1.0',
          '@volqan/theme-sdk': '^0.1.0',
          typescript: '^5.9.0',
          '@types/node': '^22.0.0',
        },
        engines: {
          node: '>=22',
        },
      },
      null,
      2,
    ) + '\n',
  );

  // tsconfig.json
  await writeFileWithDirs(
    join(targetDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
          isolatedModules: true,
          verbatimModuleSyntax: true,
          declaration: true,
          declarationMap: true,
          sourceMap: true,
          outDir: 'dist',
          rootDir: 'src',
        },
        include: ['src/**/*.ts'],
        exclude: ['node_modules', 'dist'],
      },
      null,
      2,
    ) + '\n',
  );

  // src/index.ts
  await writeFileWithDirs(
    join(targetDir, 'src/index.ts'),
    `import { defineTheme } from '@volqan/theme-sdk';

export default defineTheme({
  id: '${vendorSlug}/${safeName}',
  name: '${titleCase(safeName)}',
  version: '0.1.0',
  tokens: {
    colors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#EC4899',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: {
        primary: '#111827',
        secondary: '#4B5563',
        muted: '#9CA3AF',
      },
      border: '#E5E7EB',
    },
    typography: {
      fontFamily: {
        sans: '"Inter", "system-ui", sans-serif',
        mono: '"JetBrains Mono", "Fira Code", monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
    },
    spacing: {
      0: '0px',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      6: '1.5rem',
      8: '2rem',
      12: '3rem',
      16: '4rem',
    },
    radius: {
      none: '0px',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px',
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },
    animation: {
      duration: '150ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  components: {
    // Add component overrides here, e.g.:
    // Button: { className: 'rounded-full' },
    // Card: { cssVars: { '--card-radius': '1rem' } },
  },
});
`,
  );

  // README.md
  await writeFileWithDirs(
    join(targetDir, 'README.md'),
    `# ${titleCase(safeName)}

A [Volqan](https://volqan.link) theme.

## Development

\`\`\`bash
pnpm install
pnpm dev          # Watch mode
pnpm build        # Production build
pnpm typecheck    # Type check
\`\`\`

## Preview

\`\`\`ts
import { createPreviewContext } from '@volqan/theme-sdk';
import theme from '${safeName}';

const preview = createPreviewContext(theme);
console.log(preview.css); // CSS custom properties
\`\`\`

## Usage

\`\`\`ts
import { loadAndApplyTheme } from '@volqan/core';
import theme from '${safeName}';

loadAndApplyTheme(theme);
\`\`\`

## Publishing

To publish to the [Bazarix marketplace](https://bazarix.link):

1. Build the theme: \`pnpm build\`
2. Submit at [bazarix.link/developer/submit](https://bazarix.link/developer/submit)

## License

MIT
`,
  );

  // .gitignore
  await writeFileWithDirs(
    join(targetDir, '.gitignore'),
    `node_modules/
dist/
*.log
.DS_Store
`,
  );

  logger.success(`Theme scaffolded at ./${name}/`);
  logger.blank();
  logger.info('Next steps:');
  console.log(`    cd ${name}`);
  console.log('    pnpm install');
  console.log('    pnpm dev');
  logger.blank();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function titleCase(kebab: string): string {
  return kebab
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
