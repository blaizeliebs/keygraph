import Config from '../config'

class Defaults {

  static imageTypes = {
    logo: {
      small: `${Config.getDefaultsUrl()}/small-image.png`,
      medium: `${Config.getDefaultsUrl()}/medium-image.png`,
      large: `${Config.getDefaultsUrl()}/large-image.png`,
    },
    icon: {
      small: `${Config.getDefaultsUrl()}/small-image.png`,
      medium: `${Config.getDefaultsUrl()}/medium-image.png`,
      large: `${Config.getDefaultsUrl()}/large-image.png`,
    },
    image: {
      small: `${Config.getDefaultsUrl()}/small-image.png`,
      medium: `${Config.getDefaultsUrl()}/medium-image.png`,
      large: `${Config.getDefaultsUrl()}/large-image.png`,
    },
  };

  static getDefault(testObj, type = 'logo', size = 'medium') {
    if (testObj && testObj.location) {
      return testObj.location
    }
    return this.imageTypes[type][size]
  }

}

export default Defaults
