import * as _ from 'underscore'
import Promise from 'bluebird'

let instance = null

let cacheStatusEnum = {
  CACHED: 'cached',
  NOT_CACHED: 'notCached',
  CACHING: 'caching',
}

class ImageCache {

  images = []

  static shared() {
    if (!instance) {
      instance = new ImageCache()
    }
    return instance
  }

  isCached(url) {
    let entry = _.find(this.images, (image) => {
      return image.url === url
    })
    if (entry) {
      return entry
    }
    return { status: cacheStatusEnum.NOT_CACHED }
  }

  cache(url) {
    return new Promise((resolve, reject) => {
      let cache = this.isCached(url)
      if (cache.status === cacheStatusEnum.CACHED) {
        return resolve(url)
      } else if (cache.status === cacheStatusEnum.CACHING) {
        cache.callbacks.push((url) => {
          return resolve(url)
        })
      } else {
        let image = new Image()
        let newCache = {
          url: url,
          status: cacheStatusEnum.CACHING,
          callbacks: [],
        }
        this.images.push(newCache)
        image.onload = (e) => {
          _.each(newCache.callbacks, (callback) => {
            callback(image.src)
          })
          newCache.callbacks = []
          newCache.status = cacheStatusEnum.CACHED
          resolve(image.src)
        }
        image.src = url
      }
    })
  }

}

export default ImageCache
