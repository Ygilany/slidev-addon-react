# slidev-addon-react

Use React components with JSX/TSX in your [Slidev](https://sli.dev) presentations.

## Installation

```bash
npm install slidev-addon-react react react-dom
# or
pnpm add slidev-addon-react react react-dom
```

## Setup

### 1. Add the addon to your slides

In your `slides.md` frontmatter:

```yaml
---
addons:
  - slidev-addon-react
---
```

### 2. Create your React components

Create a `react-components/` folder in your project root and add your React components using JSX:

```jsx
// react-components/Counter.jsx
import { useState } from 'react'

export default function Counter({ initial = 0 }) {
  const [count, setCount] = useState(initial)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  )
}
```

### 3. Register your components

Create `react-components/index.ts` to export your components:

```typescript
// react-components/index.ts
import Counter from './Counter.jsx'

export default {
  Counter,
  // Add more components here
}
```

### 4. Use in your slides

```markdown
# My Slide

<React is="Counter" :initial="5" />
```

## TypeScript Support

You can use `.tsx` files for your React components:

```tsx
// react-components/Counter.tsx
import { useState } from 'react'

interface Props {
  initial?: number
}

export default function Counter({ initial = 0 }: Props) {
  const [count, setCount] = useState(initial)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  )
}
```

## Props

Props are passed from Vue to React. Primitive values (strings, numbers, booleans), objects, and arrays are supported:

```markdown
<!-- Primitives -->
<React is="MyComponent" title="Hello" :count="42" :enabled="true" />

<!-- Objects and arrays -->
<React is="MyComponent" :config="{ theme: 'dark', size: 'large' }" :items="[1, 2, 3]" />
```

When passing objects or arrays, use Vue's binding syntax (`:propName="..."`) with proper object/array literal syntax.

## How it works

This addon:

1. Provides a `<React>` Vue component that mounts React components using `react-dom/client`
2. Intercepts `.jsx`/`.tsx` files in `react-components/` and transforms them using esbuild with React's automatic JSX runtime (before Vue's JSX transform can process them)
3. Pre-bundles React dependencies for optimal performance

## Testing

This package uses [Vitest](https://vitest.dev) for testing.

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests once (used in CI)
npm run test:run

# Run tests with coverage
npm run test:coverage
```

## Local Development

For local addon development, use an absolute path in your slides:

```yaml
addons:
  - /path/to/slidev-addon-react
```

## Publishing

This package uses GitHub Actions to automatically publish to npm when a version tag is pushed.

### Publishing a New Version

**Option 1: Using npm scripts (Recommended)**

```bash
# Patch version (1.0.0 -> 1.0.1)
npm run version:patch

# Minor version (1.0.0 -> 1.1.0)
npm run version:minor

# Major version (1.0.0 -> 2.0.0)
npm run version:major
```

These scripts will:
1. Update the version in `package.json`
2. Create a git commit with the version change
3. Create a git tag (e.g., `v1.0.1`)
4. Push the commit and tag to GitHub

**Option 2: Manual process**

1. Update the version in `package.json`:
   ```bash
   # Edit package.json manually or use:
   npm version patch|minor|major --no-git-tag-version
   ```

2. Commit the change:
   ```bash
   git add package.json
   git commit -m "chore: bump version to X.Y.Z"
   ```

3. Create and push a version tag:
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

### What Happens Next

When you push a version tag (e.g., `v1.0.1`), the GitHub Action will:
- ✅ Install dependencies
- ✅ **Run all tests** (publishing will fail if tests don't pass)
- ✅ Verify the tag version matches `package.json`
- ✅ Check if the version already exists on npm
- ✅ Publish to npm (if it's a new version and tests pass)
- ✅ Create a GitHub release with auto-generated release notes

**Note:** Make sure you have `NPM_TOKEN` configured as a GitHub secret in your repository settings. The workflow will automatically prevent publishing if tests fail, ensuring only tested code is published.

## License

MIT
