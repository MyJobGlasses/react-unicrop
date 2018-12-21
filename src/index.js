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
    this.setState({
      wrapperHeight,
      wrapperWidth,
      holePositionY: (wrapperHeight - 150) / 2,
      holePositionX: (wrapperWidth - 150) / 2,
    })
  }

  onDragStop(_, data) {
    const { holePositionX, holePositionY } = this.state
    const { x, y } = data
    const picturePositionX = x - holePositionX
    const picturePositionY = y - holePositionY
    this.setState({
      picturePositionX,
      picturePositionY,
    })
  }

  render() {
    const {
      src,
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
        </div>
      </div>
    )
  }
}

Cropper.propTypes = {
  src: PropTypes.string.isRequired,
}
