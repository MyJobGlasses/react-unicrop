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
    this._updateDimentions = this._updateDimentions.bind(this)
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

  /**
   * Update wrapper dimentions
   * + update position of the hole
   * + update position of the picture
   */
  _updateDimentions() {
    const { holeSize, holePosition } = this.props
    const {
      picturePositionX,
      picturePositionY,
    } = this._calculatePicturePosition()
    const {
      picturePositionX: currentPicturePositionX,
      picturePositionY: currentPicturePositionY,
    } = this.state
    const {
      clientHeight: wrapperHeight,
      clientWidth: wrapperWidth,
    } = this.wrapperRef.current
    const xMarge = (holePosition === 'center' || holePosition.left === 'center') ? (wrapperWidth - holeSize) / 2 : holePosition.left
    const yMarge = (holePosition === 'center' || holePosition.top === 'center') ? (wrapperHeight - holeSize) / 2 : holePosition.top
    const xDiff = picturePositionX - currentPicturePositionX
    const yDiff = picturePositionY - currentPicturePositionY
    this.setState({
      wrapperHeight,
      wrapperWidth,
      holePositionY: yMarge,
      holePositionX: xMarge,
      picturePositionY: picturePositionY - yDiff,
      picturePositionX: picturePositionX - xDiff,
      scaleRatio: 1,
    })
  }

  componentDidMount() {
    this._updateDimentions()
    window.addEventListener('resize', this._updateDimentions, false)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._updateDimentions, false)
  }

  componentDidUpdate({ holeSize }, { holePositionX, holePositionY, pictureHeight, pictureWidth, currentZoom, picturePositionX, picturePositionY, currentRotation }) {
    if (
      this.props.holeSize !== holeSize ||
      this.state.holePositionX !== holePositionX ||
      this.state.holePositionY !== holePositionY ||
      this.state.pictureHeight !== pictureHeight ||
      this.state.pictureWidth !== pictureWidth ||
      this.state.currentRotation !== currentRotation ||
      this.state.currentZoom !== currentZoom
    ) {
      this._calculateDraggableBounds()
      this.submitChangeToParent()
    }

    if (
      this.state.picturePositionX !== picturePositionX ||
      this.state.picturePositionY !== picturePositionY
    ) {
      this.submitChangeToParent()
    }
  }

  /**
   * Use picture height/width to recenter picture
   * @returns {Object}
   */
  _calculatePicturePosition() {
    const {
      wrapperHeight,
      wrapperWidth,
      holePositionX,
      holePositionY,
    } = this.state
    const pictureHeight = this.pictureRef.current.clientHeight
    const pictureWidth = this.pictureRef.current.clientWidth
    let picturePositionX = holePositionX
    let picturePositionY = holePositionY
    // calculate position against hole
    if (pictureHeight < wrapperHeight) {
      const margeY = ((wrapperHeight - pictureHeight) / 2)
      picturePositionY = holePositionY - margeY
    }
    if (pictureWidth < wrapperWidth) {
      const margeX = ((wrapperWidth - pictureWidth) / 2)
      picturePositionX = holePositionX - margeX
    }
    return {
      picturePositionX,
      picturePositionY,
    }
  }

  /**
   * Retrieve picture size when loaded
   */
  onImageLoaded() {
    const { wrapperWidth, currentZoom } = this.state
    const pictureHeight = this.pictureRef.current.clientHeight
    const pictureWidth = this.pictureRef.current.clientWidth
    const { picturePositionX, picturePositionY } = this._calculatePicturePosition()
    const scaleRatio = Math.ceil(pictureWidth / wrapperWidth * 10) / 10
    this.setState({
      pictureHeight,
      pictureWidth,
      picturePositionX,
      picturePositionY,
      scaleRatio,
      currentZoom: this._interpolateWithScale(currentZoom, scaleRatio),
    })
  }

  /**
   * Process value to handle scale ratio
   * @param {Number} value
   */
  _interpolateWithScale(value, forcedScaleRatio) {
    const { scaleRatio } = this.state
    return Math.floor(value / (forcedScaleRatio || scaleRatio) * 100) / 100
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
      currentZoom,
    } = this.state
    const {
      holeSize,
    } = this.props
    this.setState({
      bounds: {
        top: holePositionY + holeSize - ((currentRotation / 90) % 2 === 0 ? pictureHeight : pictureWidth) * currentZoom,
        left: holePositionX + holeSize - ((currentRotation / 90) % 2 === 0 ? pictureWidth : pictureHeight) * currentZoom,
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
    const {
      holeSize,
      onChange,
    } = this.props
    onChange({
      x: picturePositionX / currentZoom,
      y: picturePositionY / currentZoom,
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
   * Retrieve min zoom based on hole size
   * @todo refacto to component did update ?
   */
  _getMinZoom() {
    const { zoomMin, holeSize } = this.props
    const { pictureWidth } = this.state
    let effectiveZoomMin = zoomMin
    const maxPictureZoomOut = Math.ceil(holeSize / pictureWidth * 10) / 10
    if (!zoomMin || zoomMin < maxPictureZoomOut) {
      effectiveZoomMin = maxPictureZoomOut
    }
    return effectiveZoomMin
  }

  /**
   * Calculate most appropriate step size
   */
  _getCurrentStepValue() {
    const { zoomStep } = this.props
    const { currentZoom } = this.state
    if (currentZoom - zoomStep > 1) {
      return zoomStep
    } else if (currentZoom > this._getMinZoom() && (currentZoom - this._interpolateWithScale(0.1)) < this._getMinZoom()) {
      return currentZoom - this._getMinZoom()
    } else {
      return 0.1
    }
  }

  /**
   * Check if passed zoom allow to zoom plus
   * @param {Number} zoom
   */
  _canZoomIn(zoom) {
    const { zoomMax } = this.props
    return zoom < this._interpolateWithScale(zoomMax)
  }

  /**
   * Check if passed zoom allow to zoom minus
   * Prevent from zoom lower than hole
   * @param {Number} zoom
   */
  _canZoomOut(zoom) {
    return zoom - this._getCurrentStepValue() >= this._getMinZoom()
  }

  /**
   * Increment current zoom by zoomStep prop
   * (limited to zoomMax props)
   */
  handleZoomPlus() {
    const {
      currentZoom,
      picturePositionX,
      picturePositionY,
    } = this.state
    if (this._canZoomIn(currentZoom)) {
      const newZoom = currentZoom + this._interpolateWithScale(this._getCurrentStepValue())
      this.setState({
        currentZoom: newZoom,
        picturePositionX: picturePositionX / currentZoom * newZoom,
        picturePositionY: picturePositionY / currentZoom * newZoom,
      })
    }
  }

  /**
   * Decrement current zoom by zoomStep prop
   * (limited to zoomMin)
   */
  handleZoomMinus() {
    const {
      currentZoom,
      picturePositionX,
      picturePositionY,
    } = this.state
    if (this._canZoomOut(currentZoom)) {
      const newZoom = currentZoom - this._interpolateWithScale(this._getCurrentStepValue())
      this.setState({
        currentZoom: newZoom,
        picturePositionX: picturePositionX / currentZoom * newZoom,
        picturePositionY: picturePositionY / currentZoom * newZoom,
      })
    }
  }

  /**
   * Render zoom controller
   */
  renderZoomController() {
    const {
      enableZoomActions,
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
          disabled={!this._canZoomIn(currentZoom)}
        >
          +
        </button>
        <button
          className={styles.controllerButton}
          onClick={this.handleZoomMinus}
          disabled={!this._canZoomOut(currentZoom)}
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
    const { enableRotateActions } = this.props
    if (!enableRotateActions) {
      return null
    }
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
      picturePositionX,
      picturePositionY,
      holePositionX,
      holePositionY,
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
          position={{
            x: holePositionX - picturePositionX,
            y: holePositionY - picturePositionY,
          }}
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
  height: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  width: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
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
  enableRotateActions: PropTypes.bool,
}

Cropper.defaultProps = {
  holeSize: 150,
  holePosition: 'center',
  zoomMax: 5,
  zoomStep: 0.5,
  enableZoomActions: false,
  height: 300,
  width: 500,
  enableRotateActions: false,
}
