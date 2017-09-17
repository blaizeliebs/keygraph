let _ = require('underscore')
let {
  isAbstractType,
} = require('graphql')
let Builder = require('./builder')
let CodeGen = require('./codegen')

class MutationBuilder extends Builder {

  constructor(schema, entityData) {
    super(schema, entityData)
  }

  build() {
    let { entity, interfaceName, hasList, hasMutations, hasSubscription, hasDatasource, isInterface } = this.entityData
    let code = new CodeGen()
    code.reset()
    code.addLine(`let ${entity.UCFCCSingular}Model = require('./model')`)
    code.addLine(`let APIPublicUser = require('../../../lib/apipublicuser')`)
    code.openClass(`${entity.UCFCCSingular}Mutations`)
    code.openFunction(`add`, `args, ctx`)
    if (hasDatasource) {
      code.addLine(`return ${entity.UCFCCSingular}Model.add(args, ctx)`)
    } else {
      code.addLine(`throw new Error(JSON.stringify({ message: '${entity.UCFCCSingular} mutations not implemented', code: 500 }))`)
    }
    code.closeFunction()
    code.openFunction(`update`, `args, ctx`)
    if (hasDatasource) {
      code.addLine(`return ${entity.UCFCCSingular}Model.update(args, ctx)`)
    } else {
      code.addLine(`throw new Error(JSON.stringify({ message: '${entity.UCFCCSingular} mutations not implemented', code: 500 }))`)
    }
    code.closeFunction()
    code.openFunction(`remove`, `args, ctx`)
    if (hasDatasource) {
      code.addLine(`return ${entity.UCFCCSingular}Model.remove(args, ctx)`)
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

      module.exports = ${entity.LCFCCSingular}Mutations
    `)

    return code.toString()
  }

}

module.exports = MutationBuilder
