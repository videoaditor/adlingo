import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['server/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^(req|res|next)$' }] },
  },
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['server/**'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: { react },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // eslint-plugin-react isn't in extends; this one rule makes JSX references
      // (<motion.div>, <Icon/>) count toward no-unused-vars.
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // eslint-plugin-react-hooks v7 enables the full React-Compiler ruleset as
      // errors. This project doesn't run the compiler, and two rules fire on
      // intentional patterns: set-state-in-effect (auth/data-loading effects in
      // App/Admin/Course) and purity (ConfettiBurst's random confetti in useMemo).
      // ponytail: keep them visible as warnings, don't fail lint. Upgrade path:
      // adopt the React Compiler and fix for real, or pin react-hooks to v6.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
])
