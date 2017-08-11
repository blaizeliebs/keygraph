import * as _ from 'underscore'
import {
  isAbstractType,
} from 'graphql'
import Builder from './builder'
import CodeGen from './codegen'

class IndexBuilder extends Builder {

  constructor(schema, entityData) {
    super(schema, entityData)
  }

  build() {
    let { entity, interfaceName, hasList, hasMutations, hasSubscription, hasDatasource, isInterface } = this.entityData
    let code = new CodeGen()
    code.reset()
    code.addLine(`import ${entity.UCFCCSingular} from './data'`)
    code.addLine(`import ${entity.LCFCCSingular}Schema from './schema'`)
    if (false) { // hasList) {
      code.addLine(`import ${entity.UCFCCSingular}ListMixin from './list'`)
    }
    if (hasMutations && !isInterface) {
      code.addLine(`import ${entity.LCFCCSingular}Mutations from './mutations'`)
    }
    code.addLine(``)
    code.addLine(`export {`)
    code.addInsetLine(`${entity.UCFCCSingular} as default,`)
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

export default IndexBuilder
