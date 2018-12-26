import React from 'react'
import PropTypes from 'prop-types'

import styles from './Preview.css'

class Preview extends React.PureComponent {
  constructor(props) {
    super(props)
    this.handleImageLoad = this.handleImageLoad.bind(this)
    this.state = {
      pictureWidth: 0,
      pictureHeight: 0,
    }
  }

  handleImageLoad(e) {
    const pictureHeight = e.target.clientHeight
    const pictureWidth = e.target.clientWidth
    this.setState({
      pictureHeight,
      pictureWidth,
    })
  }

  render() {
    const {
      src,
      width,
      height,
      x,
      y,
      zoom,
      rotation,
    } = this.props
    const {
      pictureHeight,
      pictureWidth,
    } = this.state
    return (
      <div
        className={styles.wrapper}
        style={{
          width: width * zoom,
          height: height * zoom,
        }}
      >
        <div
          style={{
            transform: `translate(-${x}px, -${y}px)`,
            position: 'relative',
            width: (rotation / 90) % 2 === 0 ? pictureWidth : pictureHeight,
            height: (rotation / 90) % 2 === 0 ? pictureHeight : pictureWidth,
          }}
        >
          <img
            src={src}
            alt='Previewed crop image'
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transformOrigin: '50% 50%',
              transform: `translate(-50%, -50%) scale(${zoom}) rotateZ(${rotation}deg)`,
            }}
            onLoad={this.handleImageLoad}
          />
        </div>
      </div>
    )
  }
}

Preview.propTypes = {
  src: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  zoom: PropTypes.number,
  rotation: PropTypes.number,
}

Preview.defaultProps = {
  zoom: 1,
}

export default Preview
