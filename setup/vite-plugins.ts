import { defineVitePluginsSetup } from '@slidev/types'

export default defineVitePluginsSetup(() => {
  return [
    {
      name: 'slidev-addon-react-jsx',
      enforce: 'pre',
      async transform(code, id) {
        // Only transform .jsx/.tsx files in react-components folder
        if (!id.includes('react-components') || !/\.[jt]sx$/.test(id)) {
          return null
        }

        // Transform JSX using esbuild with React's automatic runtime
        const esbuild = await import('esbuild')
        const result = await esbuild.transform(code, {
          loader: id.endsWith('.tsx') ? 'tsx' : 'jsx',
          jsx: 'automatic',
          jsxImportSource: 'react',
        })

        return {
          code: result.code,
          map: result.map,
        }
      },
    },
    {
      name: 'slidev-addon-react-config',
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
          // Ensure react-dom/client is properly resolved
          resolve: {
            dedupe: ['react', 'react-dom'],
          },
        }
      },
    },
  ]
})
