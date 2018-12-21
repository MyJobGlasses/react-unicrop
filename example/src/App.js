import React, { Component } from 'react'

import Cropper from 'react-unicrop'

export default class App extends Component {
  render () {
    return (
      <div>
        <Cropper
          src={`https://picsum.photos/${Math.floor(Math.random() * 500) + 500}/${Math.floor(Math.random() * 300) + 300}/?random`}
        />
      </div>
    )
  }
}
