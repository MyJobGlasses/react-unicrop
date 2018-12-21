import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Draggable from 'react-draggable'

import styles from './styles.css'

export default class Cropper extends Component {
  constructor(props) {
    super(props)
    this.onDragStop = this.onDragStop.bind(this)
    this.onImageLoaded = this.onImageLoaded.bind(this)
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
    }
    this.wrapperRef = React.createRef()
    this.pictureRef = React.createRef()
  }

  componentDidMount() {
    const wrapperHeight = this.wrapperRef.current.clientHeight
    const wrapperWidth = this.wrapperRef.current.clientWidth
    const { holeSize } = this.props
    this.setState({
      wrapperHeight,
      wrapperWidth,
      holePositionY: (wrapperHeight - holeSize) / 2,
      holePositionX: (wrapperWidth - holeSize) / 2,
    })
  }

  componentDidUpdate({ holeSize }, { holePositionX, holePositionY, pictureHeight, pictureWidth }) {
    if (
      this.props.holeSize !== holeSize ||
      this.state.holePositionX !== holePositionX ||
      this.state.holePositionY !== holePositionY ||
      this.state.pictureHeight !== pictureHeight ||
      this.state.pictureWidth !== pictureWidth
    ) {
      this._calculateDraggableBounds()
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
    } = this.state
    const {
      holeSize,
    } = this.props
    this.setState({
      bounds: {
        top: holePositionY + holeSize - pictureHeight,
        left: holePositionX + holeSize - pictureWidth,
        bottom: holePositionY,
        right: holePositionX,
      },
    })
  }

  /**
   * Calculate position on picture (with hole offset)
   * Call onChange props function to inform parent component
   * @param {Object} event - event data
   * @param {Object} data - draggable data
   */
  onDragStop(_, { x, y }) {
    const { holePositionX, holePositionY } = this.state
    const { holeSize } = this.props
    const picturePositionX = holePositionX - x
    const picturePositionY = holePositionY - y
    this.setState({
      picturePositionX,
      picturePositionY,
    })
    this.props.onChange({
      x: picturePositionX,
      y: picturePositionY,
      width: holeSize,
      height: holeSize,
    })
  }

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

  render() {
    const { src } = this.props
    const { bounds } = this.state
    return (
      <div>
        <div
          className={styles.wrapper}
          ref={this.wrapperRef}
        >
          <Draggable
            onStop={this.onDragStop}
            bounds={bounds}
          >
            <img
              ref={this.pictureRef}
              src={src}
              alt='Image to crop'
              draggable={false}
              onLoad={this.onImageLoaded}
            />
          </Draggable>
          { this.renderHole() }
        </div>
      </div>
    )
  }
}

Cropper.propTypes = {
  src: PropTypes.string.isRequired,
  holeSize: PropTypes.number,
  onChange: PropTypes.func.isRequired,
}

Cropper.defaultProps = {
  holeSize: 150,
}
