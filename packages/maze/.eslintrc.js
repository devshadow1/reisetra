module.exports = {
    extends: ['next/core-web-vitals', 'standard', 'prettier'],
    plugins: ['unused-imports'],
    rules: {
        'react/no-children-prop': 0,
        'no-unused-vars': 'off', // or "@typescript-eslint/no-unused-vars": "off",
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
            'warn',
            {
                vars: 'all',
                varsIgnorePattern: '^_',
                args: 'after-used',
                argsIgnorePattern: '^_',
            },
        ],
    },
}
