import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
        build: {
            lib: {
                entry: resolve('electron-src/main/index.ts'),
            },
            outDir: 'dist/main',
        },
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
        build: {
            lib: {
                entry: resolve('electron-src/preload/index.ts'),
            },
            outDir: 'dist/preload',
        },
    },
    renderer: {
        root: resolve('electron-src/renderer'),
        base: './',
        publicDir: resolve('electron-src/renderer/public'),
        resolve: {
            alias: {
                '@renderer': resolve('electron-src/renderer/src'),
            },
        },
        build: {
            rollupOptions: {
                input: {
                    index: resolve('electron-src/renderer/index.html'),
                },
            },
            outDir: 'dist/renderer',
        },
        plugins: [react()],
    },
});
