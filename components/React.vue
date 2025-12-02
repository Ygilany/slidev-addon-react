<script setup lang="ts">
/**
 * React component wrapper for Slidev
 * 
 * Usage in slides:
 *   <React is="MyComponent" :someProp="value" />
 * 
 * Your React components should be:
 *   1. Placed in the `react-components/` folder
 *   2. Registered in `react-components/index.ts`
 */
import { onMounted, onUnmounted, ref, watch, getCurrentInstance } from 'vue'
import * as ReactDOM from 'react-dom/client'
import * as React from 'react'

const props = defineProps<{
  /** Name of the React component to render (must be registered in react-components/index.ts) */
  is: string
}>()

const instance = getCurrentInstance()
const container = ref<HTMLElement | null>(null)
let root: ReactDOM.Root | null = null
let registry: Record<string, any> | null = null

const loadRegistry = async () => {
  try {
    // Dynamic import of user's react-components registry
    const mod = await import('/react-components/index.ts')
    registry = mod.default || mod
  } catch (e) {
    console.error('[slidev-addon-react] Failed to load react-components/index.ts:', e)
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
    // Handle both ESM and CJS exports
    const createRoot = ReactDOM.createRoot || (ReactDOM as any).default?.createRoot
    if (!createRoot) {
      console.error('[slidev-addon-react] createRoot not found in react-dom/client')
      return
    }
    root = createRoot(container.value)
  }

  // Extract props from Vue attrs, filtering out Vue internals
  const attrs = instance?.attrs || {}
  const cleanProps: Record<string, any> = {}

  for (const key in attrs) {
    if (key.startsWith('__') || key.startsWith('on') || key === 'class' || key === 'style') {
      continue
    }
    const val = attrs[key]
    if (typeof val !== 'object' || val === null) {
      cleanProps[key] = val
    }
  }

  // Handle both ESM and CJS exports for createElement
  const createElement = React.createElement || (React as any).default?.createElement
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
