import { defineVitePluginsSetup } from '@slidev/types'
import type { Plugin } from 'vite'

export default defineVitePluginsSetup(() => {
  const reactJsxPlugin: Plugin = {
    name: 'slidev-addon-react-jsx',
    enforce: 'pre',
    async transform(code, id) {
      // Only transform .jsx/.tsx files in react-components folder
      if (!id.includes('react-components') || !/\.[jt]sx$/.test(id)) {
        return null
      }

      // Use Vite's built-in esbuild transform
      const { transform } = await import('vite')
      
      // Transform JSX to JS using esbuild via Vite
      // We manually transform the JSX since Vite's transform expects full module
      const esbuild = await import('esbuild')
      const result = await esbuild.transform(code, {
        loader: id.endsWith('.tsx') ? 'tsx' : 'jsx',
        jsx: 'automatic',
        jsxImportSource: 'react',
        sourcefile: id,
        sourcemap: true,
      })

      return {
        code: result.code,
        map: result.map,
      }
    },
  }

  const reactConfigPlugin: Plugin = {
    name: 'slidev-addon-react-config',
    enforce: 'pre',
    config() {
      return {
        optimizeDeps: {
          include: [
            'react', 
            'react-dom', 
            'react-dom/client',
            'react/jsx-runtime', 
            'react/jsx-dev-runtime'
          ],
        },
        resolve: {
          dedupe: ['react', 'react-dom'],
        },
      }
    },
  }

  return [reactJsxPlugin, reactConfigPlugin]
})
