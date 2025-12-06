import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReactVue from '../components/React.vue'

describe('React.vue Component', () => {
  it('should render without crashing', () => {
    const wrapper = mount(ReactVue, {
      props: {
        is: 'TestComponent',
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.slidev-react-container').exists()).toBe(true)
  })

  it('should accept the "is" prop', () => {
    const wrapper = mount(ReactVue, {
      props: {
        is: 'MyComponent',
      },
    })

    expect(wrapper.props('is')).toBe('MyComponent')
  })

  it('should render the container div', () => {
    const wrapper = mount(ReactVue, {
      props: {
        is: 'TestComponent',
      },
    })

    const container = wrapper.find('.slidev-react-container')
    expect(container.exists()).toBe(true)
    expect(container.element.tagName).toBe('DIV')
  })
})

