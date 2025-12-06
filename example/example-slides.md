---
theme: default
addons:
  - slidev-addon-react
---

# Testing Object/Array Props

## Test Component

Copy `test-component.jsx` to `react-components/TestProps.jsx` in your Slidev project.

---

## Primitives Only

<React 
  is="TestProps"
  title="Primitives Test"
  :count="10"
/>

---

## With Objects and Arrays

<React 
  is="TestProps"
  title="Full Props Test"
  :count="42"
  :config="{ theme: 'dark', size: 'large', enabled: true }"
  :items="[1, 2, 3, 'four', { nested: 'value' }]"
  :nested="{ user: { name: 'John', age: 30 }, tags: ['react', 'vue'] }"
/>

---

## Complex Nested Structure

<React 
  is="TestProps"
  title="Complex Test"
  :count="100"
  :config="{ 
    theme: 'dark', 
    settings: { 
      fontSize: 16, 
      colors: ['red', 'blue', 'green'] 
    } 
  }"
  :items="[
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' }
  ]"
  :nested="{ 
    metadata: { 
      created: '2025-01-01',
      tags: ['test', 'demo']
    },
    data: {
      users: [{ name: 'Alice' }, { name: 'Bob' }]
    }
  }"
/>

---

## Expected Results

✅ **Primitives** (title, count) should display  
✅ **Objects** (config) should display as JSON  
✅ **Arrays** (items) should display as JSON  
✅ **Nested structures** should display correctly  

If all props render correctly, the fix is working! 🎉

