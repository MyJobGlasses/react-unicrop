import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Draggable from 'react-draggable'

import styles from './Cropper.css'

export default class Cropper extends Component {
  constructor(props) {
    super(props)
    this.onDragStop = this.onDragStop.bind(this)
    this.onImageLoaded = this.onImageLoaded.bind(this)
    this.handleZoomMinus = this.handleZoomMinus.bind(this)
    this.handleZoomPlus = this.handleZoomPlus.bind(this)
    this.handleRotateToRight = this.handleRotateToRight.bind(this)
    this.handleRotateToLeft = this.handleRotateToLeft.bind(this)
    this.state = {
      wrapperHeight: 0,
      wrapperWidth: 0,
      holePositionX: 0,
      holePositionY: 0,
      picturePositionX: 0,
      picturePositionY: 0,
      pictureHeight: 0,
      pictureWidth: 0,
      bounds: {
        top: 0,
        left: 0,
        bottom: 10000,
        right: 10000,
      },
      currentZoom: 1,
      currentRotation: 0,
    }
    this.wrapperRef = React.createRef()
    this.pictureRef = React.createRef()
  }

  componentDidMount() {
    const wrapperHeight = this.wrapperRef.current.clientHeight
    const wrapperWidth = this.wrapperRef.current.clientWidth
    const { holeSize, holePosition } = this.props
    const xMarge = (holePosition === 'center' || holePosition.left === 'center') ? (wrapperWidth - holeSize) / 2 : holePosition.left
    const yMarge = (holePosition === 'center' || holePosition.top === 'center') ? (wrapperHeight - holeSize) / 2 : holePosition.top
    this.setState({
      wrapperHeight,
      wrapperWidth,
      holePositionY: yMarge,
      holePositionX: xMarge,
      picturePositionX: xMarge,
      picturePositionY: yMarge,
    })
  }

  componentDidUpdate({ holeSize }, { holePositionX, holePositionY, pictureHeight, pictureWidth, currentZoom, picturePositionX, picturePositionY, currentRotation }) {
    if (
      this.props.holeSize !== holeSize ||
      this.state.holePositionX !== holePositionX ||
      this.state.holePositionY !== holePositionY ||
      this.state.pictureHeight !== pictureHeight ||
      this.state.pictureWidth !== pictureWidth ||
      this.state.currentRotation !== currentRotation
    ) {
      this._calculateDraggableBounds()
      this.submitChangeToParent()
    }

    if (
      this.state.picturePositionX !== picturePositionX ||
      this.state.picturePositionY !== picturePositionY ||
      this.state.currentZoom !== currentZoom
    ) {
      this.submitChangeToParent()
    }
  }

  /**
   * Retrieve picture size when loaded
   */
  onImageLoaded() {
    const pictureHeight = this.pictureRef.current.clientHeight
    const pictureWidth = this.pictureRef.current.clientWidth
    this.setState({
      pictureHeight,
      pictureWidth,
    })
  }

  /**
   * Calculate draggable bounds
   * Use maximum draggable x / y
   */
  _calculateDraggableBounds() {
    const {
      holePositionX,
      holePositionY,
      pictureHeight,
      pictureWidth,
      currentRotation,
    } = this.state
    const {
      holeSize,
    } = this.props
    this.setState({
      bounds: {
        top: holePositionY + holeSize - ((currentRotation / 90) % 2 === 0 ? pictureHeight : pictureWidth),
        left: holePositionX + holeSize - ((currentRotation / 90) % 2 === 0 ? pictureWidth : pictureHeight),
        bottom: holePositionY,
        right: holePositionX,
      },
    })
  }

  /**
   * Calculate position on picture (with hole offset)
   * @param {Object} event - event data
   * @param {Object} data - draggable data
   */
  onDragStop(_, { x, y }) {
    const { holePositionX, holePositionY } = this.state
    const picturePositionX = holePositionX - x
    const picturePositionY = holePositionY - y
    this.setState({
      picturePositionX,
      picturePositionY,
    })
  }

  /**
   * Call onChange props to submit changes to parent
   */
  submitChangeToParent() {
    const {
      picturePositionX,
      picturePositionY,
      currentZoom,
      currentRotation,
    } = this.state
    const { holeSize } = this.props
    this.props.onChange({
      x: picturePositionX,
      y: picturePositionY,
      width: holeSize / currentZoom,
      height: holeSize / currentZoom,
      zoom: currentZoom,
      rotation: currentRotation,
    })
  }

  /**
   * Render preview hole
   */
  renderHole() {
    const { holeSize } = this.props
    const {
      holePositionX,
      holePositionY,
    } = this.state
    return (
      <div
        className={styles.hole}
        style={{
          width: holeSize,
          height: holeSize,
          top: holePositionY,
          left: holePositionX,
        }}
      />
    )
  }

  /**
   * Increment current zoom by 0.5
   * (limited to zoomMax props)
   */
  handleZoomPlus() {
    const { zoomMax, zoomStep } = this.props
    const { currentZoom } = this.state
    if (currentZoom < zoomMax) {
      this.setState({
        currentZoom: currentZoom + zoomStep,
      })
    }
  }

  /**
   * Decrement current zoom by 0.5
   * (limited to zoomMin)
   */
  handleZoomMinus() {
    const { zoomMin, zoomStep } = this.props
    const { currentZoom } = this.state
    if (currentZoom > zoomMin) {
      this.setState({
        currentZoom: currentZoom - zoomStep,
      })
    }
  }

  /**
   * Render zoom controller
   */
  renderZoomController() {
    const {
      enableZoomActions,
      zoomMin,
      zoomMax,
    } = this.props
    const { currentZoom } = this.state
    if (!enableZoomActions) {
      return null
    }
    return (
      <div className={styles.zoomController}>
        <button
          className={styles.controllerButton}
          onClick={this.handleZoomPlus}
          disabled={zoomMax <= currentZoom}
        >
          +
        </button>
        <button
          className={styles.controllerButton}
          onClick={this.handleZoomMinus}
          disabled={zoomMin >= currentZoom}
        >
          -
        </button>
      </div>
    )
  }

  /**
   * Rotate picture by step of 90deg
   * (in clockwise)
   */
  handleRotateToRight() {
    const { currentRotation } = this.state
    let newRotation = currentRotation + 90
    if (newRotation >= 360) {
      newRotation = 0
    }
    this.setState({
      currentRotation: newRotation,
    })
  }

  /**
   * Rotate picture by step of 90deg
   * (in anticlockwise)
   */
  handleRotateToLeft() {
    const { currentRotation } = this.state
    let newRotation = currentRotation - 90
    if (newRotation <= -360) {
      newRotation = 0
    }
    this.setState({
      currentRotation: newRotation,
    })
  }

  /**
   * Handle rotation controls
   */
  renderRotationController() {
    return (
      <div
        className={styles.rotationController}
      >
        <button
          className={styles.controllerButton}
          onClick={this.handleRotateToRight}
        >
          ⟳
        </button>
        <button
          className={styles.controllerButton}
          onClick={this.handleRotateToLeft}
        >
          ⟲
        </button>
      </div>
    )
  }

  render() {
    const { src, width, height, holeSize } = this.props
    const {
      bounds,
      currentZoom,
      currentRotation,
    } = this.state
    return (
      <div
        style={{
          width,
          height,
        }}
        className={styles.wrapper}
        ref={this.wrapperRef}
      >
        <Draggable
          onStop={this.onDragStop}
          bounds={bounds}
          scale={currentZoom}
        >
          <div
            style={{
              position: 'relative',
              width: bounds.right - bounds.left + holeSize,
              height: bounds.bottom - bounds.top + holeSize,
            }}
          >
            <img
              ref={this.pictureRef}
              src={src}
              alt='Image to crop'
              draggable={false}
              onLoad={this.onImageLoaded}
              style={{
                transformOrigin: 'center',
                transform: `translate(-50%, -50%) scale(${currentZoom}) rotateZ(${currentRotation}deg)`,
                position: 'absolute',
                top: '50%',
                left: '50%',
              }}
            />
          </div>
        </Draggable>
        { this.renderHole() }
        <aside className={styles.actions}>
          { this.renderZoomController() }
          { this.renderRotationController() }
        </aside>
      </div>
    )
  }
}

Cropper.propTypes = {
  src: PropTypes.string.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
  holeSize: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  holePosition: PropTypes.oneOfType([
    PropTypes.oneOf(['center']),
    PropTypes.shape({
      top: PropTypes.oneOfType([
        PropTypes.number.isRequired,
        PropTypes.oneOf(['center']),
      ]),
      left: PropTypes.oneOfType([
        PropTypes.number.isRequired,
        PropTypes.oneOf(['center']),
      ]),
    }),
  ]),
  zoomMin: PropTypes.number,
  zoomMax: PropTypes.number,
  zoomStep: PropTypes.number,
  enableZoomActions: PropTypes.bool,
}

Cropper.defaultProps = {
  holeSize: 150,
  holePosition: 'center',
  zoomMin: 1,
  zoomMax: 5,
  zoomStep: 0.5,
  enableZoomActions: false,
  height: 300,
  width: 500,
}
