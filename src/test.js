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
  // picture width / wrapper width ceil near to 0.1
  const ratio = Math.ceil(700 / 400 * 10) / 10

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
      currentZoom: 1 / ratio,
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
      beforeEach(() => {
        onChange.mockClear()
        const draggableComponent = component.find('Draggable')
        draggableComponent.props().onStop({}, { x: 50, y: 0 })
      })

      test('submit change to parent', () => {
        expect(onChange).toBeCalledWith(expect.objectContaining({
          x: 405,
          y: 135,
        }))
      })
    })

    describe('when picture position Y change', () => {
      beforeEach(() => {
        onChange.mockClear()
        const draggableComponent = component.find('Draggable')
        draggableComponent.props().onStop({}, { x: 0, y: 50 })
      })

      test('submit change to parent', () => {
        expect(onChange).toBeCalledWith(expect.objectContaining({
          x: 495,
          y: 45,
        }))
      })
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

  describe('with zoom actions', () => {
    let beforeProps = {}
    beforeAll(() => {
      beforeProps = {...props}
      props = {
        enableZoomActions: true,
      }
    })
    afterAll(() => {
      props = {...beforeProps}
    })

    test('display zoom controls', () => {
      expect(component.find('button')).toHaveLength(2)
    })

    describe('when zoom in', () => {
      beforeEach(() => {
        onChange.mockClear()
        const zoomInButton = component.find('button').at(0)
        zoomInButton.simulate('click')
      })

      test('submit change to parent', () => {
        expect(onChange).toBeCalledWith(expect.objectContaining({
          zoom: 0.5655555555555556,
          width: 265.22593320235757,
          height: 265.22593320235757,
          x: 2.387033398821233,
          y: 2.387033398821233,
        }))
      })

      test('recalculate bounds', () => {
        expect(component.state('bounds')).toMatchObject({
          bottom: 75,
          left: 29.111111111111086,
          right: 275,
          top: 55.333333333333314,
        })
      })

      describe('when move position', () => {
        beforeEach(() => {
          onChange.mockClear()
          component.instance().setState({
            picturePositionX: 100,
            picturePositionY: 75,
          })
        })

        test('submit change to parent', () => {
          expect(onChange).toBeCalledWith(expect.objectContaining({
            zoom: 0.5655555555555556,
            width: 265.22593320235757,
            height: 265.22593320235757,
            x: 176.8172888015717,
            y: 132.61296660117878,
          }))
        })
      })
    })

    describe('when zoom out', () => {
      beforeEach(() => {
        component.instance().setState({
          currentZoom: 5,
        })
        onChange.mockClear()
        const zoomInButton = component.find('button').at(1)
        zoomInButton.simulate('click')
      })
      test('submit change to parent', () => {
        expect(onChange).toBeCalledWith(expect.objectContaining({
          zoom: 4.5,
          width: 150 / 4.5,
          height: 150 / 4.5,
          x: 0,
          y: 0,
        }))
      })

      test('recalculate bounds', () => {
        expect(component.state('bounds')).toMatchObject({
          bottom: 75,
          left: -2725,
          right: 275,
          top: -1125,
        })
      })

      describe('when move position', () => {
        beforeEach(() => {
          onChange.mockClear()
          component.instance().setState({
            picturePositionX: 100,
            picturePositionY: 75,
          })
        })

        test('submit change to parent', () => {
          expect(onChange).toBeCalledWith(expect.objectContaining({
            zoom: 4.5,
            width: 150 / 4.5,
            height: 150 / 4.5,
            x: 100 / 4.5,
            y: 75 / 4.5,
          }))
        })
      })
    })

    describe('when zoom in over the max', () => {
      beforeEach(() => {
        component.instance().setState({
          currentZoom: 5,
        })
      })
      test('button is disabled', () => {
        const zoomInButton = component.update().find('button').at(0)
        expect(zoomInButton.prop('disabled')).toBe(true)
      })
    })

    describe('when zoom out over the min', () => {
      beforeEach(() => {
        component.instance().setState({
          currentZoom: Math.ceil(150 / 700 * 10) / 10,
        })
      })
      test('button is disabled', () => {
        const zoomOutButton = component.update().find('button').at(1)
        expect(zoomOutButton.prop('disabled')).toBe(true)
      })
    })
  })

  describe('with rotation actions', () => {
    let beforeProps = {}
    beforeAll(() => {
      beforeProps = {...props}
      props = {
        enableRotateActions: true,
      }
    })
    afterAll(() => {
      props = {...beforeProps}
    })

    test('display zoom controls', () => {
      expect(component.find('button')).toHaveLength(2)
    })

    describe('when rotate to right', () => {
      beforeEach(() => {
        const rotateRightButton = component.find('button').at(1)
        rotateRightButton.simulate('click')
      })

      test('submit change to parent', () => {
        expect(onChange).toBeCalledWith(expect.objectContaining({
          rotation: 90,
        }))
      })

      test('recalculate bounds', () => {
        expect(component.state('bounds')).toMatchObject({
          bottom: 75,
          left: 258.3333333333333,
          right: 275,
          top: -163.8888888888889,
        })
      })
    })

    describe('when rotate to left', () => {
      beforeEach(() => {
        const rotateLeftButton = component.find('button').at(0)
        rotateLeftButton.simulate('click')
      })

      test('submit change to parent', () => {
        expect(onChange).toBeCalledWith(expect.objectContaining({
          rotation: 270,
          x: 0,
          y: 430,
        }))
      })

      test('recalculate bounds', () => {
        expect(component.state('bounds')).toMatchObject({
          bottom: 75,
          left: 258.3333333333333,
          right: 275,
          top: -163.8888888888889,
        })
      })
    })
  })
})
