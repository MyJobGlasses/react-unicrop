import React, { Component } from 'react'

import Cropper, { Preview } from 'react-unicrop'

export default class App extends Component {
  constructor (props) {
    super(props);
    this.handleCropChange = this.handleCropChange.bind(this)
    this.state = {
      src: `https://picsum.photos/300/300/?random`,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      zoom: 1,
      rotation: 0,
    }
  }

  handleCropChange (data) {
    const {
      x,
      y,
      width,
      height,
      zoom,
      rotation,
    } = data
    this.setState({
      x,
      y,
      width,
      height,
      zoom,
      rotation,
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
      rotation,
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
          width='100%'
          enableZoomActions
          enableRotateActions
        />
        <Preview
          src={src}
          x={x}
          y={y}
          width={width}
          height={height}
          zoom={zoom}
          rotation={rotation}
        />
      </div>
    )
  }
}
