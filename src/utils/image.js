const { FileReader } = window

/**
 * Remove EXIF informations from a blob
 * (for example: remove orient informations)
 * @param {Blob} blob
 * @returns {Promise}
 */
export const removeExifFromBlob = (blob) => {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = ({ target: { result } }) => resolve(result)
    reader.readAsArrayBuffer(blob)
  })
    .then(removeExifDataFromArrayBuffer)
}

/**
 * Remove EXIF data from an array buffer
 * @param {ArrayBuffer} arrayBuffer
 * @returns {Promise}
 * @url http://jsfiddle.net/mowglisanu/frhwm2xe/3/
 */
export const removeExifDataFromArrayBuffer = (arrayBuffer) => {
  const dv = new DataView(arrayBuffer)
  let offset = 0
  let recess = 0
  let pieces = []
  let i = 0
  if (dv.getUint16(offset) === 0xffd8) {
    offset += 2
    let app1 = dv.getUint16(offset)
    offset += 2
    while (offset < dv.byteLength) {
      if (app1 === 0xffe1) {
        pieces[i] = { recess: recess, offset: offset - 2 }
        recess = offset + dv.getUint16(offset)
        i++
      } else if (app1 === 0xffda) {
        break
      }
      offset += dv.getUint16(offset)
      app1 = dv.getUint16(offset)
      offset += 2
    }
    if (pieces.length > 0) {
      const newPieces = []
      pieces.forEach(v => newPieces.push(arrayBuffer.slice(v.recess, v.offset)))
      newPieces.push(arrayBuffer.slice(recess))
      const br = new window.Blob(newPieces, { type: 'image/jpeg' })
      return new Promise(resolve => {
        const reader = new window.FileReader()
        reader.readAsDataURL(br)
        reader.onload = () => resolve(reader.result)
      })
    }
  }
}
