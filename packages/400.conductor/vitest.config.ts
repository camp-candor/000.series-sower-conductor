import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['val/**/*.test.ts', '**/*.test.ts'],
    },
})
