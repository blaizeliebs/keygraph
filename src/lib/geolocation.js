let https = require('https')
let qs = require('querystring')
let Promise = require('bluebird')

function earhRadius(unitType) { // eslint-disable-line no-unused-vars
  if (unitType && unitType === 'imperial') {
    return 3959
  }
  return 6371
}

class Geolocation {

  constructor() {
    this.host = 'maps.googleapis.com'
    this.geocodePath = '/maps/api/geocode/json'
    this.timezonePath = '/maps/api/timezone/json'
    this.key = 'AIzaSyCarm2hpfRKWfpELwBKSq950KGbI_WkKBA'
  }

  geocode(latitude, longitude, multipe = true, raw = false) {
    return new Promise((resolve, reject) => {
      this.performRequest({
        latlng: latitude+','+longitude,
        sensor: false,
        key: this.key, // process.env.GOOGLE_API_KEY
      }, this.geocodePath)
      .then((data) => {
        return new Promise((resolve, reject) => {
          if (raw) {
            resolve(data)
          } else {
            this.parseData(data, multipe)
            .then((geodata) => {
              resolve(geodata)
            })
            .catch(reject)
          }
        })
      })
      .then((geodata) => {
        resolve(geodata)
      })
      .catch(reject)
    })
  }

  reverseGeocode(address, multipe = true, raw = false) {
    return new Promise((resolve, reject) => {
      this.performRequest({
        address: address,
        sensor: false,
        key: this.key, // process.env.GOOGLE_API_KEY
      }, this.geocodePath)
      .then((data) => {
        return new Promise((resolve, reject) => {
          if (raw) {
            resolve(data)
          } else {
            this.parseData(data, multipe)
            .then((geodata) => {
              resolve(geodata)
            })
            .catch(reject)
          }
        })
      })
      .then((geodata) => {
        resolve(geodata)
      })
      .catch(reject)
    })
  }

  parseData(data, returnMultiple) {
    return new Promise((resolve, reject) => {
      // console.log(data);
      if (!data) {
        reject(new Error('Geolocation lookup failed with error: NO_DATA'))
        return
      } else if (data.status !== 'OK') {
        // TODO: use more comprehensive errors
        reject(new Error('Geolocation lookup failed with error: '+data.status))
        return
      }
      let geoData = []
      for (let z = 0; z < data.results.length; z++) {
        let addressReturn = {
          areaName: '',
          center: {
            latitude: data.results[z].geometry.location.lat,
            longitude: data.results[z].geometry.location.lng,
          },
          streetAddress: data.results[z].formatted_address,
        }
        // console.log(JSON.stringify(data.results[z], null, 2));
        // process.exit(0);
        for (let x = 0; x < data.results[z].address_components.length; x++) {
          for (let y = 0; y < data.results[z].address_components[x].types.length; y++) {
            if (data.results[z].address_components[x].types[y] === 'administrative_area_level_1') {
              if (!addressReturn.regionName || addressReturn.regionName === '') {
                addressReturn.regionName = data.results[z].address_components[x].long_name
              }
            } else if (data.results[z].address_components[x].types[y] === 'administrative_area_level_2') {
              if (!addressReturn.countyName || addressReturn.countyName === '') {
                addressReturn.countyName = data.results[z].address_components[x].long_name
              }
            } else if (data.results[z].address_components[x].types[y] === 'locality') {
              if (!addressReturn.cityName || addressReturn.cityName === '') {
                addressReturn.cityName = data.results[z].address_components[x].long_name
              }
            } else if (data.results[z].address_components[x].types[y] === 'street_number') {
              console.log('STREET NUMBER: '+data.results[z].address_components[x].long_name)
              if (!addressReturn.address) {
                addressReturn.address = ''
              } else {
                addressReturn.address += ' '
              }
              addressReturn.address += data.results[z].address_components[x].long_name
            } else if (data.results[z].address_components[x].types[y] === 'route') {
              addressReturn.routeName = data.results[z].address_components[x].long_name
              console.log('ROUTE: '+data.results[z].address_components[x].long_name)
              if (!addressReturn.address) {
                addressReturn.address = ''
              } else {
                addressReturn.address += ' '
              }
              addressReturn.address += data.results[z].address_components[x].long_name
            } else if (data.results[z].address_components[x].types[y] === 'premise') {
              console.log('PREMISE: '+data.results[z].address_components[x].long_name)
              if (!addressReturn.address) {
                addressReturn.address = ''
              } else {
                addressReturn.address += ' '
              }
              addressReturn.address += data.results[z].address_components[x].long_name
            } else if (data.results[z].address_components[x].types[y] === 'neighborhood') {
              if (!addressReturn.neighborhood || addressReturn.neighborhood === '') {
                addressReturn.neighborhood = data.results[z].address_components[x].long_name
              }
            } else if (data.results[z].address_components[x].types[y] === 'postal_code') {
              if (addressReturn.zip || addressReturn.zip === '') {
                addressReturn.zip = data.results[z].address_components[x].long_name
              }
            } else if (data.results[z].address_components[x].types[y] === 'country') {
              if (!addressReturn.countryName || addressReturn.countryName === '') {
                addressReturn.countryName = data.results[z].address_components[x].long_name
              }
            } else if (data.results[z].address_components[x].types[y] === 'sublocality') {
              if (!addressReturn.areaName || addressReturn.areaName === '') {
                addressReturn.areaName = data.results[z].address_components[x].long_name
              }
            }
          }
        }
        /*
        if (data.results[z].geometry.bounds) {
          addressReturn.northeast = {
            latitude: data.results[z].geometry.bounds.northeast.lat,
            longitude: data.results[z].geometry.bounds.northeast.lng
          };
          addressReturn.southwest = {
            latitude: data.results[z].geometry.bounds.southwest.lat,
            longitude: data.results[z].geometry.bounds.southwest.lng
          };
        } else if(data.results[0].geometry.viewport) {
          addressReturn.northeast = {
            latitude: data.results[z].geometry.viewport.northeast.lat,
            longitude: data.results[z].geometry.viewport.northeast.lng
          };
          addressReturn.southwest = {
            latitude: data.results[z].geometry.viewport.southwest.lat,
            longitude: data.results[z].geometry.viewport.southwest.lng
          };
        }
        */
        let add = true
        if (!addressReturn.countryName) {
          add = false
        }
        if (!addressReturn.address) {
          add = false
        }
        if (add) {
          // TODO: timezone.
          // https://developers.google.com/maps/documentation/timezone/intro
          addressReturn.timezone = 'TODO'
          geoData.push(addressReturn)
        }
      }
      if (!geoData.length) {
        reject(new Error('Geolocation lookup failed with error: NO_RESULTS'))
      }
      if (returnMultiple) {
        Promise.each(geoData, (geoItem) => {
          return new Promise((resolve, reject) => {
            let { latitude, longitude } = geoItem.center
            this.getTimezone(latitude, longitude)
            .then(timezone => {
              geoItem.timezone = timezone.timeZoneId
              resolve()
            })
            .catch(reject)
          })
        })
        .then(() => {
          resolve(geoData)
        })
        .catch(reject)
      } else {
        var location = geoData[0]
        let { latitude, longitude } = location.center
        this.getTimezone(latitude, longitude)
        .then(timezone => {
          location.timezone = timezone.timeZoneId
          resolve(location)
        })
        .catch(reject)
      }
    })
  }

  getTimezone(latitude, longitude) {
    return new Promise((resolve, reject) => {
      this.performRequest({
        location: latitude+','+longitude,
        timestamp: parseInt(Date.now() / 100),
        key: this.key, // process.env.GOOGLE_API_KEY
      }, this.timezonePath)
      .then((data) => {
        if (!data) {
          reject(new Error('Timezone lookup failed with error: NO_DATA'))
          return
        } else if (data.status !== 'OK') {
          // TODO: use more comprehensive errors
          reject(new Error('Timezone lookup failed with error: '+data.status))
          return
        }
        resolve(data)
      })
      .catch(reject)
    })
  }

  performRequest(params, path) {
    let query = '?'+qs.stringify(params)
    console.log(query)
    return new Promise((resolve, reject) => {
      let req = https.request({
        host: this.host,
        path: path+query,
        method: 'GET',
      }, (response) => {
        let body = ''
        response.on('data', (data) => {
          body += data
        })
        response.on('end', () => {
          let jsonData = JSON.parse(body)
          resolve(jsonData)
        })
        response.on('error', (err) => {
          reject(err)
        })
      })
      req.on('error', (err) => {
        reject(err)
      })
      req.end()
    })
  }

}

module.exports = Geolocation
