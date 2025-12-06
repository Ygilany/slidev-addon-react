import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

/**
 * CRITICAL REGRESSION TEST
 * 
 * This test verifies that React.vue uses the correct filtering logic.
 * 
 * The problem: Previous tests only tested filterProps in isolation,
 * so reverting React.vue to use old inline logic went undetected.
 * 
 * This test reads the actual component source to verify:
 * 1. It imports filterProps from utils
 * 2. It calls filterProps(attrs)
 * 3. It does NOT have the old restrictive inline logic
 */

describe('React.vue - Regression Prevention', () => {
  const componentPath = path.join(__dirname, '../components/React.vue')
  const source = fs.readFileSync(componentPath, 'utf-8')

  it('should import filterProps from utils/filter-props', () => {
    expect(source).toContain("import { filterProps }")
    expect(source).toContain("from '../utils/filter-props'")
  })

  it('should call filterProps(attrs) to process props', () => {
    expect(source).toContain("filterProps(attrs)")
  })

  it('should NOT have old inline logic that filters out objects', () => {
    // Old logic: `if (typeof val !== 'object' || val === null)`
    // This incorrectly filters out ALL objects/arrays
    const hasOldLogic = source.includes("typeof val !== 'object'")
    
    if (hasOldLogic) {
      throw new Error(
        'REGRESSION DETECTED!\n\n' +
        'React.vue contains old inline filtering logic that filters out ALL objects/arrays.\n' +
        'This breaks passing objects/arrays as props to React components.\n\n' +
        'Fix: Use filterProps from utils/filter-props.ts instead of inline logic.\n' +
        'The filterProps utility only filters VNodes, not regular objects/arrays.'
      )
    }
    
    expect(hasOldLogic).toBe(false)
  })

  it('should NOT have inline for-loop filtering logic', () => {
    // Check for the pattern of the old inline logic
    // Old pattern: for (const key in attrs) { ... cleanProps[key] = val ... }
    // with the typeof check
    
    const hasInlineLoop = 
      source.includes('for (const key in attrs)') &&
      source.includes("cleanProps[key] = val") &&
      !source.includes('filterProps(attrs)')
    
    expect(hasInlineLoop).toBe(false)
  })
})

/**
 * Additional verification that filterProps utility is correct
 */
describe('filterProps utility - Behavior Verification', () => {
  it('should allow objects through (not filter them)', async () => {
    const { filterProps } = await import('../utils/filter-props')
    
    const result = filterProps({
      config: { theme: 'dark' },
    })
    
    expect(result.config).toBeDefined()
    expect(result.config).toEqual({ theme: 'dark' })
  })

  it('should allow arrays through (not filter them)', async () => {
    const { filterProps } = await import('../utils/filter-props')
    
    const result = filterProps({
      items: [1, 2, 3],
    })
    
    expect(result.items).toBeDefined()
    expect(result.items).toEqual([1, 2, 3])
  })

  it('should filter out VNodes (safety measure)', async () => {
    const { filterProps } = await import('../utils/filter-props')
    
    const mockVNode = { __v_isVNode: true, type: 'div' }
    const result = filterProps({
      title: 'Hello',
      vnode: mockVNode,
    })
    
    expect(result.title).toBe('Hello')
    expect(result.vnode).toBeUndefined()
  })

  it('should filter Vue internal keys', async () => {
    const { filterProps } = await import('../utils/filter-props')
    
    const result = filterProps({
      title: 'Hello',
      class: 'my-class',
      style: { color: 'red' },
      onClick: () => {},
      __internal: 'filtered',
    })
    
    expect(result.title).toBe('Hello')
    expect(result.class).toBeUndefined()
    expect(result.style).toBeUndefined()
    expect(result.onClick).toBeUndefined()
    expect(result.__internal).toBeUndefined()
  })
})
