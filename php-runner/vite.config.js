// Builds runner.js and the PHP 8.4 runtime it loads. scripts/build-php.mjs removes the other PHP versions afterwards.
export default {
    base: './',
    assetsInclude: ['**/*.wasm', '**/*.so', '**/*.dat', '**/*.data'],
    build: {
        target: 'es2022',
        outDir: 'dist',
        emptyOutDir: true,
        chunkSizeWarningLimit: 100000,
        rollupOptions: { input: 'runner.js', preserveEntrySignatures: 'exports-only', output: { entryFileNames: 'runner.js' } },
    },
}
