import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Cropper from './components/Cropper'

Enzyme.configure({
  adapter: new Adapter(),
})

describe('#Cropper', () => {
  let component
  let props = {}
  let src = 'https://picsum.photos/500/300/?random'
  const onChange = jest.fn()

  beforeEach(() => {
    component = mount(<Cropper
      {...props}
      onChange={onChange}
      src={src}
    />)
  })

  describe('hole', () => {
    describe('when component did mount', () => {
      describe('when hole position is center', () => {
        // @todo mock wrapper height/width
        test('calculate hole position', () => {})
      })
    })
    describe('when picture position X change', () => {
      test('submit change to parent', () => {})
    })
    describe('when picture position Y change', () => {
      test('submit change to parent', () => {})
    })
    describe('when picture change', () => {
      test('submit change to parent', () => {})
    })
  })

  describe('hole bounds', () => {
    describe('when rotate 0deg & zoom x 2', () => {})
    describe('when rotate 90deg & zoom x 1', () => {})
    describe('when rotate 90deg & zoom x 2', () => {})
  })

  describe('when image load', () => {
    test('update picture height', () => {})
    test('update picture width', () => {})
  })

  describe('with zoom actions', () => {
    describe('when zoom in', () => {
      test('submit change to parent', () => {})
    })
    describe('when zoom out', () => {
      test('submit change to parent', () => {})
    })
    describe('when zoom in over the max', () => {
      test('button is disabled', () => {})
    })
    describe('when zoom out over the min', () => {
      test('button is disabled', () => {})
    })
  })

  describe('with rotation actions', () => {
    describe('when rotate to right', () => {
      test('submit change to parent', () => {})
    })
    describe('when rotate to left', () => {
      test('submit change to parent', () => {})
    })
  })
})
