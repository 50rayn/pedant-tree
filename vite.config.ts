import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        emptyOutDir: true,
        lib: {
            entry: resolve(__dirname, './src/index.ts'),
            name: 'PedantTree'
        }
    },
    define: {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        VERSION: JSON.stringify(require('./package.json').version)
    }
})
