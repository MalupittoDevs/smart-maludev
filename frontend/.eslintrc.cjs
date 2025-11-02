module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
    env: { browser: true, es2022: true, node: true },
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        
    ],
    rules: {
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],    
    },
    ignorePatterns: ['dist', 'node_modules'],
};