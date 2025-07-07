// Prettier Configuration for CIRO Network
// Ensures consistent code formatting across all supported file types
// https://prettier.io/docs/en/configuration.html

/** @type {import("prettier").Config} */
export default {
  // Basic formatting
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',

  // JavaScript/TypeScript specific
  jsxSingleQuote: true,
  jsxBracketSameLine: false,

  // HTML formatting
  htmlWhitespaceSensitivity: 'css',

  // Vue formatting
  vueIndentScriptAndStyle: false,

  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',

  // Plugin configurations
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-organize-attributes',
    'prettier-plugin-tailwindcss',
  ],

  // Import sorting configuration
  importOrder: ['^react$', '^react-dom$', '^next', '^@?\\w', '^@/(.*)', '^\\.\\./', '^\\.'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderBuiltinModulesToTop: true,
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderMergeDuplicateImports: true,
  importOrderCombineTypeAndValueImports: true,

  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
        tabWidth: 2,
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: '*.toml',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.svg',
      options: {
        parser: 'html',
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
    {
      files: '*.css',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.scss',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.html',
      options: {
        tabWidth: 2,
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
    {
      files: '*.vue',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: ['*.config.js', '*.config.ts', '*.config.mjs'],
      options: {
        printWidth: 120,
      },
    },
    {
      files: 'package.json',
      options: {
        tabWidth: 2,
        printWidth: 120,
      },
    },
    {
      files: 'tsconfig.json',
      options: {
        tabWidth: 2,
        printWidth: 120,
        trailingComma: 'none',
      },
    },
  ],

  // Ignore patterns
  ignore: [
    // Build outputs
    'dist/**',
    'build/**',
    'target/**',
    'docs/book/**',

    // Dependencies
    'node_modules/**',

    // Generated files
    '*.min.js',
    '*.bundle.js',
    '*.map',

    // Binary files
    '*.png',
    '*.jpg',
    '*.jpeg',
    '*.gif',
    '*.ico',
    '*.woff',
    '*.woff2',
    '*.ttf',
    '*.eot',

    // Lock files
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'Cargo.lock',

    // Environment files
    '.env*',

    // Cache directories
    '.next/**',
    '.nuxt/**',
    '.cache/**',
    'coverage/**',

    // IDE files
    '.vscode/**',
    '.idea/**',

    // OS files
    '.DS_Store',
    'Thumbs.db',
  ],
};
