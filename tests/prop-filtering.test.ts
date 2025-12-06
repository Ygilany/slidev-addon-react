import { describe, it, expect } from 'vitest'
import { ref, reactive, computed } from 'vue'
import { filterProps } from '../utils/filter-props'

/**
 * Test the prop filtering logic
 * 
 * These tests use the ACTUAL filterProps function from utils/filter-props.ts
 * which is also used by components/React.vue
 * 
 * This ensures tests always match the component behavior!
 */

/**
 * OLD filtering logic (before fix) - filters out ALL objects/arrays
 * This is what the code looked like before allowing objects/arrays
 */
function filterPropsOld(attrs: Record<string, any>): Record<string, any> {
  const cleanProps: Record<string, any> = {}

  for (const key in attrs) {
    if (key.startsWith('__') || key.startsWith('on') || key === 'class' || key === 'style') {
      continue
    }
    const val = attrs[key]
    // OLD: Only allow primitives and null, filter out ALL objects/arrays
    if (typeof val !== 'object' || val === null) {
      cleanProps[key] = val
    }
  }

  return cleanProps
}

describe('Prop Filtering Logic - Current Implementation', () => {
  describe('Primitives', () => {
    it('should allow string props', () => {
      const result = filterProps({ title: 'Hello' })
      expect(result).toEqual({ title: 'Hello' })
    })

    it('should allow number props', () => {
      const result = filterProps({ count: 42 })
      expect(result).toEqual({ count: 42 })
    })

    it('should allow boolean props', () => {
      const result = filterProps({ enabled: true, disabled: false })
      expect(result).toEqual({ enabled: true, disabled: false })
    })

    it('should allow null values', () => {
      const result = filterProps({ value: null })
      expect(result).toEqual({ value: null })
    })

    it('should allow undefined values', () => {
      const result = filterProps({ value: undefined })
      expect(result).toEqual({ value: undefined })
    })

    it('should allow multiple primitives', () => {
      const result = filterProps({
        title: 'Hello',
        count: 42,
        enabled: true,
        value: null,
      })
      expect(result).toEqual({
        title: 'Hello',
        count: 42,
        enabled: true,
        value: null,
      })
    })
  })

  describe('Objects', () => {
    it('should allow plain objects', () => {
      const result = filterProps({
        config: { theme: 'dark', size: 'large' },
      })
      expect(result).toEqual({
        config: { theme: 'dark', size: 'large' },
      })
    })

    it('should allow multiple objects', () => {
      const result = filterProps({
        config: { theme: 'dark' },
        user: { name: 'John', age: 30 },
      })
      expect(result).toEqual({
        config: { theme: 'dark' },
        user: { name: 'John', age: 30 },
      })
    })

    it('should allow empty objects', () => {
      const result = filterProps({ config: {} })
      expect(result).toEqual({ config: {} })
    })
  })

  describe('Arrays', () => {
    it('should allow arrays', () => {
      const result = filterProps({ items: [1, 2, 3] })
      expect(result).toEqual({ items: [1, 2, 3] })
    })

    it('should allow arrays with mixed types', () => {
      const result = filterProps({ items: [1, 'two', true, null] })
      expect(result).toEqual({ items: [1, 'two', true, null] })
    })

    it('should allow empty arrays', () => {
      const result = filterProps({ items: [] })
      expect(result).toEqual({ items: [] })
    })

    it('should allow arrays with objects', () => {
      const result = filterProps({
        items: [{ id: 1 }, { id: 2 }],
      })
      expect(result).toEqual({
        items: [{ id: 1 }, { id: 2 }],
      })
    })
  })

  describe('Nested Structures', () => {
    it('should allow nested objects', () => {
      const result = filterProps({
        nested: {
          user: { name: 'John', age: 30 },
          tags: ['react', 'vue'],
        },
      })
      expect(result).toEqual({
        nested: {
          user: { name: 'John', age: 30 },
          tags: ['react', 'vue'],
        },
      })
    })

    it('should allow deeply nested structures', () => {
      const result = filterProps({
        data: {
          metadata: {
            created: '2025-01-01',
            tags: ['test'],
          },
          items: [{ id: 1 }, { id: 2 }],
        },
      })
      expect(result).toEqual({
        data: {
          metadata: {
            created: '2025-01-01',
            tags: ['test'],
          },
          items: [{ id: 1 }, { id: 2 }],
        },
      })
    })
  })

  describe('Vue Internals Filtering', () => {
    it('should filter out Vue VNodes', () => {
      const mockVNode = {
        __v_isVNode: true,
        type: 'div',
        props: {},
      }
      const result = filterProps({
        normalProp: 'value',
        vnode: mockVNode,
      })
      expect(result).toEqual({ normalProp: 'value' })
      expect(result.vnode).toBeUndefined()
    })

    it('should filter out props starting with __', () => {
      const result = filterProps({
        normalProp: 'value',
        __vueInternal: 'should be filtered',
        __v_isRef: true,
      })
      expect(result).toEqual({ normalProp: 'value' })
      expect(result.__vueInternal).toBeUndefined()
      expect(result.__v_isRef).toBeUndefined()
    })

    it('should filter out event handlers (on*)', () => {
      const result = filterProps({
        normalProp: 'value',
        onClick: () => {},
        onMouseEnter: () => {},
      })
      expect(result).toEqual({ normalProp: 'value' })
      expect(result.onClick).toBeUndefined()
      expect(result.onMouseEnter).toBeUndefined()
    })

    it('should filter out class and style', () => {
      const result = filterProps({
        normalProp: 'value',
        class: 'some-class',
        style: { color: 'red' },
      })
      expect(result).toEqual({ normalProp: 'value' })
      expect(result.class).toBeUndefined()
      expect(result.style).toBeUndefined()
    })
  })

  describe('Complex Real-World Scenarios', () => {
    it('should handle a mix of all prop types', () => {
      const result = filterProps({
        title: 'Hello',
        count: 42,
        enabled: true,
        config: { theme: 'dark', size: 'large' },
        items: [1, 2, 3],
        nested: {
          user: { name: 'John' },
          tags: ['react', 'vue'],
        },
        onClick: () => {},
        class: 'test',
      })
      expect(result).toEqual({
        title: 'Hello',
        count: 42,
        enabled: true,
        config: { theme: 'dark', size: 'large' },
        items: [1, 2, 3],
        nested: {
          user: { name: 'John' },
          tags: ['react', 'vue'],
        },
      })
      expect(result.onClick).toBeUndefined()
      expect(result.class).toBeUndefined()
    })

    it('should preserve object references (not deep clone)', () => {
      const originalObj = { theme: 'dark' }
      const result = filterProps({ config: originalObj })
      expect(result.config).toBe(originalObj)
    })
  })
})

describe('Prop Filtering Logic - Regression Test', () => {
  /**
   * This test verifies that objects and arrays are NOT filtered out
   * If this test fails, it means the code was reverted to the old logic
   * that filters out all objects/arrays
   */
  it('should allow objects and arrays (regression test for fix)', () => {
    const attrs = {
      title: 'Hello',
      config: { theme: 'dark' },
      items: [1, 2, 3],
    }

    const result = filterProps(attrs)

    // These assertions will FAIL if old logic is in place
    expect(result.config).toBeDefined()
    expect(result.config).toEqual({ theme: 'dark' })
    expect(result.items).toBeDefined()
    expect(result.items).toEqual([1, 2, 3])
  })

  it('should demonstrate difference between old and new logic', () => {
    const attrs = {
      title: 'Hello',
      config: { theme: 'dark' },
      items: [1, 2, 3],
    }

    const newResult = filterProps(attrs)
    const oldResult = filterPropsOld(attrs)

    // New logic allows objects/arrays
    expect(newResult.config).toBeDefined()
    expect(newResult.items).toBeDefined()

    // Old logic filters them out
    expect(oldResult.config).toBeUndefined()
    expect(oldResult.items).toBeUndefined()

    // Both allow primitives
    expect(newResult.title).toBe('Hello')
    expect(oldResult.title).toBe('Hello')
  })
})

describe('Vue Reactivity Handling', () => {
  describe('Vue ref()', () => {
    it('should unwrap ref with primitive value', () => {
      const countRef = ref(42)
      const result = filterProps({ count: countRef })
      expect(result.count).toBe(42)
    })

    it('should unwrap ref with string value', () => {
      const titleRef = ref('Hello')
      const result = filterProps({ title: titleRef })
      expect(result.title).toBe('Hello')
    })

    it('should unwrap ref with object value', () => {
      const configRef = ref({ theme: 'dark' })
      const result = filterProps({ config: configRef })
      expect(result.config).toEqual({ theme: 'dark' })
    })

    it('should unwrap ref with array value', () => {
      const itemsRef = ref([1, 2, 3])
      const result = filterProps({ items: itemsRef })
      expect(result.items).toEqual([1, 2, 3])
    })

    it('should unwrap ref with null value', () => {
      const nullRef = ref(null)
      const result = filterProps({ value: nullRef })
      expect(result.value).toBeNull()
    })

    it('should unwrap computed ref', () => {
      const base = ref(10)
      const doubled = computed(() => base.value * 2)
      const result = filterProps({ doubled })
      expect(result.doubled).toBe(20)
    })
  })

  describe('Vue reactive()', () => {
    it('should unwrap reactive object to plain object', () => {
      const reactiveConfig = reactive({ theme: 'dark', size: 'large' })
      const result = filterProps({ config: reactiveConfig })
      expect(result.config).toEqual({ theme: 'dark', size: 'large' })
      // Should be plain object, not proxy
      expect(result.config).not.toBe(reactiveConfig)
    })

    it('should unwrap reactive array to plain array', () => {
      const reactiveItems = reactive([1, 2, 3])
      const result = filterProps({ items: reactiveItems })
      expect(result.items).toEqual([1, 2, 3])
    })

    it('should unwrap nested reactive objects', () => {
      const reactiveData = reactive({
        user: { name: 'John', age: 30 },
        tags: ['react', 'vue'],
      })
      const result = filterProps({ data: reactiveData })
      expect(result.data).toEqual({
        user: { name: 'John', age: 30 },
        tags: ['react', 'vue'],
      })
    })
  })

  describe('Mixed reactivity', () => {
    it('should handle mix of ref and reactive with primitives', () => {
      const titleRef = ref('Hello')
      const countRef = ref(42)
      const reactiveConfig = reactive({ theme: 'dark' })
      
      const result = filterProps({
        title: titleRef,
        count: countRef,
        config: reactiveConfig,
        plainProp: 'plain',
      })

      expect(result.title).toBe('Hello')
      expect(result.count).toBe(42)
      expect(result.config).toEqual({ theme: 'dark' })
      expect(result.plainProp).toBe('plain')
    })
  })
})

describe('Function Props', () => {
  it('should allow non-event callback functions', () => {
    const renderItem = (item: any) => `Item: ${item}`
    const result = filterProps({ renderItem })
    expect(result.renderItem).toBe(renderItem)
    expect(typeof result.renderItem).toBe('function')
  })

  it('should allow formatter functions', () => {
    const formatDate = (date: Date) => date.toISOString()
    const result = filterProps({ formatDate })
    expect(result.formatDate).toBe(formatDate)
  })

  it('should filter out event handlers (on* prefix)', () => {
    const onClick = () => {}
    const onSubmit = () => {}
    const handleClick = () => {} // This should NOT be filtered
    
    const result = filterProps({ onClick, onSubmit, handleClick })
    
    expect(result.onClick).toBeUndefined()
    expect(result.onSubmit).toBeUndefined()
    expect(result.handleClick).toBe(handleClick) // Allowed - not on* prefix
  })

  it('should allow arrow functions', () => {
    const compute = (x: number) => x * 2
    const result = filterProps({ compute })
    expect(result.compute(5)).toBe(10)
  })
})

describe('Edge Cases', () => {
  it('should handle Symbol values', () => {
    const sym = Symbol('test')
    const result = filterProps({ symbol: sym })
    expect(result.symbol).toBe(sym)
  })

  it('should handle BigInt values', () => {
    const big = BigInt(9007199254740991)
    const result = filterProps({ bigNumber: big })
    expect(result.bigNumber).toBe(big)
  })

  it('should handle Date objects', () => {
    const date = new Date('2025-01-01')
    const result = filterProps({ date })
    expect(result.date).toBe(date)
    expect(result.date instanceof Date).toBe(true)
  })

  it('should handle RegExp objects', () => {
    const regex = /test/gi
    const result = filterProps({ pattern: regex })
    expect(result.pattern).toBe(regex)
    expect(result.pattern instanceof RegExp).toBe(true)
  })

  it('should handle Map objects', () => {
    const map = new Map([['key', 'value']])
    const result = filterProps({ data: map })
    expect(result.data).toBe(map)
    expect(result.data instanceof Map).toBe(true)
  })

  it('should handle Set objects', () => {
    const set = new Set([1, 2, 3])
    const result = filterProps({ unique: set })
    expect(result.unique).toBe(set)
    expect(result.unique instanceof Set).toBe(true)
  })

  it('should handle empty attrs', () => {
    const result = filterProps({})
    expect(result).toEqual({})
  })

  it('should not modify the original attrs object', () => {
    const original = { title: 'Hello', onClick: () => {} }
    const originalCopy = { ...original }
    filterProps(original)
    expect(original).toEqual(originalCopy)
  })
})

