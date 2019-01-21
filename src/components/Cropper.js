import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Draggable from 'react-draggable'

import RotateRightIcon from '../icons/rotate-right.svg'
import RotateLeftIcon from '../icons/rotate-left.svg'
import PlusIcon from '../icons/plus.svg'
import MinusIcon from '../icons/minus.svg'

import styles from './Cropper.css'

class Cropper extends Component {
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
      realZoomMin: props.zoomMin || 0,
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

  componentDidUpdate({ holeSize, zoomMin }, { holePositionX, holePositionY, pictureHeight, pictureWidth, currentZoom, picturePositionX, picturePositionY, currentRotation }) {
    if (
      this.props.holeSize !== holeSize ||
      this.state.holePositionX !== holePositionX ||
      this.state.holePositionY !== holePositionY ||
      this.state.pictureHeight !== pictureHeight ||
      this.state.pictureWidth !== pictureWidth ||
      this.state.currentRotation !== currentRotation ||
      this.state.currentZoom !== currentZoom
    ) {
      this._calculateRealZoomMin()
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
   * @param {Number} forcedRatio
   * @returns {Object}
   */
  _calculatePicturePosition(forcedRatio, forcedRotation) {
    const {
      wrapperHeight,
      wrapperWidth,
      holePositionX,
      holePositionY,
      scaleRatio,
    } = this.state
    const ratio = forcedRatio || scaleRatio
    const { clientHeight, clientWidth } = this.pictureRef.current
    const pictureHeight = (this._isLandscape(forcedRotation) ? clientHeight : clientWidth) / ratio
    const pictureWidth = (this._isLandscape(forcedRotation) ? clientWidth : clientHeight) / ratio
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
    const { initialPictureRotation } = this.props
    const { wrapperWidth, currentZoom } = this.state
    const pictureHeight = this.pictureRef.current.clientHeight
    const pictureWidth = this.pictureRef.current.clientWidth
    const scaleRatio = pictureWidth / wrapperWidth
    const {
      picturePositionX,
      picturePositionY,
    } = this._calculatePicturePosition(scaleRatio, initialPictureRotation)
    this.setState({
      pictureHeight,
      pictureWidth,
      picturePositionX,
      picturePositionY,
      scaleRatio,
      currentRotation: initialPictureRotation,
      currentZoom: this._interpolateWithScale(currentZoom, scaleRatio),
    })
  }

  /**
   * Prevent image to be draggable on Firefox
   * @param {Object} e
   */
  _preventImageDraggableBehavior(e) {
    e.preventDefault()
  }

  /**
   * Process value to handle scale ratio
   * @param {Number} value
   */
  _interpolateWithScale(value, forcedScaleRatio) {
    const { scaleRatio } = this.state
    return value / (forcedScaleRatio || scaleRatio)
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
        top: holePositionY + holeSize - (this._isLandscape(currentRotation) ? pictureHeight : pictureWidth) * currentZoom,
        left: holePositionX + holeSize - (this._isLandscape(currentRotation) ? pictureWidth : pictureHeight) * currentZoom,
        bottom: holePositionY,
        right: holePositionX,
      },
    })
  }

  /**
   * Calculate a zoom min based on holeSize to prevent picture to be out of box
   */
  _calculateRealZoomMin() {
    const { zoomMin, holeSize } = this.props
    const {
      pictureWidth,
      pictureHeight,
    } = this.state
    let realZoomMin = zoomMin
    const maxPictureZoomOut = Math.max(holeSize / pictureWidth, holeSize / pictureHeight)
    if (!zoomMin || zoomMin < maxPictureZoomOut) {
      realZoomMin = maxPictureZoomOut
    }
    this.setState({
      realZoomMin,
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
   * Calculate most appropriate step size
   */
  _getCurrentStepValue() {
    const { zoomStep } = this.props
    const {
      currentZoom,
      realZoomMin,
    } = this.state
    if (currentZoom - this._interpolateWithScale(zoomStep) > this._interpolateWithScale(1)) {
      return zoomStep
    } else if (currentZoom > realZoomMin && currentZoom - this._interpolateWithScale(0.1) < realZoomMin) {
      return 0.01
    } else {
      return 0.1
    }
  }

  /**
   * Check if passed zoom allow to zoom in
   * @param {Number} zoom
   */
  _canZoomIn() {
    const { zoomMax } = this.props
    const { currentZoom } = this.state
    return currentZoom < this._interpolateWithScale(zoomMax)
  }

  /**
   * Check if passed zoom allow to zoom out
   * Prevent from zoom lower than hole
   * @param {Number} zoom
   */
  _canZoomOut() {
    const {
      realZoomMin,
      currentZoom,
    } = this.state
    return currentZoom - this._interpolateWithScale(this._getCurrentStepValue()) >= realZoomMin
  }

  /**
   * Check if current rotation correspond to landscape
   * true if rotation = 0 or 180
   * false if rotation = 90 or 270
   * @param {Number} rotation
   */
  _isLandscape(rotation) {
    return (rotation / 90) % 2 === 0
  }

  /**
   * We need to move the picture back into the hole after zooming in/out
   * @param {Number} newZoom
   * @param {Number} newRotation
   */
  _keepImageCenteredOnAction(newZoom, newRotation = false) {
    let {
      picturePositionX,
      picturePositionY,
      currentZoom,
      pictureHeight,
      pictureWidth,
      currentRotation,
    } = this.state
    const {
      holeSize,
    } = this.props

    let adjustPositionX = picturePositionX
    let adjustPositionY = picturePositionY

    newRotation = newRotation !== false ? newRotation : currentRotation

    // When rotating image to left
    if (!(currentRotation === 0 && newRotation === 270) && ((currentRotation === 270 && newRotation === 0) || currentRotation < newRotation)) {
      adjustPositionY = picturePositionX
      adjustPositionX = (this._isLandscape(currentRotation) ? pictureHeight : pictureWidth) * newZoom - holeSize - picturePositionY
    // When rotating image to right
    } else if ((currentRotation === 0 && newRotation === 270) || currentRotation > newRotation) {
      adjustPositionX = picturePositionY
      adjustPositionY = (this._isLandscape(currentRotation) ? pictureWidth : pictureHeight) * newZoom - holeSize - picturePositionX
    }

    // Zoom on picture center
    const holeDiffSize = holeSize - (holeSize / currentZoom * newZoom)
    adjustPositionX = (adjustPositionX / currentZoom * newZoom) - (holeDiffSize / 2)
    adjustPositionY = (adjustPositionY / currentZoom * newZoom) - (holeDiffSize / 2)

    // fix picture out of bounds
    const bottomBoundsPictureMargin = ((this._isLandscape(newRotation) ? pictureHeight : pictureWidth) * newZoom) - adjustPositionY - holeSize
    if (bottomBoundsPictureMargin < 0) {
      adjustPositionY = adjustPositionY + bottomBoundsPictureMargin
    }
    const rightBoundsPictureMargin = ((this._isLandscape(newRotation) ? pictureWidth : pictureHeight) * newZoom) - adjustPositionX - holeSize
    if (rightBoundsPictureMargin < 0) {
      adjustPositionX = adjustPositionX + rightBoundsPictureMargin
    }

    // prevent out of bounds
    if (adjustPositionX < 0) {
      adjustPositionX = 0
    }
    if (adjustPositionY < 0) {
      adjustPositionY = 0
    }

    return {
      picturePositionX: adjustPositionX,
      picturePositionY: adjustPositionY,
    }
  }

  /**
   * Increment current zoom by zoomStep prop
   * (limited to zoomMax props)
   */
  handleZoomPlus() {
    const {
      currentZoom,
    } = this.state
    if (this._canZoomIn()) {
      const newZoom = currentZoom + this._interpolateWithScale(this._getCurrentStepValue())
      this.setState({
        currentZoom: newZoom,
        ...this._keepImageCenteredOnAction(newZoom),
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
    } = this.state
    if (this._canZoomOut()) {
      const newZoom = currentZoom - this._interpolateWithScale(this._getCurrentStepValue())
      this.setState({
        currentZoom: newZoom,
        ...this._keepImageCenteredOnAction(newZoom),
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
    if (!enableZoomActions) {
      return null
    }
    return (
      <div className={styles.zoomController}>
        <button
          className={styles.controllerButton}
          onClick={this.handleZoomPlus}
          disabled={!this._canZoomIn()}
        >
          <PlusIcon />
        </button>
        <button
          className={styles.controllerButton}
          onClick={this.handleZoomMinus}
          disabled={!this._canZoomOut()}
        >
          <MinusIcon />
        </button>
      </div>
    )
  }

  /**
   * Rotate picture by step of 90deg
   * (in clockwise)
   */
  handleRotateToRight() {
    const { currentRotation, currentZoom } = this.state
    let newRotation = currentRotation + 90
    if (newRotation >= 360) {
      newRotation = 0
    }
    this.setState({
      currentRotation: newRotation,
      ...this._keepImageCenteredOnAction(currentZoom, newRotation),
    })
  }

  /**
   * Rotate picture by step of 90deg
   * (in anticlockwise)
   */
  handleRotateToLeft() {
    const { currentRotation, currentZoom } = this.state
    let newRotation = currentRotation - 90
    if (newRotation === -90) {
      newRotation = 270
    }
    this.setState({
      currentRotation: newRotation,
      ...this._keepImageCenteredOnAction(currentZoom, newRotation),
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
          onClick={this.handleRotateToLeft}
        >
          <RotateLeftIcon />
        </button>
        <button
          className={styles.controllerButton}
          onClick={this.handleRotateToRight}
        >
          <RotateRightIcon />
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
              onMouseDown={this._preventImageDraggableBehavior}
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
  initialPictureRotation: PropTypes.number,
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

export default Cropper
