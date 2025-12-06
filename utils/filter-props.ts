import { isRef, unref, isReactive, toRaw } from 'vue'

/**
 * Filter Vue attrs to extract only React-compatible props
 * 
 * This function:
 * 1. Filters out Vue-specific attributes (__, on*, class, style)
 * 2. Filters out Vue VNodes (which cause React runtime errors)
 * 3. Unwraps Vue reactive objects (ref, reactive) for clean React props
 * 
 * @param attrs - Vue component attributes
 * @returns Clean props object suitable for React components
 */
export function filterProps(attrs: Record<string, any>): Record<string, any> {
  const cleanProps: Record<string, any> = {}

  for (const key in attrs) {
    // Skip Vue internal attribute keys (__*, on*, class, style)
    if (key.startsWith('__') || key.startsWith('on') || key === 'class' || key === 'style') {
      continue
    }
    
    let val = attrs[key]
    
    // Skip Vue VNode values (objects with __v_isVNode property)
    const isVNode = typeof val === 'object' && val !== null && '__v_isVNode' in val && (val as any).__v_isVNode
    if (isVNode) {
      continue
    }
    
    // Unwrap Vue ref values
    if (isRef(val)) {
      val = unref(val)
    }
    
    // Unwrap Vue reactive objects to plain objects
    if (isReactive(val)) {
      val = toRaw(val)
    }
    
    cleanProps[key] = val
  }

  return cleanProps
}
