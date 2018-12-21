import React from 'react'
import PropTypes from 'prop-types'

import styles from './Preview.css'

const Preview = ({
  src,
  width,
  height,
  x,
  y,
  zoom,
}) => (
  <div
    className={styles.wrapper}
    style={{
      width: width * zoom,
      height: height * zoom,
    }}
  >
    <img
      src={src}
      alt='Previewed crop image'
      style={{
        transformOrigin: '0 0',
        transform: `translate(-${x}px, -${y}px) scale(${zoom})`,
      }}
    />
  </div>
)

Preview.propTypes = {
  src: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  zoom: PropTypes.number,
}

Preview.defaultProps = {
  zoom: 1,
}

export default Preview
