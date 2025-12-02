<script setup lang="ts">
/**
 * React component wrapper for Slidev
 * 
 * Usage in slides:
 *   <React is="MyComponent" :someProp="value" />
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
    // Dynamic import to ensure proper bundling
    const ReactDOMClient = await import('react-dom/client')
    const createRoot = ReactDOMClient.createRoot || ReactDOMClient.default?.createRoot
    if (!createRoot) {
      console.error('[slidev-addon-react] createRoot not found')
      return
    }
    root = createRoot(container.value)
  }

  // Dynamic import React
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
    if (typeof val !== 'object' || val === null) {
      cleanProps[key] = val
    }
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
