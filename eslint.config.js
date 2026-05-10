const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettier = require('eslint-config-prettier');

module.exports = [
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json',
                sourceType: 'module'
            }
        },
        plugins: {
            '@typescript-eslint': tseslint
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...prettier.rules,
            '@typescript-eslint/no-unused-vars': ['warn'],
            '@typescript-eslint/no-explicit-any': 'off'
        }
    },
    {
        ignores: ['build/', 'node_modules/']
    }
];
