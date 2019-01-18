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

/**
 * Extract EXIF rotation from Blob
 */
export const extractExifRotationFromBlob = (blob) => {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = ({ target: { result } }) => resolve(result)
    reader.readAsArrayBuffer(blob)
  })
    .then(extractExifRotationFromArrayBuffer)
}

/**
 * Extract EXIF rotation from Array Buffer object
 * @param {ArrayBuffer} arrayBuffer
 */
export const extractExifRotationFromArrayBuffer = arrayBuffer => {
  return new Promise(resolve => {
    const view = new DataView(arrayBuffer)
    if (view.getUint16(0, false) !== 0xFFD8) {
      resolve(0)
      return
    }
    const length = view.byteLength
    let offset = 2
    while (offset < length) {
      if (view.getUint16(offset + 2, false) <= 8) {
        resolve(0)
        return
      }
      const marker = view.getUint16(offset, false)
      offset += 2
      if (marker === 0xFFE1) {
        if (view.getUint32(offset += 2, false) !== 0x45786966) {
          resolve(0)
          return
        }

        const little = view.getUint16(offset += 6, false) === 0x4949
        offset += view.getUint32(offset + 4, little)
        const tags = view.getUint16(offset, little)
        offset += 2
        for (var i = 0; i < tags; i++) {
          if (view.getUint16(offset + (i * 12), little) === 0x0112) {
            resolve(convertExifRotationToDegrees(view.getUint16(offset + (i * 12) + 8, little)))
            return
          }
        }
      } else if ((marker & 0xFF00) !== 0xFF00) {
        break
      } else {
        offset += view.getUint16(offset, false)
      }
    }
    resolve(0)
  })
}

/**
 * Convert EXIF rotation to degrees rotation
 * @param {Number} rotation
 */
const convertExifRotationToDegrees = (rotation) => {
  let rotationInDegrees = 0
  switch (rotation) {
    case 8:
      rotationInDegrees = 270
      break
    case 6:
      rotationInDegrees = 90
      break
    case 3:
      rotationInDegrees = 180
      break
    default:
      rotationInDegrees = 0
  }
  return rotationInDegrees
}
