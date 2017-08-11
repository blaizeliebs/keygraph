import * as _ from 'underscore'
import {
  isAbstractType,
} from 'graphql'
import Builder from './builder'
import CodeGen from './codegen'

class ListBuilder extends Builder {

  constructor(schema, entityData) {
    super(schema, entityData)
  }

  build() {
    let { entity, interfaceName, hasList, hasMutations, hasSubscription, hasDatasource, isInterface } = this.entityData
    let code = new CodeGen()
    code.reset()
    code.addBlock(`
      import ${entity.UCFCCSingular} from './data'

      let ${entity.UCFCCSingular}ListMixin = (superclass, filterName = false) => class extends superclass {

        constructor(data) {
          super(data)
        }
        all${entity.UCFCCPlural}(args, ctx, info) {
          if (filterName) {
            if (!args.filters) {
              args.filters = {}
            }
            args.filters[filterName] = this._id
          }
          return ${entity.UCFCCSingular}.list(args, ctx, info)
        }
        one${entity.UCFCCSingular}(args, ctx, info) {
          if (filterName) {
            if (!args.filters) {
              args.filters = {}
            }
            args.filters[filterName] = this._id
          }
          return ${entity.UCFCCSingular}.one(args, ctx, info)
        }
        ${entity.LCFCCSingular}Count(args, ctx, info) {
          if (filterName) {
            if (!args.filters) {
              args.filters = {}
            }
            args.filters[filterName] = this._id
          }
          return ${entity.UCFCCSingular}.count(args, ctx, info)
        }
      }

      export default ${entity.UCFCCSingular}ListMixin
    `)

    return code.toString()
  }

}

export default ListBuilder
