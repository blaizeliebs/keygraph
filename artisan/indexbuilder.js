let _ = require('underscore')
let {
  isAbstractType,
} = require('graphql')
let Builder = require('./builder')
let CodeGen = require('./codegen')

class IndexBuilder extends Builder {

  constructor(schema, entityData) {
    super(schema, entityData)
  }

  build() {
    let { entity, interfaceName, hasList, hasMutations, hasSubscription, hasDatasource, isInterface } = this.entityData
    let code = new CodeGen()
    code.reset()
    code.addLine(`let ${entity.UCFCCSingular} = require('./object')`)
    code.addLine(`let ${entity.UCFCCSingular}Model = require('./model')`)
    code.addLine(`let ${entity.LCFCCSingular}Schema = require('./schema')`)
    if (false) { // hasList) {
      code.addLine(`let ${entity.UCFCCSingular}ListMixin = require('./list')`)
    }
    if (hasMutations && !isInterface) {
      code.addLine(`let ${entity.LCFCCSingular}Mutations = require('./mutations')`)
    }
    code.addLine(``)
    code.addLine(`module.exports = {`)
      code.addInsetLine(`${entity.UCFCCSingular},`)
    code.addLine(`${entity.UCFCCSingular}Model,`)
    code.addLine(`${entity.LCFCCSingular}Schema,`)
    if (false) { // hasList) {
      code.addLine(`${entity.UCFCCSingular}ListMixin,`)
    }
    if (hasMutations && !isInterface) {
      code.addLine(`${entity.LCFCCSingular}Mutations`)
    }
    code.addOutsetLine(`}`)

    return code.toString()
  }

}

module.exports = IndexBuilder
