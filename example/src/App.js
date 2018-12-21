import React, { Component } from 'react'

import Cropper, { Preview } from 'react-unicrop'

export default class App extends Component {
  constructor (props) {
    super(props);
    this.handleCropChange = this.handleCropChange.bind(this)
    this.state = {
      src: `https://picsum.photos/${Math.floor(Math.random() * 500) + 500}/${Math.floor(Math.random() * 300) + 300}/?random`,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      zoom: 0,
    }
  }

  handleCropChange (data) {
    const {
      x,
      y,
      width,
      height,
      zoom,
    } = data
    this.setState({
      x,
      y,
      width,
      height,
      zoom,
    })
  }

  render () {
    const {
      src,
      x,
      y,
      width,
      height,
      zoom,
    } = this.state
    return (
      <div>
        <Cropper
          src={src}
          onChange={this.handleCropChange}
          holePosition={{
            top: 10,
            left: 'center',
          }}
          enableZoomActions
        />
        <Preview
          src={src}
          x={x}
          y={y}
          width={width}
          height={height}
          zoom={zoom}
        />
      </div>
    )
  }
}
