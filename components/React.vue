<script setup lang="ts">
/**
 * React component wrapper for Slidev
 * 
 * Usage in slides:
 *   <React is="Counter" :someProp="value" />
 * 
 * Components are auto-discovered from the react-components/ folder.
 * The component name is derived from the filename (e.g., Counter.jsx -> "Counter")
 */
import { onMounted, onUnmounted, ref, watch, getCurrentInstance } from 'vue'

const props = defineProps<{
  is: string
}>()

const instance = getCurrentInstance()
const container = ref<HTMLElement | null>(null)
let root: any = null
let registry: Record<string, any> | null = null

const loadRegistry = async () => {
  try {
    // Auto-discover all React components using Vite's glob import
    const modules = import.meta.glob('/react-components/**/*.{jsx,tsx}', { eager: true })
    
    registry = {}
    for (const path in modules) {
      const mod = modules[path] as any
      // Extract component name from path: /react-components/Counter.jsx -> "Counter"
      const name = path.split('/').pop()?.replace(/\.(jsx|tsx)$/, '') || ''
      if (name && mod.default) {
        registry[name] = mod.default
      }
    }
  } catch (e) {
    console.error('[slidev-addon-react] Failed to load react-components:', e)
    registry = {}
  }
}

const renderReact = async () => {
  if (!container.value) return

  if (!registry) {
    await loadRegistry()
  }

  const ReactComp = registry?.[props.is]

  if (!ReactComp) {
    const available = registry ? Object.keys(registry).join(', ') : 'none'
    console.warn(`[slidev-addon-react] Component "${props.is}" not found. Available: ${available}`)
    return
  }

  if (!root) {
    const ReactDOMClient = await import('react-dom/client')
    const createRoot = ReactDOMClient.createRoot || ReactDOMClient.default?.createRoot
    if (!createRoot) {
      console.error('[slidev-addon-react] createRoot not found')
      return
    }
    root = createRoot(container.value)
  }

  const React = await import('react')
  const createElement = React.createElement || React.default?.createElement

  // Extract props from Vue attrs
  const attrs = instance?.attrs || {}
  const cleanProps: Record<string, any> = {}

  for (const key in attrs) {
    if (key.startsWith('__') || key.startsWith('on') || key === 'class' || key === 'style') {
      continue
    }
    const val = attrs[key]
    cleanProps[key] = val
  }

  root.render(createElement(ReactComp, cleanProps))
}

onMounted(renderReact)

onUnmounted(() => {
  root?.unmount()
  root = null
})

watch(() => instance?.attrs, renderReact, { deep: true })
watch(() => props.is, renderReact)
</script>

<template>
  <div ref="container" class="slidev-react-container" />
</template>
