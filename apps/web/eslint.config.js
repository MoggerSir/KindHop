import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    plugins: { react, 'react-hooks': reactHooks, 'react-refresh': reactRefresh, 'jsx-a11y': jsxA11y },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      // jsx-uses-vars marca como usadas las variables que solo aparecen en JSX (<Icon />, <motion.div>).
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Una feature solo se consume por su index.js.
      'no-restricted-imports': ['error', { patterns: [{ group: ['@/features/*/*'], message: 'Importa la feature desde @/features/<nombre> (index.js).' }] }],
    },
  },
  {
    // Regla de idiomas: todo texto visible sale de src/shared/i18n/locales/<idioma>.json vía useI18n().t('clave').
    files: ['src/**/*.jsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: 'JSXText[value=/[A-Za-zÀ-ÿ]/]', message: 'Texto visible fijo: añádelo a shared/i18n/locales/*.json y usa t(\'clave\').' },
        {
          selector: 'JSXAttribute[name.name=/^(aria-label|aria-description|title|placeholder|alt)$/] > Literal[value=/\\S/]',
          message: 'Texto accesible fijo: añádelo a shared/i18n/locales/*.json y usa t(\'clave\').',
        },
      ],
    },
  },
  {
    files: ['src/shared/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['@/features/*', '@/app/*'], message: 'shared no puede depender de features ni app.' }] }],
    },
  },
  { files: ['vite.config.js', 'eslint.config.js', 'playwright.config.js'], languageOptions: { globals: globals.node } },
];
