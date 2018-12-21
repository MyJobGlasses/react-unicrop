import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Draggable from 'react-draggable'

import styles from './styles.css'

export default class Cropper extends Component {
  constructor(props) {
    super(props)
    this.onDragStop = this.onDragStop.bind(this)
    this.state = {
      wrapperHeight: 0,
      wrapperWidth: 0,
      holePositionX: 0,
      holePositionY: 0,
      picturePositionX: 0,
      picturePositionY: 0,
    }
    this.wrapperRef = React.createRef()
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

  onDragStop(_, data) {
    const { holePositionX, holePositionY } = this.state
    const { holeSize } = this.props
    const { x, y } = data
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

  render() {
    const {
      src,
      holeSize,
    } = this.props
    return (
      <div>
        <div
          className={styles.wrapper}
          ref={this.wrapperRef}
        >
          <Draggable
            onStop={this.onDragStop}
          >
            <img src={src} alt='random' draggable={false} />
          </Draggable>
          <div
            className={styles.hole}
            style={{
              width: holeSize,
              height: holeSize,
            }}
          />
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
