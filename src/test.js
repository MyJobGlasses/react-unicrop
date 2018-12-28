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
    // due to non-render element size by jsdom
    // we need to trigger manually feature
    component.setState({
      pictureWidth: 700,
      pictureHeight: 300,
      wrapperWidth: 400,
      wrapperHeight: 250,
      holePositionY: (300 - 150) / 2,
      holePositionX: (700 - 150) / 2,
    })
    component.instance()._calculateDraggableBounds()
  })

  describe('hole', () => {
    describe('when component did mount', () => {
      describe('when hole position is center', () => {
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
    describe('when rotate 0deg & zoom x 2', () => {
      beforeEach(() => {
        component.setState({
          currentZoom: 2,
          currentRotation: 0,
        })
      })

      test('correctly calculate bounds', () => {
        expect(component.state('bounds')).toMatchObject({
          bottom: 75,
          left: -975,
          right: 275,
          top: -375,
        })
      })
    })
    describe('when rotate 90deg & zoom x 1', () => {
      beforeEach(() => {
        component.instance().setState({
          currentRotation: 90,
          currentZoom: 1,
        })
      })

      test('correctly calculate bounds', () => {
        expect(component.state('bounds')).toMatchObject({
          bottom: 75,
          left: 125,
          right: 275,
          top: -475,
        })
      })
    })
    describe('when rotate 90deg & zoom x 2', () => {
      beforeEach(() => {
        component.instance().setState({
          currentRotation: 90,
          currentZoom: 2,
        })
      })

      test('correctly calculate bounds', () => {
        expect(component.state('bounds')).toMatchObject({
          bottom: 75,
          left: -175,
          right: 275,
          top: -1175,
        })
      })
    })
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
