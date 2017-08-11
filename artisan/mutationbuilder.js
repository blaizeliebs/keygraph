import * as _ from 'underscore'
import {
  isAbstractType,
} from 'graphql'
import Builder from './builder'
import CodeGen from './codegen'

class MutationBuilder extends Builder {

  constructor(schema, entityData) {
    super(schema, entityData)
  }

  build() {
    let { entity, interfaceName, hasList, hasMutations, hasSubscription, hasDatasource, isInterface } = this.entityData
    let code = new CodeGen()
    code.reset()
    code.addLine(`import ${entity.UCFCCSingular} from './data'`)
    code.addLine(`import APIPublicUser from '../../../lib/apipublicuser'`)
    code.openClass(`${entity.UCFCCSingular}Mutations`)
    code.openFunction(`add`, `args, ctx`)
    if (hasDatasource) {
      code.addLine(`return ${entity.UCFCCSingular}.add(args, ctx)`)
    } else {
      code.addLine(`throw new Error(JSON.stringify({ message: '${entity.UCFCCSingular} mutations not implemented', code: 500 }))`)
    }
    code.closeFunction()
    code.openFunction(`update`, `args, ctx`)
    if (hasDatasource) {
      code.addLine(`return ${entity.UCFCCSingular}.update(args, ctx)`)
    } else {
      code.addLine(`throw new Error(JSON.stringify({ message: '${entity.UCFCCSingular} mutations not implemented', code: 500 }))`)
    }
    code.closeFunction()
    code.openFunction(`remove`, `args, ctx`)
    if (hasDatasource) {
      code.addLine(`return ${entity.UCFCCSingular}.remove(args, ctx)`)
    } else {
      code.addLine(`throw new Error(JSON.stringify({ message: '${entity.UCFCCSingular} mutations not implemented', code: 500 }))`)
    }
    code.closeFunction()
    code.closeClass()
    code.addBlock(`
      let ${entity.LCFCCSingular}MutationsObject = new ${entity.UCFCCSingular}Mutations()

      const ${entity.LCFCCSingular}Mutations = {
        add${entity.UCFCCSingular}:(obj, args, ctx, info) => ${entity.LCFCCSingular}MutationsObject.add(args, ctx),
        update${entity.UCFCCSingular}:(obj, args, ctx, info) => ${entity.LCFCCSingular}MutationsObject.update(args, ctx),
        remove${entity.UCFCCSingular}:(obj, args, ctx, info) => ${entity.LCFCCSingular}MutationsObject.remove(args, ctx)
      }

      export default ${entity.LCFCCSingular}Mutations
    `)

    return code.toString()
  }

}

export default MutationBuilder
