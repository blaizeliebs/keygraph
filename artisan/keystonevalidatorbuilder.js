let _ = require('underscore')
let {
  isAbstractType,
} = require('graphql')
let Builder = require('./builder')
let CodeGen = require('./codegen')

class KeystoneValidatorBuilder extends Builder {

  constructor(schema, entityData) {
    super(schema, entityData)
  }

  build() {
    let { entity, interfaceName, hasList, hasMutations, hasSubscription, hasDatasource, isInterface } = this.entityData
    if (interfaceName || !hasDatasource) {
      return
    }
    let code = new CodeGen()
    code.addBlock(`
      let keystone = require('keystone')
      let Promise = require('bluebird')

      let preInsert = (model) => {
        return new Promise((resolve, reject) => {
          resolve()
        })
      }

      let preUpdate = (model) => {
        return new Promise((resolve, reject) => {
          resolve()
        })
      }

      let preDelete = (model) => {
        return new Promise((resolve, reject) => {
          resolve()
        })
      }

      let postInsert = (model) => {
        return new Promise((resolve, reject) => {
          resolve()
        })
      }

      let postUpdate = (model) => {
        return new Promise((resolve, reject) => {
          resolve()
        })
      }

      let postDelete = (model) => {
        return new Promise((resolve, reject) => {
          resolve()
        })
      }

      module.exports = {
        preInsert,
        preUpdate,
        preDelete,
        postInsert,
        postUpdate,
        postDelete,
      }

    `)
    return code.toString()
  }

}

module.exports = KeystoneValidatorBuilder
