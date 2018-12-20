import React, { Component } from 'react'
// import PropTypes from 'prop-types'
import Draggable from 'react-draggable'

import styles from './styles.css'

export default class Cropper extends Component {
  render() {
    return (
      <div className={styles.wrapper}>
        <Draggable>
          <img src='https://picsum.photos/500/300/?random' alt='random' draggable={false} />
        </Draggable>
      </div>
    )
  }
}
