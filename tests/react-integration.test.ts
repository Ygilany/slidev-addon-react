import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import React from 'react'
import { createRoot, Root } from 'react-dom/client'
import { JSDOM } from 'jsdom'
import { filterProps } from '../utils/filter-props'

/**
 * Integration tests that verify:
 * 1. VNodes are filtered out (otherwise React throws runtime errors)
 * 2. Objects/arrays are passed through correctly
 * 3. The filtering prevents actual React errors
 * 
 * These tests use real React rendering to verify the actual behavior.
 */

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
global.document = dom.window.document
global.window = dom.window as any

describe('React Integration - VNode Filtering', () => {
  let container: HTMLElement
  let root: Root | null = null
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = null
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (root) {
      try {
        root.unmount()
      } catch {
        // Ignore unmount errors
      }
      root = null
    }
    if (container.parentNode) {
      document.body.removeChild(container)
    }
    consoleErrorSpy.mockRestore()
  })

  it('should prevent React errors by filtering VNodes', async () => {
    // Create a mock VNode (Vue virtual node)
    const mockVNode = {
      __v_isVNode: true,
      type: 'div',
      props: {},
      children: [],
    }

    // Component that would error if it receives VNode as child
    function TestComponent({ data }: { data?: any }) {
      // If data is a VNode and we try to render it, React throws
      return React.createElement('div', null, data ? String(data) : 'no data')
    }

    // WITHOUT filtering - VNode would cause error if rendered as child
    const unfiltered = { data: mockVNode }
    
    // WITH filtering - VNode is removed
    const filtered = filterProps({ data: mockVNode })

    // Verify VNode was filtered
    expect(filtered.data).toBeUndefined()

    // Render with filtered props should work fine
    root = createRoot(container)
    root.render(React.createElement(TestComponent, filtered))
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(container.textContent).toBe('no data')
  })

  it('should demonstrate React error when VNode is rendered as child', async () => {
    const mockVNode = {
      __v_isVNode: true,
      type: 'div',
      props: {},
    }

    // Component that tries to render VNode directly as child (BAD)
    function BadComponent({ vnode }: { vnode?: any }) {
      return React.createElement('div', null, vnode)
    }

    root = createRoot(container)
    root.render(React.createElement(BadComponent, { vnode: mockVNode }))
    
    await new Promise(resolve => setTimeout(resolve, 100))

    // React should have logged an error about objects not being valid children
    const hasReactError = consoleErrorSpy.mock.calls.some((call: any[]) => {
      const msg = String(call[0] || '')
      return msg.includes('Objects are not valid as a React child')
    })

    expect(hasReactError).toBe(true)
  })
})

describe('React Integration - Objects and Arrays', () => {
  let container: HTMLElement
  let root: Root | null = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = null
  })

  afterEach(() => {
    if (root) {
      try {
        root.unmount()
      } catch {
        // Ignore
      }
      root = null
    }
    if (container.parentNode) {
      document.body.removeChild(container)
    }
  })

  it('should pass objects to React components correctly', async () => {
    // Component that uses object props
    function ConfigDisplay({ config }: { config: { theme: string; size: string } }) {
      return React.createElement('div', null, `Theme: ${config.theme}, Size: ${config.size}`)
    }

    const props = filterProps({
      config: { theme: 'dark', size: 'large' },
    })

    root = createRoot(container)
    root.render(React.createElement(ConfigDisplay, props as any))
    
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(container.textContent).toBe('Theme: dark, Size: large')
  })

  it('should pass arrays to React components correctly', async () => {
    // Component that renders array items
    function ItemList({ items }: { items: number[] }) {
      return React.createElement(
        'ul',
        null,
        items.map((item, i) => React.createElement('li', { key: i }, item))
      )
    }

    const props = filterProps({
      items: [1, 2, 3],
    })

    root = createRoot(container)
    root.render(React.createElement(ItemList, props as any))
    
    await new Promise(resolve => setTimeout(resolve, 50))

    const listItems = container.querySelectorAll('li')
    expect(listItems.length).toBe(3)
    expect(listItems[0].textContent).toBe('1')
    expect(listItems[1].textContent).toBe('2')
    expect(listItems[2].textContent).toBe('3')
  })

  it('should pass nested structures to React components correctly', async () => {
    function UserCard({ user }: { user: { name: string; tags: string[] } }) {
      return React.createElement(
        'div',
        null,
        React.createElement('h1', null, user.name),
        React.createElement(
          'ul',
          null,
          user.tags.map((tag, i) => React.createElement('li', { key: i }, tag))
        )
      )
    }

    const props = filterProps({
      user: { name: 'John', tags: ['react', 'vue', 'typescript'] },
    })

    root = createRoot(container)
    root.render(React.createElement(UserCard, props as any))
    
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(container.querySelector('h1')?.textContent).toBe('John')
    const tags = container.querySelectorAll('li')
    expect(tags.length).toBe(3)
    expect(tags[0].textContent).toBe('react')
  })
})

describe('React Integration - Callback Functions', () => {
  let container: HTMLElement
  let root: Root | null = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = null
  })

  afterEach(() => {
    if (root) {
      try {
        root.unmount()
      } catch {
        // Ignore
      }
      root = null
    }
    if (container.parentNode) {
      document.body.removeChild(container)
    }
  })

  it('should pass callback functions to React components', async () => {
    let callCount = 0
    const handleAction = () => { callCount++ }

    // Note: handleAction is NOT filtered because it doesn't start with 'on'
    function ActionButton({ handleAction }: { handleAction: () => void }) {
      return React.createElement('button', { onClick: handleAction }, 'Click')
    }

    const props = filterProps({ handleAction })
    
    root = createRoot(container)
    root.render(React.createElement(ActionButton, props as any))
    
    await new Promise(resolve => setTimeout(resolve, 50))

    const button = container.querySelector('button')
    expect(button).toBeTruthy()
    
    // Simulate click
    button?.click()
    expect(callCount).toBe(1)
  })

  it('should pass render prop functions correctly', async () => {
    function List({ renderItem, items }: { renderItem: (item: any) => string; items: any[] }) {
      return React.createElement(
        'ul',
        null,
        items.map((item, i) => 
          React.createElement('li', { key: i }, renderItem(item))
        )
      )
    }

    const props = filterProps({
      items: [{ name: 'A' }, { name: 'B' }],
      renderItem: (item: any) => `Item: ${item.name}`,
    })

    root = createRoot(container)
    root.render(React.createElement(List, props as any))
    
    await new Promise(resolve => setTimeout(resolve, 50))

    const items = container.querySelectorAll('li')
    expect(items[0].textContent).toBe('Item: A')
    expect(items[1].textContent).toBe('Item: B')
  })
})

