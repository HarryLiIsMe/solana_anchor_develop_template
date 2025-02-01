const ts_eslint_plugin = require('@typescript-eslint/eslint-plugin');
const ts_eslint_parser = require('@typescript-eslint/parser');
const eslint_js = require('@eslint/js');

module.exports = [
    {
        ...eslint_js.configs.recommended,
        files: [
            'test/*.ts',
            'test/**/*.ts',
            'migrations/*.ts',
            'migrations/**/*.ts',
        ],
        languageOptions: {
            parser: ts_eslint_parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                requireConfigFile: false,
            },
            globals: {
                browser: false,
                es2021: true,
            },
        },
        plugins: {
            '@typescript-eslint': ts_eslint_plugin,
        },
        rules: {
            ...ts_eslint_plugin.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': 'warn',
            quotes: ['error', 'single', { allowTemplateLiterals: true }],
        },
    },
];
