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

      let validate${entity.UCFCCSingular} = (model, cms = false) => {
        return new Promise((resolve, reject) => {
          resolve()
        })
      }

      module.exports = validate${entity.UCFCCSingular}

    `)
    return code.toString()
  }

}

module.exports = KeystoneValidatorBuilder
